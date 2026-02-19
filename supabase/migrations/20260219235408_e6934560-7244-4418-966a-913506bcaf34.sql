
-- Fix: rendre les politiques d'insertion publiques plus précises
DROP POLICY IF EXISTS "registrations_public_insert" ON public.registrations;
DROP POLICY IF EXISTS "contact_public_insert" ON public.contact_messages;

-- Insert publique pour les inscriptions (avec vérification du statut initial)
CREATE POLICY "registrations_public_insert" ON public.registrations 
FOR INSERT WITH CHECK (status = 'pending');

-- Insert publique pour les messages de contact (avec vérification du statut initial)
CREATE POLICY "contact_public_insert" ON public.contact_messages 
FOR INSERT WITH CHECK (status = 'unread');

-- Storage bucket pour les uploads d'images
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

CREATE POLICY "media_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "media_admin_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');
CREATE POLICY "media_admin_delete" ON storage.objects FOR DELETE USING (bucket_id = 'media' AND auth.role() = 'authenticated');
