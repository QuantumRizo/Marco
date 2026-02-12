-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Static Tables (Hospitals, Services) first as they are referenced by Foreign Keys
CREATE TABLE IF NOT EXISTS hospitals (
    id TEXT PRIMARY KEY, -- 'hosp-angeles', etc.
    name TEXT NOT NULL,
    address TEXT,
    image TEXT,
    allowed_days INTEGER[] -- Array of days (0=Sunday, etc.)
);

CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY, -- 'srv-1', etc.
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 90,
    price NUMERIC
);

-- 2. Create Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    notes TEXT, -- Internal notes
    medical_history JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    hospital_id TEXT REFERENCES hospitals(id),
    service_id TEXT REFERENCES services(id),
    reason TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL, -- Combined date and time
    status TEXT NOT NULL DEFAULT 'confirmed', -- 'confirmed', 'pending', etc.
    notes TEXT,
    clinical_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Patient Uploads Table
CREATE TABLE IF NOT EXISTS patient_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Insert Static Data (from types.ts)
INSERT INTO hospitals (id, name, address, image, allowed_days) VALUES
    ('hosp-angeles', 'Hospital Angeles Lindavista', 'Ciudad de México', '/placeholder.svg', ARRAY[3, 6]),
    ('hosp-star-lomas', 'Star Médica Lomas Verdes', 'Naucalpan de Juárez, Méx.', '/placeholder.svg', ARRAY[2, 5]),
    ('hosp-star-luna', 'Star Médica Luna Parc', 'Cuautitlán Izcalli, Méx.', '/placeholder.svg', ARRAY[1, 4])
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    address = EXCLUDED.address,
    image = EXCLUDED.image,
    allowed_days = EXCLUDED.allowed_days;

INSERT INTO services (id, name, description, duration_minutes) VALUES
    ('srv-1', 'Consulta General', NULL, 90),
    ('srv-2', 'Limpieza Dental', NULL, 90),
    ('srv-3', 'Ortodoncia (Revisión)', NULL, 90)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    duration_minutes = EXCLUDED.duration_minutes;

-- 6. Enable Row Level Security (RLS)
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_uploads ENABLE ROW LEVEL SECURITY;

-- 7. Create Policies (Permissive for Demo/Prototype purposes - Adjust for production!)
-- Assuming using the ANON key for public access or basic authenticated access.
-- If the app doesn't have Auth implemented yet, we need 'anon' access.

-- Hospitals & Services: Public Read (everyone can see what's available)
CREATE POLICY "Public Read Hospitals" ON hospitals FOR SELECT USING (true);
CREATE POLICY "Public Read Services" ON services FOR SELECT USING (true);

-- Patients: Public Read/Write (Warning: In production, restrict to authenticated users or specific roles)
CREATE POLICY "Enable Read for Anon" ON patients FOR SELECT USING (true);
CREATE POLICY "Enable Insert for Anon" ON patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable Update for Anon" ON patients FOR UPDATE USING (true);
CREATE POLICY "Enable Delete for Anon" ON patients FOR DELETE USING (true);

-- Appointments: Public Read/Write
CREATE POLICY "Enable Read for Anon" ON appointments FOR SELECT USING (true);
CREATE POLICY "Enable Insert for Anon" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable Update for Anon" ON appointments FOR UPDATE USING (true);
CREATE POLICY "Enable Delete for Anon" ON appointments FOR DELETE USING (true);

-- Patient Uploads: Public Read/Write
CREATE POLICY "Enable Read for Anon" ON patient_uploads FOR SELECT USING (true);
CREATE POLICY "Enable Insert for Anon" ON patient_uploads FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable Delete for Anon" ON patient_uploads FOR DELETE USING (true);

-- 8. Storage Buckets & Policies
-- Note: If the following command fails with "relation storage.buckets does not exist", 
-- it means your SQL editor user does not have permissions to modify the generic storage schema 
-- or the storage extension is not fully loaded in this context.
-- 
-- RECOMMENDATION: Create the 'patient_files' bucket manually in the Supabase Dashboard -> Storage.
-- Then, you can try running the policy creation commands below if the bucket exists.

/*
INSERT INTO storage.buckets (id, name, public) VALUES ('patient_files', 'patient_files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies (Files)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'patient_files' );
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'patient_files' );
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING ( bucket_id = 'patient_files' );
*/
