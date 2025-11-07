-- Junction table to map services to their available add-ons
CREATE TABLE service_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  addon_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(service_id, addon_id),
  CHECK (service_id != addon_id)
);

-- RLS Policies
ALTER TABLE service_addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage service addons"
  ON service_addons FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Anyone can view service addons"
  ON service_addons FOR SELECT
  TO public
  USING (true);

-- Index for performance
CREATE INDEX idx_service_addons_service ON service_addons(service_id);
CREATE INDEX idx_service_addons_addon ON service_addons(addon_id);