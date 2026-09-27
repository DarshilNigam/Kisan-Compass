# 🌾 KISAN COMPASS — Farm Decision Intelligence

> **Deterministic, explainable, and multi-tenant decision engine for smallholder agriculture.**  
> Transforming raw agricultural telemetry into risk-hedged, profit-maximizing harvest and market decisions.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646cff.svg?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20RLS-3ecf8e.svg?logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 Executive Summary & Pitch

Indian agriculture suffers from an acute **information asymmetry and decision paralysis** problem. Smallholder farmers are inundated with raw data—weather forecasts, fluctuating APMC mandi prices, government advisory bulletins—yet lack tools that synthesize these fragmented signals into an **actionable, risk-hedged decision**.

Most agricultural tech products fall into one of two extremes:
1. **Static advisory portals** that broadcast generic weather without calculating financial repercussions on the farmer's specific field.
2. **Generative AI "wrapper" chatbots** that hallucinate arithmetic, invent crop prices, and provide high-risk recommendations with zero algorithmic accountability.

**KISAN COMPASS** solves this through **Deterministic Farm Decision Intelligence**. It connects live meteorological telemetry, spatial mandi price discovery, crop maturation biology, and multi-tenant farmer profile state into a **100% deterministic mathematical decision core**. The system generates precise harvest windows, freight-optimized market routes, and probabilistic P10/P50/P90 financial returns. An explainability layer translates these calculations into transparent, trustworthy advisory narratives in regional languages—guaranteeing that **every number displayed is backed by real mathematical proof**.

---

## 🏛 Architectural Differentiation: Deterministic Math vs. LLM

A foundational engineering pillar of Kisan Compass is the strict separation of **quantitative computation** from **natural language generation**:

```
+-----------------------------------------------------------------------------------+
|                              FARMER USER INTERFACE                                |
|           (React 18 · TypeScript · Spatial Compass · Tailwind CSS)                 |
+-----------------------------------------------------------------------------------+
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
+--------------------------------------+   +----------------------------------------+
|      DETERMINISTIC DECISION CORE     |   |      EXPLAINABILITY & NARRATIVE        |
|      (Zero AI / 100% Deterministic)  |   |           (Language Synthesis)         |
+--------------------------------------+   +----------------------------------------+
| • P10/P50/P90 Gross Margin Analysis  |   | • Translates mathematical rationale    |
| • Haversine + 1.25x Curvature Freight|   | • Outlines "Why Now" vs "Why Wait"     |
| • Continuous Harvest Quality Decay   |   | • Generates bilingual advice (EN / HI) |
| • Moisture Penalty & Storage Risk    |   | • STRICT RULE: Cannot alter or         |
| • Agronomic Safety Guardrails        |   |   hallucinate any computed numbers     |
+--------------------------------------+   +----------------------------------------+
```

| Dimension | Generic LLM Ag-Chatbots | KISAN COMPASS Architecture |
| :--- | :--- | :--- |
| **Financial Calculations** | LLM guesses revenue/loss (hallucination prone) | **100% Deterministic Code Execution** (P10/P50/P90 math) |
| **Logistics & Mandi Freight**| Generic distance heuristics | **Haversine + 1.25x rural road curvature factor** |
| **Data Provenance** | Unverified training cutoff weights | **Explicit Data Provenance tags** (`LIVE_SENSOR`, `CACHED`, `BENCHMARK`) |
| **Failure Mode** | Hallucinates plausible false answers | **Graceful Confidence Degradation** ("Failure lowers confidence — never truthfulness") |
| **Multi-Tenancy & Security** | Client-side mock state | **PostgreSQL Row-Level Security (RLS)** keyed to `auth.uid()` |

---

## 🌟 10 Core Features & Capabilities

1. **Multi-Tenant Farm Relational Architecture**  
   Strict 8-table relational hierarchy (`farmers`, `farms`, `fields`, `crop_cycles`, `soil_profiles`, `farmer_preferences`, `decisions`, `harvest_outcomes`) isolating farmer state at the database level.
2. **Hyperlocal Weather Intelligence (Live Open-Meteo Integration)**  
   Real-time meteorological ingest using field GPS coordinates (or tehsil centroid). Hourly rainfall probability, temperature extremes, relative humidity, and 7-day cumulative precipitations.
