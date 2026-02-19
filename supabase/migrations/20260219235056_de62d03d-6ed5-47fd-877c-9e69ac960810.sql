
-- ============================================================
-- SCHÉMA COMPLET BACKOFFICE MODEL TECHNOLOGIE
-- ============================================================

-- 1. BOOTCAMPS
CREATE TABLE public.bootcamps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  audience TEXT,
  prerequisites TEXT,
  price TEXT,
  next_session TEXT,
  benefits TEXT[],
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. INSCRIPTIONS AUX BOOTCAMPS
CREATE TABLE public.registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bootcamp_id UUID REFERENCES public.bootcamps(id) ON DELETE SET NULL,
  bootcamp_title TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  position TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'waitlist')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. SERVICES
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  features TEXT[],
  duration TEXT,
  display_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. RÉFÉRENCES (clients, écoles, partenaires)
CREATE TABLE public.references (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  full_name TEXT,
  category TEXT NOT NULL DEFAULT 'client' CHECK (category IN ('client', 'school', 'partner')),
  sector TEXT,
  logo_url TEXT,
  logo_text TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. TÉMOIGNAGES
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. MESSAGES DE CONTACT
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. ALUMNI GROUPES
CREATE TABLE public.alumni_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cohort TEXT NOT NULL,
  year INTEGER NOT NULL,
  project_title TEXT NOT NULL,
  project_description TEXT,
  project_link TEXT,
  group_photo_url TEXT,
  testimonial TEXT,
  published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. MEMBRES DES GROUPES ALUMNI
CREATE TABLE public.alumni_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.alumni_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT,
  linkedin_url TEXT,
  email TEXT,
  phone TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. PHOTOS DE TRAVAUX ALUMNI
CREATE TABLE public.alumni_work_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.alumni_groups(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 10. GALERIE PHOTOS BOOTCAMPS
CREATE TABLE public.gallery_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  caption TEXT,
  bootcamp_name TEXT,
  display_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Bootcamps : lecture publique
ALTER TABLE public.bootcamps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bootcamps_public_read" ON public.bootcamps FOR SELECT USING (published = true);
CREATE POLICY "bootcamps_admin_all" ON public.bootcamps FOR ALL USING (auth.role() = 'authenticated');

-- Registrations : insertion publique, lecture/update admin
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "registrations_public_insert" ON public.registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "registrations_admin_all" ON public.registrations FOR ALL USING (auth.role() = 'authenticated');

-- Services : lecture publique
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services_public_read" ON public.services FOR SELECT USING (published = true);
CREATE POLICY "services_admin_all" ON public.services FOR ALL USING (auth.role() = 'authenticated');

-- References : lecture publique
ALTER TABLE public.references ENABLE ROW LEVEL SECURITY;
CREATE POLICY "references_public_read" ON public.references FOR SELECT USING (published = true);
CREATE POLICY "references_admin_all" ON public.references FOR ALL USING (auth.role() = 'authenticated');

-- Testimonials : lecture publique
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "testimonials_public_read" ON public.testimonials FOR SELECT USING (published = true);
CREATE POLICY "testimonials_admin_all" ON public.testimonials FOR ALL USING (auth.role() = 'authenticated');

-- Contact messages : insertion publique, lecture admin
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_public_insert" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_admin_all" ON public.contact_messages FOR ALL USING (auth.role() = 'authenticated');

-- Alumni groups : lecture publique
ALTER TABLE public.alumni_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alumni_groups_public_read" ON public.alumni_groups FOR SELECT USING (published = true);
CREATE POLICY "alumni_groups_admin_all" ON public.alumni_groups FOR ALL USING (auth.role() = 'authenticated');

-- Alumni members : lecture publique
ALTER TABLE public.alumni_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alumni_members_public_read" ON public.alumni_members FOR SELECT USING (true);
CREATE POLICY "alumni_members_admin_all" ON public.alumni_members FOR ALL USING (auth.role() = 'authenticated');

-- Alumni work photos : lecture publique
ALTER TABLE public.alumni_work_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alumni_photos_public_read" ON public.alumni_work_photos FOR SELECT USING (true);
CREATE POLICY "alumni_photos_admin_all" ON public.alumni_work_photos FOR ALL USING (auth.role() = 'authenticated');

-- Gallery : lecture publique
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery_public_read" ON public.gallery_photos FOR SELECT USING (published = true);
CREATE POLICY "gallery_admin_all" ON public.gallery_photos FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- TRIGGERS updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_bootcamps_updated_at BEFORE UPDATE ON public.bootcamps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON public.registrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_references_updated_at BEFORE UPDATE ON public.references FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contact_messages_updated_at BEFORE UPDATE ON public.contact_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_alumni_groups_updated_at BEFORE UPDATE ON public.alumni_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
