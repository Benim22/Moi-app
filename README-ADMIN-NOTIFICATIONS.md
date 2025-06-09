# Admin-notifikationssystem för Moi Sushi

Detta dokument beskriver hur admin-notifikationssystemet fungerar för att meddela administratörer om nya beställningar och bordsbokningar.

## Översikt

Admin-notifikationssystemet skickar push-notifikationer till alla användare med `admin`-roll när:
- En ny beställning läggs av en kund
- En ny bordsbokning görs av en kund

Administratörer kan konfigurera vilka typer av notifikationer de vill få genom admin-inställningssidan.

## Funktioner

### 1. Automatiska notifikationer

#### Nya beställningar
- Skickas när en kund lägger en beställning via appen
- Innehåller kundens namn och totalpris
- Navigerar till orderhanteringssidan när användaren trycker på notifikationen

#### Nya bordsbokningar
- Skickas när en kund bokar ett bord via appen
- Innehåller kundens namn, datum, tid och antal gäster
- Navigerar till bokningshanteringssidan när användaren trycker på notifikationen

### 2. Inställningshantering

Administratörer kan:
- Aktivera/inaktivera specifika notifikationstyper
- Komma åt inställningarna via Admin Panel → Inställningar → Notifikationsinställningar
- Spara sina preferenser som lagras i databasen

## Teknisk implementation

### Databasstruktur

#### admin_notification_settings tabell
```sql
CREATE TABLE admin_notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(admin_id, notification_type)
);
```

#### Uppdaterad profiles tabell
- Lagt till `push_token` kolumn för att lagra Expo push-tokens

### Notifikationstyper

```typescript
enum NotificationType {
  ADMIN_NEW_ORDER = 'admin_new_order',
  ADMIN_NEW_BOOKING = 'admin_new_booking'
}
```

### Viktiga funktioner

#### `sendAdminNewOrderNotification()`
- Hämtar alla admin-användare med push-tokens
- Kontrollerar varje admins notifikationsinställningar
- Skickar notifikation endast till admins som har aktiverat ordernotifikationer

#### `sendAdminNewBookingNotification()`
- Hämtar alla admin-användare med push-tokens
- Kontrollerar varje admins notifikationsinställningar
- Skickar notifikation endast till admins som har aktiverat bokningsnotifikationer

### Android-notifikationskanaler

Systemet använder en dedikerad Android-kanal för admin-notifikationer:
- Kanal: `admin`
- Namn: "Admin-notifikationer"
- Prioritet: MAX (högsta prioritet)
- Ljus: Orange (#FF6B35)

## Användning

### För utvecklare

1. **Lägg till admin-notifikation i ny funktionalitet:**
```typescript
import { sendAdminNewOrderNotification } from '@/lib/notifications';

// Efter att en order har skapats
await sendAdminNewOrderNotification(orderId, customerName, totalPrice);
```

2. **Kontrollera admin-inställningar:**
```typescript
import { isNotificationEnabledForAdmin } from '@/lib/notifications';

const isEnabled = await isNotificationEnabledForAdmin(adminId, NotificationType.ADMIN_NEW_ORDER);
```

### För administratörer

1. Gå till Admin Panel
2. Välj "Inställningar" i navigeringen
3. Klicka på "Notifikationsinställningar"
4. Aktivera/inaktivera önskade notifikationstyper
5. Spara inställningarna

## Säkerhet

- Endast användare med `admin`-roll kan:
  - Se admin-notifikationsinställningar
  - Uppdatera sina egna notifikationsinställningar
  - Ta emot admin-notifikationer

- RLS (Row Level Security) används för att säkerställa att:
  - Admins endast kan se sina egna inställningar
  - Endast autentiserade admins kan komma åt admin-funktioner

## Felsökning

### Notifikationer kommer inte fram

1. **Kontrollera push-token:**
   - Verifiera att admin-användaren har en giltig push-token i databasen
   - Push-token registreras automatiskt när användaren loggar in

2. **Kontrollera notifikationsinställningar:**
   - Se till att admin-användaren har aktiverat relevant notifikationstyp
   - Standardinställning är aktiverat för alla notifikationstyper

3. **Kontrollera användarroll:**
   - Verifiera att användaren har `role = 'admin'` i profiles-tabellen

4. **Kontrollera enhetsspecifika inställningar:**
   - Se till att push-notifikationer är aktiverade i enhetens inställningar
   - Kontrollera att appen har behörighet att skicka notifikationer

### Vanliga fel

- **"Ingen profil hittades för användaren"**: Användaren saknar en profil i profiles-tabellen
- **"Inga admin-användare med push-tokens hittades"**: Inga admins är inloggade eller har giltiga push-tokens
- **"Fel vid kontroll av notifikationsinställning"**: Databasfel eller RLS-problem

## Framtida förbättringar

- Lägg till fler notifikationstyper (t.ex. låg lagerstatus, nya recensioner)
- Implementera schemalagda notifikationer
- Lägg till notifikationshistorik
- Implementera batch-notifikationer för flera händelser
- Lägg till ljudinställningar per notifikationstyp 