3. **Spatial Mandi Realization Engine (AGMARKNET Discovery)**  
   Calculates true farmgate net realization:  
   $$\text{Net Realization} = (\text{Mandi Price} \times \text{Yield}) - \text{Transport Freight} - \text{Mandi Cess} - \text{Handling Charges}$$  
   Accounts for vehicle capacity (tractor-trolley vs. pickup), road winding factor, and perishable transit delay.
4. **Dynamic Harvest Window Optimizer**  
   Evaluates 14-day rolling harvest windows against rainfall forecasts, soil moisture trafficability, crop lodging risk, and physiological maturity curve.
5. **Deterministic Decision Engine with P10/P50/P90 Range Analysis**  
   Provides probabilistic gross margin distributions under pessimistic (P10), expected (P50), and optimistic (P90) market scenarios to match the farmer's stated risk tolerance (`CONSERVATIVE`, `BALANCED`, `AGGRESSIVE`).
6. **Explainable AI Reasoning (Transparent Decision Proof)**  
   Provides step-by-step breakdown explaining *why* a particular harvest date or mandi destination was prioritized over alternatives.
7. **Multi-Source Data Provenance & Truthfulness Badging**  
   Every data point in the system carries an explicit provenance tag (`LIVE_SENSOR`, `CACHED`, `BENCHMARK`, `USER_STATED`) and a confidence coefficient (0.0 to 1.0).
8. **Graceful Degradation & Network Resilience**  
   If the device or network loses connection to live weather or market APIs, the system falls back safely to cached benchmarks, surfaces visual provenance badges, and lowers calculation confidence scores rather than failing or inventing data.
9. **Enterprise-Grade PostgreSQL Row-Level Security (RLS)**  
   Zero unauthorized cross-tenant data leakage. Every SELECT, INSERT, UPDATE query is constrained by `auth.uid() = auth_user_id`. No `service_role` keys exist in client-side code.
10. **Human-in-the-Loop Decision Execution & Retrospective Calibration**  
    Farmers retain complete sovereign override. Recorded decisions feed into retrospective outcome calibration to track real-world realized price against system forecasts.

---

## 🏗 System Architecture

```mermaid
flowchart TD
    subgraph UI ["Client Layer (React 18 + Vite + Tailwind CSS)"]
        UI_Home["Spatial Compass & Dashboard"]
        UI_Onboarding["Profile & Farm Onboarding"]
        UI_Decisions["Decision Command Center"]
        UI_Optimizer["Harvest & Market Optimizer"]
    end

    subgraph AuthSecurity ["Identity & Security Layer"]
        SupabaseAuth["Supabase Authentication (JWT)"]
        RLS["PostgreSQL Row-Level Security (RLS)"]
    end

    subgraph DataIngestion ["External Data Ingestion Services"]
        WeatherAPI["Open-Meteo Hyperlocal API\n(Rain, Temp, Humidity, Wind)"]
        MarketAPI["AGMARKNET / DMI Mandi Service\n(Modal Prices, Arrivals)"]
        SpatialService["Haversine Logistics Calculator\n(Distance, Fuel, Road Curvature)"]
    end

    subgraph DeterministicEngine ["Deterministic Calculation Engine"]
        Engine_Decide["Decision Engine\n(P10 / P50 / P90 Financial Risk)"]
        Engine_Harvest["Harvest Optimizer\n(Maturation Decay, Rain Hazard)"]
        Engine_Market["Net Realization Engine\n(Freight, Handling, Net Realized ₹/Q)"]
        Engine_Prov["Provenance & Confidence Scorer\n(LIVE_SENSOR / CACHED / BENCHMARK)"]
    end

    subgraph Storage ["Database Persistence (Supabase Cloud PostgreSQL)"]
        DB_Farmers[(farmers)]
        DB_Farms[(farms)]
        DB_Fields[(fields)]
        DB_Crops[(crop_cycles)]
        DB_Soil[(soil_profiles)]
        DB_Pref[(farmer_preferences)]
        DB_Decisions[(decisions)]
        DB_Outcomes[(harvest_outcomes)]
    end

    subgraph Narrative ["Explainability Layer"]
        LLM_Explain["Explainability Generator\n(Bilingual English/Hindi Justification)"]
    end

    UI -->|JWT Bearer Token| SupabaseAuth
    SupabaseAuth -->|auth.uid()| RLS
    RLS --> Storage

    UI --> DataIngestion
    DataIngestion --> DeterministicEngine
    Storage --> DeterministicEngine
    DeterministicEngine --> Narrative
    DeterministicEngine --> UI
    Narrative --> UI
```

