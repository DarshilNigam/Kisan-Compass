-- =============================================================================
-- KISAN COMPASS — Production PostgreSQL Schema with Row Level Security (RLS)
-- Multi-Tenant Farm Intelligence Architecture
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. FARMERS PROFILE TABLE
-- Bound 1:1 with Supabase auth.users(id)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.farmers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for farmers
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can view own profile"
    ON public.farmers FOR SELECT
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Farmers can insert own profile"
    ON public.farmers FOR INSERT
    WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Farmers can update own profile"
    ON public.farmers FOR UPDATE
    USING (auth.uid() = auth_user_id)
    WITH CHECK (auth.uid() = auth_user_id);

-- -----------------------------------------------------------------------------
-- 2. FARMS TABLE
-- A farmer can own one or more agricultural landholdings
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
    farm_name TEXT NOT NULL,
    village TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'Uttar Pradesh',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_source TEXT NOT NULL DEFAULT 'MANUAL' CHECK (location_source IN ('GPS', 'MANUAL', 'APPROXIMATE')),
    location_accuracy DOUBLE PRECISION,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for farms
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can view own farms"
    ON public.farms FOR SELECT
    USING (farmer_id IN (SELECT id FROM public.farmers WHERE auth_user_id = auth.uid()));

CREATE POLICY "Farmers can insert own farms"
    ON public.farms FOR INSERT
    WITH CHECK (farmer_id IN (SELECT id FROM public.farmers WHERE auth_user_id = auth.uid()));

CREATE POLICY "Farmers can update own farms"
    ON public.farms FOR UPDATE
    USING (farmer_id IN (SELECT id FROM public.farmers WHERE auth_user_id = auth.uid()))
    WITH CHECK (farmer_id IN (SELECT id FROM public.farmers WHERE auth_user_id = auth.uid()));

CREATE POLICY "Farmers can delete own farms"
    ON public.farms FOR DELETE
    USING (farmer_id IN (SELECT id FROM public.farmers WHERE auth_user_id = auth.uid()));

