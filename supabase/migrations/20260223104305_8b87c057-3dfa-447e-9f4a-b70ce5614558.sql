
-- Drop old tables (they are empty)
DROP TABLE IF EXISTS public.alumni_work_photos;
DROP TABLE IF EXISTS public.alumni_members;
DROP TABLE IF EXISTS public.alumni_groups;

-- 1. Alumni: individual people who completed a bootcamp
CREATE TABLE public.alumni (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID REFERENCES public.registrations(id) ON DELETE SET NULL,
  bootcamp_id UUID REFERENCES public.bootcamps(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  current_title TEXT,
  current_position TEXT,
  linkedin_url TEXT,
  photo_url TEXT,
  cohort TEXT,
  year INTEGER,
  published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.alumni ENABLE ROW LEVEL SECURITY;

CREATE POLICY "alumni_public_read" ON public.alumni FOR SELECT USING (published = true);
CREATE POLICY "alumni_admin_all" ON public.alumni FOR ALL USING (auth.role() = 'authenticated');

CREATE TRIGGER update_alumni_updated_at BEFORE UPDATE ON public.alumni
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Projects: bootcamp group projects
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bootcamp_id UUID REFERENCES public.bootcamps(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  tools_technologies TEXT[] DEFAULT '{}',
  access_link TEXT,
  cover_image_url TEXT,
  cohort TEXT,
  year INTEGER,
  published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_public_read" ON public.projects FOR SELECT USING (published = true);
CREATE POLICY "projects_admin_all" ON public.projects FOR ALL USING (auth.role() = 'authenticated');

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Project members: links alumni to projects
CREATE TABLE public.project_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  alumni_id UUID NOT NULL REFERENCES public.alumni(id) ON DELETE CASCADE,
  role TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_members_public_read" ON public.project_members FOR SELECT USING (true);
CREATE POLICY "project_members_admin_all" ON public.project_members FOR ALL USING (auth.role() = 'authenticated');

-- 4. Project screenshots
CREATE TABLE public.project_screenshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.project_screenshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_screenshots_public_read" ON public.project_screenshots FOR SELECT USING (true);
CREATE POLICY "project_screenshots_admin_all" ON public.project_screenshots FOR ALL USING (auth.role() = 'authenticated');
