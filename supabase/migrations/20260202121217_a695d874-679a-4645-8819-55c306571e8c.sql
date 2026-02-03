-- ======================================
-- GODEY DATA PLATFORM - DATABASE SCHEMA
-- ======================================

-- 1️⃣ Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('client', 'basic_agent', 'master_agent', 'premier_agent', 'elite_agent', 'admin');

-- 2️⃣ Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    role app_role NOT NULL DEFAULT 'client',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3️⃣ Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4️⃣ Create wallets table
CREATE TABLE public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    balance NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- 5️⃣ Create transactions table
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('wallet_funding', 'purchase', 'commission', 'refund')),
    amount NUMERIC(12,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')) DEFAULT 'pending',
    reference TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 6️⃣ Create pricing_tiers table
CREATE TABLE public.pricing_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role app_role NOT NULL,
    network TEXT NOT NULL CHECK (network IN ('MTN', 'Airtel', 'Telecel', 'MTN_AFA')),
    package_name TEXT NOT NULL,
    data_amount TEXT NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(role, network, package_name)
);

ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;

-- 7️⃣ Create carts table
CREATE TABLE public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

-- 8️⃣ Create cart_items table
CREATE TABLE public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID REFERENCES public.carts(id) ON DELETE CASCADE NOT NULL,
    pricing_tier_id UUID REFERENCES public.pricing_tiers(id) ON DELETE CASCADE NOT NULL,
    beneficiary_phone TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- 9️⃣ Create referrals table
CREATE TABLE public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    commission NUMERIC(12,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT no_self_referral CHECK (referrer_id != referred_id)
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- ======================================
-- HELPER FUNCTIONS (SECURITY DEFINER)
-- ======================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

-- Function to get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to generate referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- ======================================
-- TRIGGERS
-- ======================================

CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at
BEFORE UPDATE ON public.wallets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pricing_tiers_updated_at
BEFORE UPDATE ON public.pricing_tiers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_carts_updated_at
BEFORE UPDATE ON public.carts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ======================================
-- RLS POLICIES - USER_ROLES
-- ======================================

CREATE POLICY "Users can view own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ======================================
-- RLS POLICIES - PROFILES
-- ======================================

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage profiles"
ON public.profiles FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ======================================
-- RLS POLICIES - WALLETS
-- ======================================

CREATE POLICY "Users can view own wallet"
ON public.wallets FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own wallet"
ON public.wallets FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all wallets"
ON public.wallets FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage wallets"
ON public.wallets FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ======================================
-- RLS POLICIES - TRANSACTIONS
-- ======================================

CREATE POLICY "Users can view own transactions"
ON public.transactions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transactions"
ON public.transactions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all transactions"
ON public.transactions FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage transactions"
ON public.transactions FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ======================================
-- RLS POLICIES - PRICING_TIERS
-- ======================================

CREATE POLICY "Everyone can view active pricing tiers"
ON public.pricing_tiers FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Admins can manage pricing tiers"
ON public.pricing_tiers FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ======================================
-- RLS POLICIES - CARTS
-- ======================================

CREATE POLICY "Users can view own cart"
ON public.carts FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own cart"
ON public.carts FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own cart"
ON public.carts FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own cart"
ON public.carts FOR DELETE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage carts"
ON public.carts FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ======================================
-- RLS POLICIES - CART_ITEMS
-- ======================================

CREATE POLICY "Users can view own cart items"
ON public.cart_items FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.carts WHERE id = cart_items.cart_id AND user_id = auth.uid()
));

CREATE POLICY "Users can insert own cart items"
ON public.cart_items FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.carts WHERE id = cart_items.cart_id AND user_id = auth.uid()
));

CREATE POLICY "Users can update own cart items"
ON public.cart_items FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.carts WHERE id = cart_items.cart_id AND user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.carts WHERE id = cart_items.cart_id AND user_id = auth.uid()
));

CREATE POLICY "Users can delete own cart items"
ON public.cart_items FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.carts WHERE id = cart_items.cart_id AND user_id = auth.uid()
));

CREATE POLICY "Admins can manage cart items"
ON public.cart_items FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ======================================
-- RLS POLICIES - REFERRALS
-- ======================================

CREATE POLICY "Users can view referrals where they are referrer"
ON public.referrals FOR SELECT
TO authenticated
USING (referrer_id = auth.uid());

CREATE POLICY "Admins can view all referrals"
ON public.referrals FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage referrals"
ON public.referrals FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ======================================
-- AUTO-CREATE USER DATA ON SIGNUP
-- ======================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  ref_code TEXT;
  ref_profile_id UUID;
