-- Create SEO settings table
create table public.seo_settings (
  id uuid primary key default gen_random_uuid(),
  page_slug text unique not null,
  meta_title text,
  meta_description text,
  keywords text[],
  og_title text,
  og_description text,
  og_image_url text,
  canonical_url text,
  robots text default 'index, follow',
  updated_at timestamptz default now(),
  updated_by uuid references auth.users(id)
);

-- Enable RLS
alter table public.seo_settings enable row level security;

-- Anyone can view SEO settings (needed for public pages)
create policy "Anyone can view SEO settings"
  on public.seo_settings for select
  using (true);

-- Only admins can manage SEO settings
create policy "Admins can manage SEO settings"
  on public.seo_settings for all
  using (has_role(auth.uid(), 'admin'))
  with check (has_role(auth.uid(), 'admin'));

-- Seed default SEO settings
insert into public.seo_settings (page_slug, meta_title, meta_description, keywords, og_image_url) values
('home', 'Big Apple Barbers - Classic Cuts & Modern Style | NYC East Village', 'Premium barbershop in Manhattan''s East Village. Expert haircuts, traditional shaves, and grooming services. Walk-ins welcome. Call (212) 651-4858 to book.', ARRAY['barber', 'barbershop', 'haircut', 'shave', 'grooming', 'NYC', 'East Village', 'Manhattan', 'men''s haircut'], 'https://lovable.dev/opengraph-image-p98pqg.png'),
('book', 'Book Your Appointment | Big Apple Barbers', 'Schedule your haircut or shave online. Choose your barber, pick your time, and get ready for a premium grooming experience in NYC''s East Village.', ARRAY['book appointment', 'online booking', 'barber appointment', 'NYC', 'haircut booking'], 'https://lovable.dev/opengraph-image-p98pqg.png'),
('barbers', 'Our Expert Barbers | Big Apple Barbers', 'Meet our team of experienced barbers in Manhattan''s East Village. Each specializes in classic cuts and modern styles.', ARRAY['barbers', 'barber team', 'expert barbers', 'NYC barbers', 'Manhattan barbers'], 'https://lovable.dev/opengraph-image-p98pqg.png'),
('gallery', 'Gallery | Big Apple Barbers', 'See our work. Browse photos of our East Village barbershop, haircuts, and satisfied customers.', ARRAY['barbershop photos', 'haircut gallery', 'before and after', 'NYC barbershop'], 'https://lovable.dev/opengraph-image-p98pqg.png'),
('blog', 'Grooming Tips & Trends | Big Apple Barbers Blog', 'Expert advice on men''s grooming, hairstyle trends, and barbershop culture from NYC''s premier barbers.', ARRAY['grooming tips', 'hairstyle trends', 'barber blog', 'men''s grooming'], 'https://lovable.dev/opengraph-image-p98pqg.png'),
('rewards', 'Rewards Program | Big Apple Barbers', 'Earn points with every visit. Redeem for discounts on haircuts, shaves, and grooming products at our East Village location.', ARRAY['rewards program', 'loyalty program', 'barber rewards', 'NYC'], 'https://lovable.dev/opengraph-image-p98pqg.png');