-- -----------------------------------------------------------------------------
-- 3. FIELDS (PARCELS) TABLE
-- Specific demarcated plots under a farm
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    area_acres DOUBLE PRECISION NOT NULL CHECK (area_acres > 0),
    area_unit TEXT NOT NULL DEFAULT 'ACRES' CHECK (area_unit IN ('ACRES', 'HECTARES', 'BIGHA')),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_source TEXT CHECK (location_source IN ('GPS', 'MANUAL', 'FARM_DEFAULT', 'APPROXIMATE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for fields
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can view own fields"
    ON public.fields FOR SELECT
    USING (farm_id IN (
        SELECT f.id FROM public.farms f
        JOIN public.farmers fm ON f.farmer_id = fm.id
        WHERE fm.auth_user_id = auth.uid()
    ));

CREATE POLICY "Farmers can insert own fields"
    ON public.fields FOR INSERT
    WITH CHECK (farm_id IN (
        SELECT f.id FROM public.farms f
        JOIN public.farmers fm ON f.farmer_id = fm.id
        WHERE fm.auth_user_id = auth.uid()
    ));

CREATE POLICY "Farmers can update own fields"
    ON public.fields FOR UPDATE
    USING (farm_id IN (
        SELECT f.id FROM public.farms f
        JOIN public.farmers fm ON f.farmer_id = fm.id
        WHERE fm.auth_user_id = auth.uid()
    ));

CREATE POLICY "Farmers can delete own fields"
    ON public.fields FOR DELETE
    USING (farm_id IN (
        SELECT f.id FROM public.farms f
        JOIN public.farmers fm ON f.farmer_id = fm.id
        WHERE fm.auth_user_id = auth.uid()
    ));

-- -----------------------------------------------------------------------------
-- 4. CROP CYCLES TABLE
-- Seasonal cultivations for a field (never overwritten, preserving history)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crop_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    crop_name TEXT NOT NULL,
    crop_variety TEXT,
    sowing_date DATE,
    sowing_date_precision TEXT NOT NULL DEFAULT 'EXACT' CHECK (sowing_date_precision IN ('EXACT', 'APPROXIMATE', 'UNKNOWN')),
    crop_stage TEXT NOT NULL DEFAULT 'Growing',
    quantity_quintals DOUBLE PRECISION,
    quantity_unit TEXT NOT NULL DEFAULT 'QUINTALS' CHECK (quantity_unit IN ('QUINTALS', 'KILOGRAMS', 'TONNES')),
    quantity_status TEXT NOT NULL DEFAULT 'KNOWN' CHECK (quantity_status IN ('KNOWN', 'UNKNOWN')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'ABANDONED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for crop_cycles
ALTER TABLE public.crop_cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can view own crop_cycles"
    ON public.crop_cycles FOR SELECT
    USING (field_id IN (
        SELECT fld.id FROM public.fields fld
        JOIN public.farms f ON fld.farm_id = f.id
        JOIN public.farmers fm ON f.farmer_id = fm.id
        WHERE fm.auth_user_id = auth.uid()
    ));

CREATE POLICY "Farmers can insert own crop_cycles"
    ON public.crop_cycles FOR INSERT
    WITH CHECK (field_id IN (
        SELECT fld.id FROM public.fields fld
        JOIN public.farms f ON fld.farm_id = f.id
        JOIN public.farmers fm ON f.farmer_id = fm.id
        WHERE fm.auth_user_id = auth.uid()
    ));

CREATE POLICY "Farmers can update own crop_cycles"
    ON public.crop_cycles FOR UPDATE
    USING (field_id IN (
        SELECT fld.id FROM public.fields fld
        JOIN public.farms f ON fld.farm_id = f.id
        JOIN public.farmers fm ON f.farmer_id = fm.id
        WHERE fm.auth_user_id = auth.uid()
    ));

-- -----------------------------------------------------------------------------
-- 5. SOIL PROFILES TABLE
-- In-situ or laboratory soil tests per field (or regional reference)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.soil_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    has_test BOOLEAN NOT NULL DEFAULT false,
    ph DOUBLE PRECISION,
    moisture_percentage DOUBLE PRECISION,
    nitrogen_kg_ha DOUBLE PRECISION,
    phosphorus_kg_ha DOUBLE PRECISION,
    potassium_kg_ha DOUBLE PRECISION,
    organic_carbon DOUBLE PRECISION,
    source TEXT NOT NULL DEFAULT 'REGIONAL_REFERENCE' CHECK (source IN ('USER_TEST', 'REGIONAL_REFERENCE', 'IN_SITU_SENSOR')),
    tested_at DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.soil_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can view own soil_profiles"
    ON public.soil_profiles FOR SELECT
    USING (field_id IN (
        SELECT fld.id FROM public.fields fld
        JOIN public.farms f ON fld.farm_id = f.id
        JOIN public.farmers fm ON f.farmer_id = fm.id
        WHERE fm.auth_user_id = auth.uid()
    ));

CREATE POLICY "Farmers can insert/update own soil_profiles"
    ON public.soil_profiles FOR ALL
    USING (field_id IN (
        SELECT fld.id FROM public.fields fld
        JOIN public.farms f ON fld.farm_id = f.id
        JOIN public.farmers fm ON f.farmer_id = fm.id
        WHERE fm.auth_user_id = auth.uid()
    ));

-- -----------------------------------------------------------------------------
-- 6. FARMER PREFERENCES TABLE
-- Stores risk posture, liquidation priorities, and storage preferences
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.farmer_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL UNIQUE REFERENCES public.farmers(id) ON DELETE CASCADE,
    risk_posture TEXT NOT NULL DEFAULT 'BALANCED' CHECK (risk_posture IN ('SAFER', 'BALANCED', 'OPPORTUNITY')),
    immediate_cash_weight DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    weather_risk_aversion DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.farmer_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can manage own preferences"
    ON public.farmer_preferences FOR ALL
    USING (farmer_id IN (SELECT id FROM public.farmers WHERE auth_user_id = auth.uid()));

-- -----------------------------------------------------------------------------
-- 7. DECISIONS & DECISION MEMORY TABLE
-- Longitudinal record of system recommendations & farmer choices
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    crop_cycle_id UUID REFERENCES public.crop_cycles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    primary_recommendation TEXT NOT NULL,
    expected_realization_inr DOUBLE PRECISION NOT NULL,
    p10_inr DOUBLE PRECISION,
    p90_inr DOUBLE PRECISION,
    confidence DOUBLE PRECISION NOT NULL,
    farmer_action TEXT NOT NULL DEFAULT 'PENDING' CHECK (farmer_action IN ('PENDING', 'ACCEPTED', 'REJECTED')),
    rejection_reason TEXT,
    farmer_notes TEXT,
    action_taken_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can manage own decisions"
    ON public.decisions FOR ALL
    USING (field_id IN (
        SELECT fld.id FROM public.fields fld
        JOIN public.farms f ON fld.farm_id = f.id
        JOIN public.farmers fm ON f.farmer_id = fm.id
        WHERE fm.auth_user_id = auth.uid()
    ));

-- -----------------------------------------------------------------------------
-- 8. HARVEST OUTCOMES TABLE
-- Verified physical outcomes reported by farmers
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.harvest_outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    decision_id UUID REFERENCES public.decisions(id) ON DELETE SET NULL,
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    mandi_name TEXT NOT NULL,
    sold_quintals DOUBLE PRECISION NOT NULL,
    price_per_quintal DOUBLE PRECISION NOT NULL,
    transport_paid_inr DOUBLE PRECISION NOT NULL,
    mandi_fees_paid_inr DOUBLE PRECISION NOT NULL DEFAULT 0,
    actual_net_realization_inr DOUBLE PRECISION NOT NULL,
    sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
    receipt_verified BOOLEAN NOT NULL DEFAULT false,
    reported_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.harvest_outcomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can manage own harvest outcomes"
    ON public.harvest_outcomes FOR ALL
    USING (field_id IN (
        SELECT fld.id FROM public.fields fld
        JOIN public.farms f ON fld.farm_id = f.id
        JOIN public.farmers fm ON f.farmer_id = fm.id
        WHERE fm.auth_user_id = auth.uid()
    ));

-- -----------------------------------------------------------------------------
-- 9. EXECUTION PLANS TABLE
-- Multi-step physical logistical execution workflows for approved decisions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.execution_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    decision_id UUID REFERENCES public.decisions(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('SELL NOW', 'WAIT 3 DAYS', 'WAIT 5 DAYS', 'HOLD', 'SPLIT HARVEST')),
    crop TEXT NOT NULL,
    variety TEXT,
    plot TEXT,
    target_quantity_quintals DOUBLE PRECISION NOT NULL CHECK (target_quantity_quintals > 0),
    target_mandi TEXT NOT NULL,
    time_window_hours INTEGER NOT NULL DEFAULT 48,
    deadline_timestamp TIMESTAMPTZ,
    expected_gross_inr DOUBLE PRECISION NOT NULL,
    expected_freight_inr DOUBLE PRECISION NOT NULL,
    expected_net_inr DOUBLE PRECISION NOT NULL,
    overall_readiness TEXT NOT NULL DEFAULT 'READY' CHECK (overall_readiness IN ('READY', 'READY_WITH_CAUTION', 'CONSTRAINED', 'BLOCKED', 'UNKNOWN')),
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    farmer_approved BOOLEAN NOT NULL DEFAULT false,
    approved_at TIMESTAMPTZ,
    approved_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.execution_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can manage own execution plans"
    ON public.execution_plans FOR ALL
    USING (field_id IN (
        SELECT fld.id FROM public.fields fld
        JOIN public.farms f ON fld.farm_id = f.id
        JOIN public.farmers fm ON f.farmer_id = fm.id
        WHERE fm.auth_user_id = auth.uid()
    ));

-- -----------------------------------------------------------------------------
-- 10. EXECUTION EVENTS TABLE
-- Immutable physical telemetry & human verification checkpoints
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.execution_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    execution_plan_id UUID NOT NULL REFERENCES public.execution_plans(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'INFO' CHECK (status IN ('SUCCESS', 'WARNING', 'ALERT', 'INFO')),
    source TEXT NOT NULL,
    origin TEXT NOT NULL DEFAULT 'FARMER_CONFIRMED' CHECK (origin IN ('UNVERIFIED', 'FARMER_CONFIRMED', 'SYSTEM_OBSERVED', 'EXTERNAL_SOURCE_VERIFIED', 'DEMO', 'SIMULATED')),
    title TEXT NOT NULL,
    previous_state TEXT,
    current_state TEXT,
    evidence TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.execution_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can manage own execution events"
    ON public.execution_events FOR ALL
    USING (execution_plan_id IN (
        SELECT ep.id FROM public.execution_plans ep
        JOIN public.fields fld ON ep.field_id = fld.id
        JOIN public.farms f ON fld.farm_id = f.id
        JOIN public.farmers fm ON f.farmer_id = fm.id
        WHERE fm.auth_user_id = auth.uid()
    ));

-- -----------------------------------------------------------------------------
-- Indexes for Fast Multi-Tenant Retrieval
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_farmers_auth ON public.farmers(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_farms_farmer ON public.farms(farmer_id);
CREATE INDEX IF NOT EXISTS idx_fields_farm ON public.fields(farm_id);
CREATE INDEX IF NOT EXISTS idx_crop_cycles_field ON public.crop_cycles(field_id);
CREATE INDEX IF NOT EXISTS idx_decisions_field ON public.decisions(field_id);
CREATE INDEX IF NOT EXISTS idx_harvest_outcomes_field ON public.harvest_outcomes(field_id);
CREATE INDEX IF NOT EXISTS idx_execution_plans_field ON public.execution_plans(field_id);
CREATE INDEX IF NOT EXISTS idx_execution_events_plan ON public.execution_events(execution_plan_id);