BEGIN
  -- Generate unique referral code
  LOOP
    ref_code := public.generate_referral_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = ref_code);
  END LOOP;

  -- Create user role (default: client)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');

  -- Create profile
  INSERT INTO public.profiles (user_id, email, first_name, last_name, phone, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    ref_code
  );

  -- Create wallet
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0);

  -- Create cart
  INSERT INTO public.carts (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ======================================
-- SEED DEFAULT PRICING TIERS
-- ======================================

INSERT INTO public.pricing_tiers (role, network, package_name, data_amount, price) VALUES
-- Client prices (base prices)
('client', 'MTN', '1GB Daily', '1GB', 4.50),
('client', 'MTN', '2GB Weekly', '2GB', 8.50),
('client', 'MTN', '5GB Monthly', '5GB', 20.00),
('client', 'MTN', '10GB Monthly', '10GB', 38.00),
('client', 'Airtel', '1GB Daily', '1GB', 4.00),
('client', 'Airtel', '2GB Weekly', '2GB', 8.00),
('client', 'Airtel', '5GB Monthly', '5GB', 18.00),
('client', 'Telecel', '1GB Daily', '1GB', 5.00),
('client', 'Telecel', '2GB Weekly', '2GB', 9.00),
('client', 'MTN_AFA', '1GB Daily', '1GB', 5.00),
('client', 'MTN_AFA', '2GB Weekly', '2GB', 9.00),
-- Basic Agent prices (5% discount)
('basic_agent', 'MTN', '1GB Daily', '1GB', 4.28),
('basic_agent', 'MTN', '2GB Weekly', '2GB', 8.08),
('basic_agent', 'MTN', '5GB Monthly', '5GB', 19.00),
('basic_agent', 'MTN', '10GB Monthly', '10GB', 36.10),
('basic_agent', 'Airtel', '1GB Daily', '1GB', 3.80),
('basic_agent', 'Airtel', '2GB Weekly', '2GB', 7.60),
('basic_agent', 'Airtel', '5GB Monthly', '5GB', 17.10),
('basic_agent', 'Telecel', '1GB Daily', '1GB', 4.75),
('basic_agent', 'Telecel', '2GB Weekly', '2GB', 8.55),
('basic_agent', 'MTN_AFA', '1GB Daily', '1GB', 4.75),
('basic_agent', 'MTN_AFA', '2GB Weekly', '2GB', 8.55),
-- Master Agent prices (10% discount)
('master_agent', 'MTN', '1GB Daily', '1GB', 4.05),
('master_agent', 'MTN', '2GB Weekly', '2GB', 7.65),
('master_agent', 'MTN', '5GB Monthly', '5GB', 18.00),
('master_agent', 'MTN', '10GB Monthly', '10GB', 34.20),
('master_agent', 'Airtel', '1GB Daily', '1GB', 3.60),
('master_agent', 'Airtel', '2GB Weekly', '2GB', 7.20),
('master_agent', 'Airtel', '5GB Monthly', '5GB', 16.20),
('master_agent', 'Telecel', '1GB Daily', '1GB', 4.50),
('master_agent', 'Telecel', '2GB Weekly', '2GB', 8.10),
('master_agent', 'MTN_AFA', '1GB Daily', '1GB', 4.50),
('master_agent', 'MTN_AFA', '2GB Weekly', '2GB', 8.10),
-- Premier Agent prices (15% discount)
('premier_agent', 'MTN', '1GB Daily', '1GB', 3.83),
('premier_agent', 'MTN', '2GB Weekly', '2GB', 7.23),
('premier_agent', 'MTN', '5GB Monthly', '5GB', 17.00),
('premier_agent', 'MTN', '10GB Monthly', '10GB', 32.30),
('premier_agent', 'Airtel', '1GB Daily', '1GB', 3.40),
('premier_agent', 'Airtel', '2GB Weekly', '2GB', 6.80),
('premier_agent', 'Airtel', '5GB Monthly', '5GB', 15.30),
('premier_agent', 'Telecel', '1GB Daily', '1GB', 4.25),
('premier_agent', 'Telecel', '2GB Weekly', '2GB', 7.65),
('premier_agent', 'MTN_AFA', '1GB Daily', '1GB', 4.25),
('premier_agent', 'MTN_AFA', '2GB Weekly', '2GB', 7.65),
-- Elite Agent prices (20% discount)
('elite_agent', 'MTN', '1GB Daily', '1GB', 3.60),
('elite_agent', 'MTN', '2GB Weekly', '2GB', 6.80),
('elite_agent', 'MTN', '5GB Monthly', '5GB', 16.00),
('elite_agent', 'MTN', '10GB Monthly', '10GB', 30.40),
('elite_agent', 'Airtel', '1GB Daily', '1GB', 3.20),
('elite_agent', 'Airtel', '2GB Weekly', '2GB', 6.40),
('elite_agent', 'Airtel', '5GB Monthly', '5GB', 14.40),
('elite_agent', 'Telecel', '1GB Daily', '1GB', 4.00),
('elite_agent', 'Telecel', '2GB Weekly', '2GB', 7.20),
('elite_agent', 'MTN_AFA', '1GB Daily', '1GB', 4.00),
('elite_agent', 'MTN_AFA', '2GB Weekly', '2GB', 7.20);