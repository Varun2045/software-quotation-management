-- ==============================================================================
-- Quotation Management System - Supabase Schema
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Quotations Table
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    quotation_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    company_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    quotation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE,
    gst_rate NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    gst NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Quotation Items Table
CREATE TABLE IF NOT EXISTS public.quotation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
    discount NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0 AND discount <= 100),
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Indexes for High Performance Querying
CREATE INDEX IF NOT EXISTS idx_quotations_user_id ON public.quotations(user_id);
CREATE INDEX IF NOT EXISTS idx_quotations_created_at ON public.quotations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation_id ON public.quotation_items(quotation_id);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for Quotations
-- Users can view their own quotations
CREATE POLICY "Users can view their own quotations"
    ON public.quotations FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Users can insert their own quotations
CREATE POLICY "Users can insert their own quotations"
    ON public.quotations FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Users can update their own quotations
CREATE POLICY "Users can update their own quotations"
    ON public.quotations FOR UPDATE
    USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Users can delete their own quotations
CREATE POLICY "Users can delete their own quotations"
    ON public.quotations FOR DELETE
    USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- 7. RLS Policies for Quotation Items
-- Users can view items belonging to their quotations
CREATE POLICY "Users can view their own quotation items"
    ON public.quotation_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.quotations
            WHERE public.quotations.id = public.quotation_items.quotation_id
            AND (public.quotations.user_id = auth.uid() OR auth.uid() IS NULL)
        )
    );

-- Users can insert items for their quotations
CREATE POLICY "Users can insert their own quotation items"
    ON public.quotation_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quotations
            WHERE public.quotations.id = public.quotation_items.quotation_id
            AND (public.quotations.user_id = auth.uid() OR auth.uid() IS NULL)
        )
    );

-- Users can update items for their quotations
CREATE POLICY "Users can update their own quotation items"
    ON public.quotation_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.quotations
            WHERE public.quotations.id = public.quotation_items.quotation_id
            AND (public.quotations.user_id = auth.uid() OR auth.uid() IS NULL)
        )
    );

-- Users can delete items for their quotations
CREATE POLICY "Users can delete their own quotation items"
    ON public.quotation_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.quotations
            WHERE public.quotations.id = public.quotation_items.quotation_id
            AND (public.quotations.user_id = auth.uid() OR auth.uid() IS NULL)
        )
    );
