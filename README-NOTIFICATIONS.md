# Push-Notifikationssystem för Moi Sushi

Detta dokument beskriver hur det uppdaterade push-notifikationssystemet för Moi Sushi-appen fungerar.

## Översikt

Notifikationssystemet använder **endast push-notifikationer** via Expo Push API. Alla in-app notifikationer har tagits bort för en renare användarupplevelse.

### Huvudfunktioner

- Automatiska push-notifikationer till admins vid nya bokningar och beställningar
- Push-notifikationer till användare när deras beställningar slutförs eller avbryts
- Rollbaserade notifikationer (admin vs användare)
- Automatisk registrering och lagring av push tokens
- Exponentiellt skalbart via Expo Push API

## Teknisk arkitektur

### Nya komponenter:

1. **`utils/PushNotificationService.ts`**: Huvudtjänst för push-notifikationer
2. **`utils/NotificationManager.ts`**: Uppdaterad med stöd för push tokens
3. **`store/notification-store.ts`**: Förenklad för endast push-notiser

### Borttagna komponenter:
- `components/InAppNotification.tsx` 
- `components/NotificationContainer.tsx`
- `components/TestNotifications.tsx`

## Push-Notifikationer

### För Admins:

#### Ny bordbokning 🍽️
- **Trigger**: När kund bokar bord via `/booking`
- **Meddelande**: "Ny bordbokning - [Namn] har bokat bord för [antal] personer den [datum] kl [tid]"

#### Ny beställning 🛒  
- **Trigger**: När kund lägger order via `/checkout`
- **Meddelande**: "Ny beställning - [Namn] har lagt en order på [pris] kr ([antal] produkter)"

### För Användare:

#### Order slutförd ✅
- **Trigger**: Admin klickar "Slutför" i admin/orders
- **Meddelande**: "Din beställning är klar! - Din mat är färdig och väntar på att hämtas eller levereras."

#### Order avbruten ❌
- **Trigger**: Admin klickar "Avbryt" i admin/orders  
- **Meddelande**: "Beställning avbruten - Din beställning har tyvärr avbrutits. Kontakta restaurangen för mer information."

## Implementation

### Push Token-hantering

Push tokens sparas automatiskt i `profiles.push_token` när användare loggar in:

```typescript
// Auto-sparas i store/notification-store.ts
await supabase
  .from('profiles')
  .update({ push_token: token })
  .eq('id', user.id);
```

### Rollbaserade Notifikationer

Systemet identifierar admins via `profiles.role = 'admin'`:

```typescript
// Skicka till alla admins
await PushNotificationService.notifyAdmins({
  title: "Ny bordbokning",
  body: "Kund har bokat bord...",
  sound: true,
  priority: 'high'
});
```

### Automatiska Triggers

1. **Booking**: `app/(tabs)/booking.tsx` → `notifyAdminsNewBooking()`
2. **Order**: `store/orders-store.ts` → `notifyAdminsNewOrder()`  
3. **Status**: `app/admin/orders.tsx` → `notifyUserOrderCompleted/Cancelled()`

## API-struktur

### PushNotificationService metoder:

```typescript
// Till admins
notifyAdmins(payload: PushNotificationPayload)
notifyAdminsNewBooking(booking: BookingData)
notifyAdminsNewOrder(order: OrderData)

// Till användare  
notifyUser(userId: string, payload: PushNotificationPayload)
notifyUserOrderCompleted(userId: string, orderId: string, customerName: string)
notifyUserOrderCancelled(userId: string, orderId: string, customerName: string)
```

## Dataflöde

### Ny bokning:
1. Kund fyller i bokningsformulär
2. Bokning sparas i databas
3. `PushNotificationService.notifyAdminsNewBooking()` triggas
4. Push-notis skickas till alla admins

### Ny beställning:
1. Kund slutför checkout
2. Order sparas via `orders-store.ts`
3. `PushNotificationService.notifyAdminsNewOrder()` triggas  
4. Push-notis skickas till alla admins

### Orderstatus-ändring:
1. Admin klickar "Slutför"/"Avbryt" i admin/orders
2. Status uppdateras i databas
3. `PushNotificationService.notifyUserOrderCompleted/Cancelled()` triggas
4. Push-notis skickas till kunden

## Fördelar med nya systemet

✅ **Renare UX** - Inga störande popups
✅ **Systemnotifikationer** - Visas i notification center  
✅ **Automatisk hantering** - Inga manuella steg
✅ **Rollbaserat** - Rätt personer får rätt notiser
✅ **Skalbart** - Fungerar för tusentals användare
✅ **Felhantering** - Robust error handling

Systemet kräver inga manuella steg - allt sker automatiskt baserat på användaråtgärder! 