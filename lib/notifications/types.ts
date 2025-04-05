// Olika typer av notifikationer som kan skickas i appen
export enum NotificationType {
  // Order-relaterade notifikationer
  ORDER_PLACED = 'order_placed',      // När en order har lagts
  ORDER_ACCEPTED = 'order_accepted',  // När personalen accepterar en order
  ORDER_PROCESSING = 'order_processing', // När ordern börjar tillagas
  ORDER_COMPLETED = 'order_completed', // När ordern är redo för upphämtning
  ORDER_CANCELLED = 'order_cancelled', // När ordern har avbrutits
  
  // Kampanj/marknadsföringsnotifikationer
  PROMO_NEW = 'promo_new',           // Nya kampanjer
  PROMO_DISCOUNT = 'promo_discount', // Rabatter
  PROMO_SPECIAL = 'promo_special',   // Speciella händelser
  
  // App-relaterade notifikationer
  APP_UPDATE = 'app_update',         // App-uppdateringar
  PROFILE_UPDATE = 'profile_update', // Profiluppdateringar
  
  // Test-notifikation
  TEST = 'test'
}

// Datastruktur för varje notifikationstyp
export interface NotificationData {
  // Unik identifierare för notifikationen
  id?: string;
  
  // Typ av notifikation
  type: NotificationType;
  
  // Tidsstämpel för när notifikationen skapades
  timestamp?: number;
  
  // Ytterligare information anpassad efter notifikationstyp
  data?: {
    orderId?: string;        // För order-relaterade notifikationer
    orderStatus?: string;    // För order-relaterade notifikationer
    promoId?: string;        // För kampanj-relaterade notifikationer
    promoExpires?: number;   // För kampanj-relaterade notifikationer
    appVersion?: string;     // För app-uppdateringsnotifikationer
    [key: string]: any;      // Andra fält
  };
}

// Funktion för att generera en notifikationstitel utifrån typ och data
export function getNotificationTitle(notification: NotificationData): string {
  switch (notification.type) {
    case NotificationType.ORDER_PLACED:
      return 'Tack för din beställning!';
    
    case NotificationType.ORDER_ACCEPTED:
      return 'Din beställning har accepterats';
    
    case NotificationType.ORDER_PROCESSING:
      return 'Din beställning tillagas nu';
    
    case NotificationType.ORDER_COMPLETED:
      return 'Din beställning är redo att hämtas';
    
    case NotificationType.ORDER_CANCELLED:
      return 'Din beställning har avbrutits';
    
    case NotificationType.PROMO_NEW:
      return 'Nya meny-alternativ hos Moi!';
    
    case NotificationType.PROMO_DISCOUNT:
      return 'Exklusiv rabatt bara för dig!';
    
    case NotificationType.PROMO_SPECIAL:
      return 'Specialerbjudande från Moi Sushi';
    
    case NotificationType.APP_UPDATE:
      return 'App-uppdatering tillgänglig';
    
    case NotificationType.PROFILE_UPDATE:
      return 'Din profil har uppdaterats';
    
    case NotificationType.TEST:
      return 'Test av notifikation';
    
    default:
      return 'Notifikation från Moi Sushi';
  }
}

// Funktion för att generera notifikationstext utifrån typ och data
export function getNotificationBody(notification: NotificationData): string {
  switch (notification.type) {
    case NotificationType.ORDER_PLACED:
      return `Din beställning #${notification.data?.orderId?.substring(0, 8) || ''} har tagits emot och behandlas nu.`;
    
    case NotificationType.ORDER_ACCEPTED:
      return `Din beställning #${notification.data?.orderId?.substring(0, 8) || ''} har accepterats och kommer att börja tillagas snart.`;
    
    case NotificationType.ORDER_PROCESSING:
      return `Din beställning #${notification.data?.orderId?.substring(0, 8) || ''} tillagas just nu. Vi meddelar dig när den är redo.`;
    
    case NotificationType.ORDER_COMPLETED:
      return `Din beställning #${notification.data?.orderId?.substring(0, 8) || ''} är nu redo att hämtas. Välkommen!`;
    
    case NotificationType.ORDER_CANCELLED:
      return `Tyvärr har din beställning #${notification.data?.orderId?.substring(0, 8) || ''} avbrutits. Kontakta oss för mer information.`;
    
    case NotificationType.PROMO_NEW:
      return 'Vi har uppdaterat vår meny med nya spännande rätter. Kolla in dem nu!';
    
    case NotificationType.PROMO_DISCOUNT:
      return `Få ${notification.data?.discount || '10%'} rabatt på din nästa beställning med koden ${notification.data?.promoCode || 'MOI10'}.`;
    
    case NotificationType.PROMO_SPECIAL:
      return notification.data?.message || 'Kolla in vårt specialerbjudande!';
    
    case NotificationType.APP_UPDATE:
      return `En ny version (${notification.data?.appVersion || ''}) av Moi Sushi-appen finns tillgänglig med nya funktioner och förbättringar.`;
    
    case NotificationType.PROFILE_UPDATE:
      return 'Din profilinformation har uppdaterats.';
    
    case NotificationType.TEST:
      return 'Detta är en testnotifikation från Moi Sushi appen.';
    
    default:
      return 'Klicka för att se mer information.';
  }
} 