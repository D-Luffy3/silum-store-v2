-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer',
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT valid_roles CHECK (role IN ('admin', 'manager', 'editor', 'customer'))
);

-- Trigger to automatically create a profile when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 
    'customer'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price TEXT NOT NULL,
    price_currency TEXT DEFAULT '৳',
    discount_price TEXT,
    image TEXT NOT NULL,
    additional_images TEXT[] DEFAULT '{}'::TEXT[],
    is_new BOOLEAN DEFAULT FALSE,
    sizes TEXT[] DEFAULT '{}'::TEXT[],
    colors TEXT[] DEFAULT '{}'::TEXT[],
    description TEXT,
    details TEXT[] DEFAULT '{}'::TEXT[],
    collection_name TEXT,
    stock INTEGER DEFAULT 50,
    category TEXT NOT NULL,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    author TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    date TEXT,
    approved BOOLEAN DEFAULT TRUE,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL
);

-- 4. Create newsletter_emails table (newsletter subscriber list)
CREATE TABLE IF NOT EXISTS public.newsletter_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source TEXT DEFAULT 'popup_form',
    is_active BOOLEAN DEFAULT TRUE
);

-- 5. Create app_settings table (homepage settings, texts, banners, configurations)
CREATE TABLE IF NOT EXISTS public.app_settings (
    id TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    delivery_location TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    transaction_id TEXT,
    payment_verified BOOLEAN DEFAULT FALSE,
    total TEXT NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Shipped', 'Delivered', 'Cancelled')),
    date TEXT,
    items TEXT[] DEFAULT '{}'::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create promos table
CREATE TABLE IF NOT EXISTS public.promos (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- 8. Disable RLS for simple/convenient setup, or custom RLS policies can be written as needed
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_emails DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.promos DISABLE ROW LEVEL SECURITY;
