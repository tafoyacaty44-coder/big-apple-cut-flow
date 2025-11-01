-- Make client-photos bucket public so getPublicUrl() works
UPDATE storage.buckets 
SET public = true 
WHERE id = 'client-photos';

-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Admins and barbers can view client photos" ON storage.objects;

-- Allow public viewing of client photos
CREATE POLICY "Anyone can view client photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'client-photos');