const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Aktivera CORS för alla källor med mer detaljerade inställningar
app.use(cors({
  origin: '*', // Tillåt alla ursprung
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 timmar i sekunder
}));
app.use(express.json());

// Middleware för att logga inkommande förfrågningar
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  next();
});

// Konfigurera Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // Ändra till false för att använda STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Lägg till dessa timeout-inställningar
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000
});

// Förbättrad verifieringsfunktion
async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log('E-postanslutning verifierad - servern är redo att skicka e-post');
    return true;
  } catch (error) {
    console.error('E-postverifieringsfel:', {
      error: error.message,
      code: error.code,
      command: error.command
    });
    return false;
  }
}

// Hjälpfunktion för att skicka e-post med bättre felhantering
async function sendEmailWithRetry(mailOptions, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Försöker skicka e-post (försök ${attempt}/${retries}):`, {
        to: mailOptions.to,
        subject: mailOptions.subject
      });
      
      const result = await transporter.sendMail(mailOptions);
      console.log('E-post skickad framgångsrikt:', {
        messageId: result.messageId,
        to: mailOptions.to
      });
      return result;
    } catch (error) {
      console.error(`E-postfel (försök ${attempt}/${retries}):`, {
        error: error.message,
        code: error.code,
        command: error.command,
        response: error.response
      });
      
      if (attempt === retries) {
        throw error;
      }
      // Vänta 1 sekund innan nästa försök
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// Funktion för att validera e-post
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Funktion för att sanitera input
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// API-statusendpoint för att kontrollera att servern är igång
app.get('/api/status', (req, res) => {
  console.log('Status endpoint accessed');
  res.status(200).json({ status: 'OK', serverTime: new Date().toISOString() });
});

// Endpoint för kontaktformulär
app.post('/api/email/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  
  console.log('Received contact request:', { name, email, subject });
  
  // Validera input
  if (!name || !email || !subject || !message) {
    console.log('Validation failed - missing fields');
    return res.status(400).json({ success: false, error: 'Alla fält måste fyllas i' });
  }
  
  if (!isValidEmail(email)) {
    console.log('Validation failed - invalid email');
    return res.status(400).json({ success: false, error: 'Ogiltig e-postadress' });
  }
  
  // Sanitera input
  const sanitizedName = sanitizeInput(name);
  const sanitizedSubject = sanitizeInput(subject);
  const sanitizedMessage = sanitizeInput(message);
  
  try {
    // E-post till restaurangen
    await transporter.sendMail({
      from: `"Moi Sushi Kontaktformulär" <${process.env.EMAIL_USER}>`,
      to: process.env.RESTAURANT_EMAIL,
      subject: `Nytt kontaktmeddelande: ${sanitizedSubject}`,
      html: `
        <h2>Nytt meddelande från kontaktformuläret</h2>
        <p><strong>Namn:</strong> ${sanitizedName}</p>
        <p><strong>E-post:</strong> ${email}</p>
        <p><strong>Ämne:</strong> ${sanitizedSubject}</p>
        <p><strong>Meddelande:</strong></p>
        <p>${sanitizedMessage}</p>
      `,
    });
    
    // Bekräftelse till kunden
    await transporter.sendMail({
      from: `"Moi Sushi" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Tack för ditt meddelande: ${sanitizedSubject}`,
      html: `
        <h2>Hej ${sanitizedName}!</h2>
        <p>Tack för ditt meddelande till Moi Sushi. Vi har mottagit följande:</p>
        <p><strong>Ämne:</strong> ${sanitizedSubject}</p>
        <p><strong>Meddelande:</strong></p>
        <p>${sanitizedMessage}</p>
        <p>Vi återkommer till dig så snart som möjligt.</p>
        <p>Med vänliga hälsningar,<br>Moi Sushi-teamet</p>
      `,
    });
    
    console.log('Contact email sent successfully');
    res.status(200).json({ success: true, message: 'E-postmeddelande skickat' });
  } catch (error) {
    console.error('Failed to send contact email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint för bordsbokningar
app.post('/api/email/booking', async (req, res) => {
  const { customerEmail, customerName, bookingDate, bookingTime, guests, phone, message } = req.body;
  
  console.log('Received booking request:', { customerName, customerEmail, bookingDate, bookingTime, guests });
  
  // Validera input
  if (!customerEmail || !customerName || !bookingDate || !bookingTime || !guests || !phone) {
    console.log('Booking validation failed - missing fields');
    return res.status(400).json({ success: false, error: 'Alla obligatoriska fält måste fyllas i' });
  }
  
  if (!isValidEmail(customerEmail)) {
    console.log('Booking validation failed - invalid email');
    return res.status(400).json({ success: false, error: 'Ogiltig e-postadress' });
  }
  
  try {
    // E-post till restaurangen
    await transporter.sendMail({
      from: `"Moi Sushi Bokningssystem" <${process.env.EMAIL_USER}>`,
      to: process.env.RESTAURANT_EMAIL,
      subject: `Ny bordsbokning: ${customerName} - ${bookingDate} ${bookingTime}`,
      html: `
        <h2>Ny bordsbokning</h2>
        <p><strong>Namn:</strong> ${customerName}</p>
        <p><strong>E-post:</strong> ${customerEmail}</p>
        <p><strong>Telefon:</strong> ${phone}</p>
        <p><strong>Datum:</strong> ${bookingDate}</p>
        <p><strong>Tid:</strong> ${bookingTime}</p>
        <p><strong>Antal gäster:</strong> ${guests}</p>
        <p><strong>Meddelande:</strong></p>
        <p>${message || 'Inget meddelande'}</p>
      `,
    });
    
    // Bekräftelse till kunden
    await transporter.sendMail({
      from: `"Moi Sushi" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `Bokningsbekräftelse - Moi Sushi ${bookingDate} ${bookingTime}`,
      html: `
        <h2>Hej ${customerName}!</h2>
        <p>Tack för din bokning hos Moi Sushi. Vi bekräftar följande:</p>
        <p><strong>Datum:</strong> ${bookingDate}</p>
        <p><strong>Tid:</strong> ${bookingTime}</p>
        <p><strong>Antal gäster:</strong> ${guests}</p>
        <p>Du kan nå oss på telefon om du behöver ändra din bokning.</p>
        <p>Vi ser fram emot ditt besök!</p>
        <p>Med vänliga hälsningar,<br>Moi Sushi-teamet</p>
      `,
    });
    
    console.log('Booking confirmation emails sent successfully');
    res.status(200).json({ success: true, message: 'Bokningsbekräftelse skickad' });
  } catch (error) {
    console.error('Failed to send booking emails:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint för orderbekräftelser
app.post('/api/email/order-confirmation', async (req, res) => {
  const { customerEmail, customerName, orderDetails, orderTotal, deliveryAddress, phone } = req.body;
  
  console.log('Mottog orderbekräftelseförfrågan:', {
    customer: customerName,
    email: customerEmail,
    total: orderTotal
  });
  
  try {
    // E-post till restaurangen
    await sendEmailWithRetry({
      from: `"Moi Sushi Ordersystem" <${process.env.EMAIL_USER}>`,
      to: process.env.RESTAURANT_EMAIL,
      subject: `Ny beställning från ${customerName}`,
      html: `
        <h2>Ny beställning mottagen</h2>
        <p><strong>Kundnamn:</strong> ${customerName}</p>
        <p><strong>E-post:</strong> ${customerEmail}</p>
        <p><strong>Telefon:</strong> ${phone}</p>
        <p><strong>Leveransadress:</strong> ${deliveryAddress}</p>
        <h3>Beställning:</h3>
        <pre>${orderDetails}</pre>
        <p><strong>Totalbelopp:</strong> ${orderTotal} kr</p>
      `
    });
    
    // Bekräftelse till kunden
    await sendEmailWithRetry({
      from: `"Moi Sushi" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `Din beställning hos Moi Sushi är bekräftad`,
      html: `
        <h2>Hej ${customerName}!</h2>
        <p>Tack för din beställning hos Moi Sushi. Vi har mottagit följande:</p>
        <h3>Din beställning:</h3>
        <pre>${orderDetails}</pre>
        <p><strong>Totalbelopp:</strong> ${orderTotal} kr</p>
        <p><strong>Leveransadress:</strong> ${deliveryAddress}</p>
        <p>Vi kommer att leverera din beställning så snart som möjligt. Om du har några frågor, vänligen kontakta oss.</p>
        <p>Med vänliga hälsningar,<br>Moi Sushi-teamet</p>
      `
    });
    
    console.log('Orderbekräftelser skickade framgångsrikt');
    res.status(200).json({ success: true, message: 'Orderbekräftelse skickad' });
  } catch (error) {
    console.error('Kunde inte skicka orderbekräftelser:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Kunde inte skicka orderbekräftelse. Vänligen kontakta restaurangen.',
      details: error.message 
    });
  }
});

// Hantera 404 - sidan hittades inte
app.use((req, res) => {
  console.log(`404 - Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ success: false, error: 'Resursen hittades inte' });
});

// Felhantering middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, error: 'Serverfel' });
});

// Starta servern
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Environment variables loaded:');
  console.log(`- Email host: ${process.env.EMAIL_HOST}`);
  console.log(`- Email port: ${process.env.EMAIL_PORT}`);
  console.log(`- Email secure: ${process.env.EMAIL_SECURE}`);
  console.log(`- Email user: ${process.env.EMAIL_USER}`);
  console.log(`- Restaurant email: ${process.env.RESTAURANT_EMAIL}`);
});