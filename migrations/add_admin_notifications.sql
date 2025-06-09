-- Migration: Lägg till admin-notifikationsfunktionalitet
-- Datum: 2024-12-XX
-- Beskrivning: Lägger till push_token i profiles och admin_notification_settings tabell

-- Lägg till push_token kolumn i profiles-tabellen om den inte redan finns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_token TEXT;

-- Skapa admin_notification_settings tabell
CREATE TABLE IF NOT EXISTS admin_notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(admin_id, notification_type)
);

-- Aktivera RLS för admin_notification_settings
ALTER TABLE admin_notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies för admin_notification_settings
CREATE POLICY "Admin notification settings are viewable by admins only" 
ON admin_notification_settings FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update their own notification settings" 
ON admin_notification_settings FOR UPDATE 
TO authenticated 
USING (
  admin_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can insert their own notification settings" 
ON admin_notification_settings FOR INSERT 
TO authenticated 
WITH CHECK (
  admin_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Uppdatera befintliga RLS-policyer för att tillåta admins att se alla orders och bokningar
DROP POLICY IF EXISTS "Orders are viewable by authenticated users" ON orders;
CREATE POLICY "Orders are viewable by authenticated users" 
ON orders FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

DROP POLICY IF EXISTS "Orders can be updated by users or admins" ON orders;
CREATE POLICY "Orders can be updated by users or admins" 
ON orders FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

DROP POLICY IF EXISTS "Bookings are viewable by authenticated users" ON bookings;
CREATE POLICY "Bookings are viewable by authenticated users" 
ON bookings FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

DROP POLICY IF EXISTS "Bookings can be updated by users or admins" ON bookings;
CREATE POLICY "Bookings can be updated by users or admins" 
ON bookings FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Lägg till index för bättre prestanda
CREATE INDEX IF NOT EXISTS idx_admin_notification_settings_admin_id ON admin_notification_settings(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_notification_settings_type ON admin_notification_settings(notification_type);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_push_token ON profiles(push_token) WHERE push_token IS NOT NULL; 