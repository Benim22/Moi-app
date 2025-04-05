# Notifikationssystem för Moi Sushi

Detta dokument beskriver hur notifikationssystemet för Moi Sushi-appen fungerar och hur det kan användas.

## Översikt

Notifikationssystemet i Moi Sushi-appen använder Expo Notifications för att hantera både lokala och push-notifikationer. Systemet stödjer flera typer av notifikationer och kan anpassas för olika användningsfall.

### Huvudfunktioner

- Registrering för push-notifikationer och behörighetshantering
- Lagring av användarens push-token i databasen
- Typade notifikationer för olika händelser (order, kampanjer, app-uppdateringar)
- Separata Android-notifikationskanaler för olika kategorier
- Testverktyg för notifikationer

## Installation och konfiguration

Systemet använder expo-notifications som måste installeras i projektet:

```bash
expo install expo-notifications
```

För att stödja push-notifikationer på Android behöver en Google Firebase-konfiguration skapas och `google-services.json` läggas till i projektmappen.

För att appen ska kunna skicka push-notifikationer måste den vara publicerad via EAS (Expo Application Services).

## Teknisk arkitektur

Systemet består av flera komponenter:

1. **Notifikationsbibliotek (`lib/notifications/index.ts`)**: Huvudbiblioteket med funktioner för hantering av notifikationer
2. **Typdefinitioner (`lib/notifications/types.ts`)**: Definierar olika typer av notifikationer och hjälpfunktioner
3. **Notifikationshanterare (`components/NotificationsManager.tsx`)**: React-komponent som lyssnar på och hanterar notifikationer
4. **Testverktyg (`components/TestNotifications.tsx`)**: Komponent för att testa olika typer av notifikationer

## Databaseändringar

Systemet kräver att en `push_token`-kolumn läggs till i `profiles`-tabellen:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_token TEXT;
```

## Användning

### Registrera för notifikationer

För att registrera en användare för notifikationer:

```typescript
import { registerForPushNotificationsAsync, updatePushToken } from '@/lib/notifications';

// Vid inloggning eller app-start
const token = await registerForPushNotificationsAsync();
if (token && user) {
  await updatePushToken(user.id, token);
}
```

### Skicka notifikationer

#### Skicka orderstatusuppdateringar:

```typescript
import { sendOrderStatusNotification } from '@/lib/notifications';

// När en orderstatus ändras
await sendOrderStatusNotification(userId, orderId, 'completed');
```

#### Skicka typad notifikation:

```typescript
import { sendTypedNotification, NotificationType } from '@/lib/notifications';

// Skapa notifikationsdata
const notificationData = {
  type: NotificationType.PROMO_DISCOUNT,
  data: {
    discount: '15%',
    promoCode: 'MOI15'
  }
};

// Hämta användartoken och skicka notifikation
const token = await getUserPushToken(userId);
if (token) {
  await sendTypedNotification(token, notificationData);
}
```

### Lyssna på notifikationer

NotificationsManager-komponenten lyssnar automatiskt på notifikationer och hanterar navigering baserat på notifikationsdata. För att lägga till egen hantering:

```typescript
import * as Notifications from 'expo-notifications';

// Lyssna på inkommande notifikationer
const subscription = Notifications.addNotificationReceivedListener(notification => {
  console.log('Notifikation mottagen:', notification);
  // Hantera notifikation här
});

// Städa upp när komponenten avmonteras
return () => subscription.remove();
```

## Typer av notifikationer

Systemet stödjer följande typer av notifikationer:

### Order-relaterade notifikationer
- `ORDER_PLACED`: När en order har lagts
- `ORDER_ACCEPTED`: När personalen accepterar en order
- `ORDER_PROCESSING`: När ordern börjar tillagas
- `ORDER_COMPLETED`: När ordern är redo för upphämtning
- `ORDER_CANCELLED`: När ordern har avbrutits

### Kampanj/marknadsföringsnotifikationer
- `PROMO_NEW`: Nya kampanjer eller produkter
- `PROMO_DISCOUNT`: Rabatterbjudanden
- `PROMO_SPECIAL`: Speciella händelser

### App-relaterade notifikationer
- `APP_UPDATE`: App-uppdateringar
- `PROFILE_UPDATE`: Profiluppdateringar

## Test av notifikationer

En testkomponent har skapats för att testa olika typer av notifikationer:

```typescript
import TestNotifications from '@/components/TestNotifications';

// Lägg till i en valfri vy för testning
<TestNotifications />
```

## Utökningsmöjligheter

Notifikationssystemet kan enkelt utökas med nya typer av notifikationer genom att lägga till nya typer i `NotificationType`-enum och uppdatera `getNotificationTitle` och `getNotificationBody`-funktionerna.

### Potentiella ytterligare funktioner:

1. **Schemalagda notifikationer** - t.ex. påminnelser om ordern inte har hämtats
2. **Lokal notifikationshistorik** - spara notifikationer lokalt för senare visning
3. **Notifikationsfiltrering** - låta användaren filtrera vilka typer av notifikationer de vill få
4. **Rich notifications** - lägga till bilder, åtgärdsknappar i notifikationer
5. **Notifikationsljud** - anpassade ljud för olika typer av notifikationer

## Felsökning

Om notifikationer inte fungerar som förväntat, kontrollera följande:

1. Säkerställ att användaren har gett behörighet för notifikationer
2. Kontrollera att push-token har sparats korrekt i databasen
3. Verifiera att enheten är ansluten till internet
4. För Android, kontrollera att notifikationskanalerna har konfigurerats korrekt
5. För fysiska enheter, verifiera att Expo Push-tjänsten fungerar korrekt

## Serversdel (för framtida implementation)

För en mer robust lösning kan ett server-API skapas för att hantera push-notifikationer centralt, vilket skulle möjliggöra:

1. Batch-utskick av notifikationer
2. Schemaläggning av notifikationer
3. Notifikationsanalys och spårning
4. Användarspecifik anpassning av notifikationer
5. Enklare hantering av användarpreferenser 