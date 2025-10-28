-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
('client-photos', 'client-photos', false),
('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for client-photos bucket
CREATE POLICY "Admins and barbers can upload client photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'client-photos' AND
  (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'barber')
  )
);

CREATE POLICY "Admins and barbers can view client photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'client-photos' AND
  (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'barber')
  )
);

-- RLS for avatars bucket
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');