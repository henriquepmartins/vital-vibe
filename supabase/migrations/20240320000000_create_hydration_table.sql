-- Create hydration table
CREATE TABLE IF NOT EXISTS public.hydration (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed_intakes TEXT[] DEFAULT '{}',
    total_goal INTEGER DEFAULT 8,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.hydration ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own hydration data"
    ON public.hydration
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hydration data"
    ON public.hydration
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hydration data"
    ON public.hydration
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.hydration
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 