---

## 🔒 Security & Multi-Tenancy Architecture

Kisan Compass enforces strict database-level security policies using Supabase PostgreSQL:

- **Row Level Security (RLS)** is enabled on all 8 application tables.
- Cross-tenant data isolation is mathematically guaranteed:
  ```sql
  -- Example: Farmers profile table RLS policy
  CREATE POLICY "Farmers can view own profile"
      ON public.farmers FOR SELECT
      USING (auth.uid() = auth_user_id);
  ```
- **Zero Secret Exposure**: Only the public `VITE_SUPABASE_ANON_KEY` is bundled client-side. No `service_role` keys are ever shipped to the frontend.
- **Strict Production Gatekeeper**: In `production` mode (`VITE_APP_MODE=production`), the application strictly forbids synthetic offline user identities (`usr_pilot_01`), mandating verified Supabase Auth sessions.

---

## 📊 Data Sources & Truthful Provenance

| Data Domain | Primary Source | Fallback / Offline Source | Provenance Label |
| :--- | :--- | :--- | :--- |
| **Hyperlocal Weather** | Open-Meteo REST API (GPS coordinates) | Regional 10-year Agro-Climatic Norms | `LIVE_SENSOR` / `CACHED` |
| **Mandi Crop Prices** | AGMARKNET / Directorate of Marketing & Inspection | Government Minimum Support Price (MSP) / Historical Baseline | `LIVE_SENSOR` / `BENCHMARK` |
| **Distance & Transit** | Haversine + 1.25x rural road curvature model | District center logistics matrix | `COMPUTED` |
| **Farm & Field Details** | User stated via multi-step onboarding wizard | Stored in PostgreSQL multi-tenant tables | `USER_STATED` |

---

## 🚀 Local Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)
- A [Supabase](https://supabase.com/) project (free tier is fully supported)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_ORGANIZATION/kisan-compass.git
cd kisan-compass
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Edit `.env` and supply your Supabase project credentials:
```env
VITE_APP_MODE=production
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

### 4. Apply Database Migrations
1. Navigate to your Supabase project dashboard.
2. Open the **SQL Editor**.
3. Copy and run the contents of [`supabase/schema.sql`](supabase/schema.sql).
4. Verify that all 8 tables and their RLS policies are created.

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 6. Production Build Verification
To execute TypeScript type checking and compile an optimized production build:
```bash
npm run build
```

---

## 👥 Hackathon Team: FusionX4

| Member Name | Role / Focus Area |
| :--- | :--- |
| **Darshil Nigam** | Lead Architecture, Deterministic Engine & Full-Stack Systems |
| **Manvi Tripathi** | Agricultural Data Science, Weather Integration & Agronomic Logic |
| **Ritvika Srivastava** | UI/UX Engineering, Spatial Visualizations & Human-First Design |
| **Devanshu Gupta** | Security & Backend, PostgreSQL RLS & Performance Optimization |

---

## 📹 Project Submission Assets

- **Live Demonstration Video**: [Watch the Demo Video](YOUR_PUBLIC_GOOGLE_DRIVE_LINK) *(Ensure link is set to "Anyone with the link can view")*
- **Judge Presentation Deck**: [`KISAN_COMPASS_Final_Judge_Deck.pptx`](KISAN_COMPASS_Final_Judge_Deck.pptx)
- **Judge Presentation PDF**: [`KISAN_COMPASS_Final_Judge_Deck.pdf`](KISAN_COMPASS_Final_Judge_Deck.pdf)
- **Slide Visual Previews**: Located in the [`deck_preview/`](deck_preview/) directory.

---

## 🔍 Engineering Limitations & Roadmap

We believe in complete intellectual honesty regarding system boundaries:
1. **Connectivity in Remote Fields**: While the app caches data and displays graceful confidence degradation, real-time weather updates require periodic internet connectivity. Future iterations plan an **IVR / SMS dual-sync gateway** for feature phones.
2. **Satellite Multispectral Imagery**: Currently, crop health indices rely on farmer-reported observations and age-stage curves. Direct automated ingestion of Sentinel-2 / Landsat NDVI imagery is planned for v2.0.
3. **Mandi Gate Queue Latency**: Mandi arrival volumes are derived from public daily bulletins. Real-time truck queue tracking at physical mandi gates requires local weighbridge API integrations.

---

*Built with ❤️ by Team FusionX4 for Indian Smallholder Farmers.*
