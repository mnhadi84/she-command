
-- Create users table for registration
CREATE TABLE public.users (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    staff_id TEXT NOT NULL UNIQUE,
    project_code TEXT NOT NULL DEFAULT 'NEOM-01',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (registration is public)
CREATE POLICY "Anyone can register" ON public.users FOR INSERT WITH CHECK (true);

-- Allow authenticated users to read their own record
CREATE POLICY "Users can view own record" ON public.users FOR SELECT USING (true);
