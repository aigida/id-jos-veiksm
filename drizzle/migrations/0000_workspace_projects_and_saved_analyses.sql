CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.research_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 5000),
  notes text NOT NULL DEFAULT '' CHECK (char_length(notes) <= 20000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.research_projects TO authenticated;
GRANT ALL ON public.research_projects TO service_role;
ALTER TABLE public.research_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own projects: select" ON public.research_projects FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own projects: insert" ON public.research_projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own projects: update" ON public.research_projects FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own projects: delete" ON public.research_projects FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX research_projects_user_idx ON public.research_projects (user_id, created_at DESC);
CREATE TRIGGER research_projects_touch BEFORE UPDATE ON public.research_projects FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.saved_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  project_id uuid REFERENCES public.research_projects(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT '' CHECK (char_length(title) <= 500),
  url text NOT NULL DEFAULT '' CHECK (char_length(url) <= 2000),
  portal text NOT NULL DEFAULT '' CHECK (char_length(portal) <= 100),
  published_date text NOT NULL DEFAULT '' CHECK (char_length(published_date) <= 50),
  topic text NOT NULL DEFAULT '' CHECK (char_length(topic) <= 500),
  main_idea text NOT NULL DEFAULT '',
  tone text NOT NULL DEFAULT '',
  analysis jsonb NOT NULL,
  excerpt_checks jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text NOT NULL DEFAULT '' CHECK (char_length(notes) <= 20000),
  model text NOT NULL DEFAULT '',
  is_sample boolean NOT NULL DEFAULT false,
  analyzed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_analyses TO authenticated;
GRANT ALL ON public.saved_analyses TO service_role;
ALTER TABLE public.saved_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own analyses: select" ON public.saved_analyses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own analyses: insert" ON public.saved_analyses FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = user_id
  AND (project_id IS NULL OR EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()))
);
CREATE POLICY "Own analyses: update" ON public.saved_analyses FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (
  auth.uid() = user_id
  AND (project_id IS NULL OR EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.user_id = auth.uid()))
);
CREATE POLICY "Own analyses: delete" ON public.saved_analyses FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX saved_analyses_user_idx ON public.saved_analyses (user_id, analyzed_at DESC);
CREATE INDEX saved_analyses_project_idx ON public.saved_analyses (project_id);
CREATE TRIGGER saved_analyses_touch BEFORE UPDATE ON public.saved_analyses FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();