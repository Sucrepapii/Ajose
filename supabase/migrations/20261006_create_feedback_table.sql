CREATE TABLE IF NOT EXISTS "feedback" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    email VARCHAR(255),
    category VARCHAR(100),
    message TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    user_id UUID REFERENCES "users"(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending',
    is_featured BOOLEAN DEFAULT false,
    featured_quote TEXT,
    featured_author VARCHAR(255),
    featured_role VARCHAR(255),
    country_code VARCHAR(10),
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Enable RLS
ALTER TABLE "feedback" ENABLE ROW LEVEL SECURITY;

-- Anyone can insert feedback
CREATE POLICY "Anyone can insert feedback" ON "feedback" FOR INSERT WITH CHECK (true);

-- Anyone can read featured feedback
CREATE POLICY "Anyone can read featured feedback" ON "feedback" FOR SELECT USING (is_featured = true);

-- Admins can read all feedback
CREATE POLICY "Admins can read all feedback" ON "feedback" FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM "users" 
        WHERE "users".id = auth.uid() 
        AND ("users".is_super_admin = true OR "users".admin_role IS NOT NULL)
    )
);

-- Admins can update/delete feedback
CREATE POLICY "Admins can update feedback" ON "feedback" FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM "users" 
        WHERE "users".id = auth.uid() 
        AND ("users".is_super_admin = true OR "users".admin_role IS NOT NULL)
    )
);

CREATE POLICY "Admins can delete feedback" ON "feedback" FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM "users" 
        WHERE "users".id = auth.uid() 
        AND ("users".is_super_admin = true OR "users".admin_role IS NOT NULL)
    )
);
