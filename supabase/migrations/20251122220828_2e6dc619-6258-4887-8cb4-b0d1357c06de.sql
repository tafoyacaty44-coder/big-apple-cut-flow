-- Drop existing storage policies that use has_role
DROP POLICY IF EXISTS "Admins can upload service images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update service images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete service images" ON storage.objects;

DROP POLICY IF EXISTS "Admins can upload gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete gallery images" ON storage.objects;

DROP POLICY IF EXISTS "Admins can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete blog images" ON storage.objects;

DROP POLICY IF EXISTS "Admins and barbers can upload client photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins and barbers can update client photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins and barbers can delete client photos" ON storage.objects;

-- Recreate policies using check_role_access for proper master_admin support

-- service-images policies
CREATE POLICY "Admins can upload service images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'service-images' AND
  check_role_access(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "Admins can update service images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'service-images' AND
  check_role_access(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "Admins can delete service images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'service-images' AND
  check_role_access(auth.uid(), 'admin'::user_role)
);

-- gallery-images policies
CREATE POLICY "Admins can upload gallery images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gallery-images' AND
  check_role_access(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "Admins can update gallery images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'gallery-images' AND
  check_role_access(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "Admins can delete gallery images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'gallery-images' AND
  check_role_access(auth.uid(), 'admin'::user_role)
);

-- blog-images policies
CREATE POLICY "Admins can upload blog images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog-images' AND
  check_role_access(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "Admins can update blog images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'blog-images' AND
  check_role_access(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "Admins can delete blog images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'blog-images' AND
  check_role_access(auth.uid(), 'admin'::user_role)
);

-- client-photos policies (maintain barber access)
CREATE POLICY "Admins and barbers can upload client photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'client-photos' AND
  (check_role_access(auth.uid(), 'admin'::user_role) OR check_role_access(auth.uid(), 'barber'::user_role))
);

CREATE POLICY "Admins and barbers can update client photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'client-photos' AND
  (check_role_access(auth.uid(), 'admin'::user_role) OR check_role_access(auth.uid(), 'barber'::user_role))
);

CREATE POLICY "Admins and barbers can delete client photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'client-photos' AND
  (check_role_access(auth.uid(), 'admin'::user_role) OR check_role_access(auth.uid(), 'barber'::user_role))
);