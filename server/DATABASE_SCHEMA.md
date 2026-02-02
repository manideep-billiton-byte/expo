# 🗄️ Expo Event Management Platform - Database Schema

## Database: PostgreSQL

This document contains all CREATE TABLE statements for the Expo Event Management Platform.

---

## Table of Contents
1. [organizations](#1-organizations)
2. [organization_invites](#2-organization_invites)
3. [users](#3-users)
4. [events](#4-events)
5. [exhibitors](#5-exhibitors)
6. [visitors](#6-visitors)
7. [leads](#7-leads)
8. [exhibitor_scanned_visitors](#8-exhibitor_scanned_visitors)
9. [invoices](#9-invoices)
10. [invoice_items](#10-invoice_items)
11. [custom_plans](#11-custom_plans)
12. [coupons](#12-coupons)

---

## Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  organizations  │────▶│     events      │────▶│   exhibitors    │
│                 │     │                 │     │                 │
│  id (PK)        │     │  id (PK)        │     │  id (PK)        │
│  org_name       │     │  organization_id│     │  organization_id│
│  primary_email  │     │  event_name     │     │  event_id       │
│  password_hash  │     │  qr_token       │     │  company_name   │
└────────┬────────┘     └────────┬────────┘     │  email          │
         │                       │              │  password_hash  │
         │                       │              └────────┬────────┘
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │    visitors     │              │
         │              │                 │              ▼
         │              │  id (PK)        │     ┌─────────────────┐
         │              │  event_id       │     │     leads       │
         │              │  first_name     │     │                 │
         │              │  unique_code    │     │  id (PK)        │
         │              │  password_hash  │     │  exhibitor_id   │
         │              └─────────────────┘     │  event_id       │
         │                                      │  organization_id│
         ▼                                      └─────────────────┘
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    invoices     │     │   custom_plans  │────▶│    coupons      │
│                 │     │                 │     │                 │
│  id (PK)        │     │  id (PK)        │     │  id (PK)        │
│  organization_id│     │  plan_name      │     │  custom_plan_id │
│  invoice_number │     │  monthly_price  │     │  coupon_code    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 1. organizations

Main table for storing organization/tenant information.

```sql
CREATE TABLE IF NOT EXISTS organizations (
  id BIGSERIAL PRIMARY KEY,
  org_name TEXT NOT NULL,
  trade_name TEXT,
  tenant_type TEXT,
  industry TEXT,
  size TEXT,
  api_access BOOLEAN NOT NULL DEFAULT FALSE,
  business_type TEXT,
  is_registered BOOLEAN,
  primary_email TEXT,
  primary_mobile TEXT,
  state TEXT,
  district TEXT,
  town TEXT,
  address TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  alt_phone TEXT,
  website TEXT,
  gst_number TEXT,
  pan_number TEXT,
  reg_number TEXT,
  date_inc DATE,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  features TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  plan TEXT NOT NULL DEFAULT 'Free',
  status TEXT NOT NULL DEFAULT 'Active',
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS organizations_primary_email_uniq 
  ON organizations (primary_email) WHERE primary_email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS organizations_gst_number_uniq 
  ON organizations (gst_number) WHERE gst_number IS NOT NULL;
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-incrementing ID |
| org_name | TEXT | NOT NULL | Organization name |
| trade_name | TEXT | | Trade/brand name |
| tenant_type | TEXT | | Type: Enterprise, SMB, etc. |
| industry | TEXT | | Industry sector |
| size | TEXT | | Company size range |
| api_access | BOOLEAN | DEFAULT FALSE | API access enabled |
| primary_email | TEXT | UNIQUE | Login email |
| primary_mobile | TEXT | | Primary phone |
| password_hash | TEXT | | Bcrypt hashed password |
| status | TEXT | DEFAULT 'Active' | Active, Inactive, Suspended |
| plan | TEXT | DEFAULT 'Free' | Subscription plan |

---

## 2. organization_invites

Stores invitation tokens for organization registration.

```sql
CREATE TABLE IF NOT EXISTS organization_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    invite_token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS organization_invites_email_idx ON organization_invites (email);
CREATE INDEX IF NOT EXISTS organization_invites_mobile_idx ON organization_invites (mobile);
CREATE INDEX IF NOT EXISTS organization_invites_token_idx ON organization_invites (invite_token);
CREATE INDEX IF NOT EXISTS organization_invites_status_idx ON organization_invites (status);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | UUID identifier |
| email | VARCHAR(255) | NOT NULL | Invitee email |
| mobile | VARCHAR(20) | NOT NULL | Invitee mobile |
| invite_token | VARCHAR(255) | UNIQUE, NOT NULL | Unique invitation token |
| status | VARCHAR(20) | DEFAULT 'PENDING' | PENDING, ACCEPTED, EXPIRED |
| expires_at | TIMESTAMPTZ | NOT NULL | Token expiration time |

---

## 3. users

System users (admins, staff) within organizations.

```sql
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE SET NULL,
  role TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT,
  department TEXT,
  permissions JSONB NOT NULL DEFAULT '{}'::JSONB,
  additional_permissions JSONB NOT NULL DEFAULT '{}'::JSONB,
  login_type TEXT NOT NULL DEFAULT 'manual',
  password_hash TEXT,
  force_reset BOOLEAN NOT NULL DEFAULT TRUE,
  security JSONB NOT NULL DEFAULT '{}'::JSONB,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS users_email_uniq ON users (email);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-incrementing ID |
| organization_id | BIGINT | FK → organizations.id | Parent organization |
| role | TEXT | | admin, manager, staff, etc. |
| email | TEXT | UNIQUE, NOT NULL | User email |
| password_hash | TEXT | | Bcrypt hashed password |
| permissions | JSONB | DEFAULT '{}' | Role-based permissions |
| force_reset | BOOLEAN | DEFAULT TRUE | Require password change |

---

## 4. events

Events created by organizations.

```sql
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  event_name TEXT NOT NULL,
  description TEXT,
  event_type TEXT,
  event_mode TEXT,
  industry TEXT,
  start_date DATE,
  end_date DATE,
  venue TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  organizer_name TEXT,
  contact_person TEXT,
  organizer_email TEXT,
  organizer_mobile TEXT,
  registration JSONB NOT NULL DEFAULT '{}'::JSONB,
  lead_capture JSONB NOT NULL DEFAULT '{}'::JSONB,
  communication JSONB NOT NULL DEFAULT '{}'::JSONB,
  qr_token TEXT,
  registration_link TEXT,
  qr_image_path TEXT,
  status TEXT NOT NULL DEFAULT 'Draft',
  
  -- Stall Configuration
  enable_stalls BOOLEAN DEFAULT FALSE,
  stall_config JSONB DEFAULT '{}'::JSONB,
  stall_types JSONB DEFAULT '[]'::JSONB,
  ground_layout_url TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS events_organization_id_idx ON events (organization_id);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-incrementing ID |
| organization_id | BIGINT | FK → organizations.id | Owner organization |
| name | TEXT | NOT NULL | Legacy name field |
| event_name | TEXT | NOT NULL | Display event name |
| event_type | TEXT | | Conference, Exhibition, etc. |
| event_mode | TEXT | | In-Person, Virtual, Hybrid |
| start_date | DATE | | Event start date |
| end_date | DATE | | Event end date |
| qr_token | TEXT | | UUID for registration URL |
| registration_link | TEXT | | Full registration URL |
| qr_image_path | TEXT | | Path to QR code image |
| status | TEXT | DEFAULT 'Draft' | Draft, Published, Live, Completed |
| enable_stalls | BOOLEAN | DEFAULT FALSE | Stall booking enabled |
| stall_config | JSONB | DEFAULT '{}' | Stall layout configuration |
| ground_layout_url | TEXT | | URL to ground layout image |

---

## 5. exhibitors

Companies exhibiting at events.

```sql
CREATE TABLE IF NOT EXISTS exhibitors (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE SET NULL,
  event_id BIGINT REFERENCES events(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  gst_number TEXT,
  address TEXT,
  industry TEXT,
  logo_url TEXT,
  contact_person TEXT,
  email TEXT,
  mobile TEXT,
  password_hash TEXT,
  stall_number TEXT,
  stall_category TEXT,
  access_status TEXT NOT NULL DEFAULT 'Active',
  lead_capture JSONB NOT NULL DEFAULT '{}'::JSONB,
  communication JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS exhibitors_event_id_idx ON exhibitors (event_id);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-incrementing ID |
| organization_id | BIGINT | FK → organizations.id | Parent organization |
| event_id | BIGINT | FK → events.id | Registered event |
| company_name | TEXT | NOT NULL | Exhibitor company name |
| email | TEXT | | Login email |
| mobile | TEXT | | Phone number |
| password_hash | TEXT | | Bcrypt hashed password |
| stall_number | TEXT | | Assigned stall number |
| stall_category | TEXT | | Premium, Standard, etc. |
| access_status | TEXT | DEFAULT 'Active' | Active, Inactive |
| lead_capture | JSONB | DEFAULT '{}' | Lead capture settings |

---

## 6. visitors

Event attendees/visitors.

```sql
CREATE TABLE IF NOT EXISTS visitors (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT REFERENCES events(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  mobile TEXT,
  password_hash TEXT,
  unique_code TEXT UNIQUE,
  gender TEXT,
  age_group TEXT,
  organization TEXT,
  designation TEXT,
  visitor_category TEXT,
  valid_dates TEXT,
  communication JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS visitors_event_id_idx ON visitors (event_id);
CREATE UNIQUE INDEX IF NOT EXISTS visitors_unique_code_idx ON visitors (unique_code);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-incrementing ID |
| event_id | BIGINT | FK → events.id | Registered event |
| first_name | TEXT | NOT NULL | First name |
| last_name | TEXT | NOT NULL | Last name |
| email | TEXT | | Email address |
| mobile | TEXT | | Phone number |
| password_hash | TEXT | | Bcrypt hashed password |
| unique_code | TEXT | UNIQUE | QR code identifier (VIS-XXXXXXXX) |
| visitor_category | TEXT | | VIP, Regular, Press, etc. |
| valid_dates | TEXT | | Comma-separated valid dates |
| communication | JSONB | DEFAULT '{}' | {email: true, sms: false} |

---

## 7. leads

Leads captured by exhibitors from visitor scans.

```sql
CREATE TABLE IF NOT EXISTS leads (
  id BIGSERIAL PRIMARY KEY,
  exhibitor_id BIGINT REFERENCES exhibitors(id) ON DELETE CASCADE,
  event_id BIGINT REFERENCES events(id) ON DELETE SET NULL,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE SET NULL,
  
  -- Visitor Information
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  designation TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  industry TEXT,
  
  -- Lead Metadata
  source TEXT DEFAULT 'QR Scan',
  notes TEXT,
  rating INTEGER,
  status TEXT DEFAULT 'New',
  follow_up_date DATE,
  
  -- Additional Data
  additional_data JSONB DEFAULT '{}'::JSONB,
  
  -- Timestamps
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS leads_exhibitor_id_idx ON leads (exhibitor_id);
CREATE INDEX IF NOT EXISTS leads_event_id_idx ON leads (event_id);
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads (email);
CREATE INDEX IF NOT EXISTS leads_scanned_at_idx ON leads (scanned_at DESC);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-incrementing ID |
| exhibitor_id | BIGINT | FK → exhibitors.id | Exhibitor who captured |
| event_id | BIGINT | FK → events.id | Event context |
| name | TEXT | NOT NULL | Lead name |
| email | TEXT | | Lead email |
| phone | TEXT | | Lead phone |
| source | TEXT | DEFAULT 'QR Scan' | QR Scan, OCR, Manual |
| rating | INTEGER | | 1-5 star rating |
| status | TEXT | DEFAULT 'New' | New, Contacted, Qualified, etc. |
| follow_up_date | DATE | | Next follow-up date |

---

## 8. exhibitor_scanned_visitors

Raw scan data from QR/OCR scans by exhibitors.

```sql
CREATE TABLE IF NOT EXISTS exhibitor_scanned_visitors (
    id SERIAL PRIMARY KEY,
    
    -- Exhibitor who performed the scan
    exhibitor_id INTEGER REFERENCES exhibitors(id) ON DELETE SET NULL,
    
    -- Event context
    event_id INTEGER REFERENCES events(id) ON DELETE SET NULL,
    
    -- Original visitor ID (if scanned via QR)
    visitor_id INTEGER REFERENCES visitors(id) ON DELETE SET NULL,
    
    -- Scan type
    scan_type VARCHAR(20) NOT NULL CHECK (scan_type IN ('QR_SCAN', 'OCR')),
    
    -- Visitor details (captured at time of scan)
    visitor_name VARCHAR(255),
    visitor_email VARCHAR(255),
    visitor_phone VARCHAR(50),
    visitor_company VARCHAR(255),
    visitor_designation VARCHAR(255),
    visitor_unique_code VARCHAR(100),
    
    -- OCR specific
    ocr_raw_text TEXT,
    
    -- Notes and status
    notes TEXT,
    lead_status VARCHAR(50) DEFAULT 'New',
    interest_level VARCHAR(50),
    follow_up_date DATE,
    
    -- Timestamps
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_esv_exhibitor_id ON exhibitor_scanned_visitors(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_esv_event_id ON exhibitor_scanned_visitors(event_id);
CREATE INDEX IF NOT EXISTS idx_esv_scan_type ON exhibitor_scanned_visitors(scan_type);
CREATE INDEX IF NOT EXISTS idx_esv_scanned_at ON exhibitor_scanned_visitors(scanned_at);
CREATE INDEX IF NOT EXISTS idx_esv_visitor_email ON exhibitor_scanned_visitors(visitor_email);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| exhibitor_id | INTEGER | FK → exhibitors.id | Scanner exhibitor |
| event_id | INTEGER | FK → events.id | Event context |
| visitor_id | INTEGER | FK → visitors.id | Original visitor (if QR) |
| scan_type | VARCHAR(20) | CHECK constraint | 'QR_SCAN' or 'OCR' |
| visitor_unique_code | VARCHAR(100) | | QR code value |
| ocr_raw_text | TEXT | | Raw OCR extracted text |
| lead_status | VARCHAR(50) | DEFAULT 'New' | Lead progression status |
| interest_level | VARCHAR(50) | | Hot, Warm, Cold |

---

## 9. invoices

Billing invoices for organizations.

```sql
CREATE TABLE IF NOT EXISTS invoices (
  id BIGSERIAL PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE SET NULL,
  billing_email TEXT,
  billing_address TEXT,
  tax_id TEXT,
  plan_type TEXT,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  due_date DATE,
  payment_method TEXT,
  items JSONB NOT NULL DEFAULT '[]'::JSONB,
  notes TEXT,
  terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS invoices_invoice_number_uniq ON invoices (invoice_number);
CREATE INDEX IF NOT EXISTS invoices_organization_id_idx ON invoices (organization_id);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-incrementing ID |
| invoice_number | TEXT | UNIQUE, NOT NULL | INV-{timestamp} |
| organization_id | BIGINT | FK → organizations.id | Billed organization |
| amount | NUMERIC(12,2) | DEFAULT 0 | Total invoice amount |
| currency | TEXT | DEFAULT 'INR' | Currency code |
| status | TEXT | DEFAULT 'Pending' | Pending, Paid, Overdue |
| items | JSONB | DEFAULT '[]' | Array of line items |

---

## 10. invoice_items

Line items for invoices (optional, items also stored in invoices.items JSONB).

```sql
CREATE TABLE IF NOT EXISTS invoice_items (
  id BIGSERIAL PRIMARY KEY,
  invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT,
  quantity INT NOT NULL DEFAULT 1,
  price NUMERIC(12,2) NOT NULL DEFAULT 0
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-incrementing ID |
| invoice_id | BIGINT | FK → invoices.id | Parent invoice |
| description | TEXT | | Item description |
| quantity | INT | DEFAULT 1 | Item quantity |
| price | NUMERIC(12,2) | DEFAULT 0 | Unit price |

---

## 11. custom_plans

Subscription plans for organizations.

```sql
CREATE TABLE IF NOT EXISTS custom_plans (
  id BIGSERIAL PRIMARY KEY,
  plan_name TEXT NOT NULL,
  plan_type TEXT,
  description TEXT,
  validity_days INTEGER DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'Active',
  
  -- Pricing
  monthly_price NUMERIC(10,2),
  annual_price NUMERIC(10,2),
  
  -- Trial Settings
  enable_trial BOOLEAN DEFAULT FALSE,
  trial_days INTEGER DEFAULT 0,
  grace_period_days INTEGER DEFAULT 0,
  
  -- Feature Limits
  max_events INTEGER,
  max_leads INTEGER,
  max_users INTEGER,
  max_exhibitors_per_event INTEGER,
  whatsapp_messages INTEGER,
  ocr_scans INTEGER,
  
  -- Feature Access
  advanced_analytics BOOLEAN DEFAULT FALSE,
  crm_integration BOOLEAN DEFAULT FALSE,
  api_access BOOLEAN DEFAULT FALSE,
  white_label BOOLEAN DEFAULT FALSE,
  
  -- Overage Pricing
  per_lead_price NUMERIC(10,4),
  per_message_price NUMERIC(10,4),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-incrementing ID |
| plan_name | TEXT | NOT NULL | Plan display name |
| monthly_price | NUMERIC(10,2) | | Monthly subscription price |
| annual_price | NUMERIC(10,2) | | Annual subscription price |
| max_events | INTEGER | | Max events allowed |
| max_leads | INTEGER | | Max leads per month |
| api_access | BOOLEAN | DEFAULT FALSE | API access enabled |

---

## 12. coupons

Discount coupons linked to plans.

```sql
CREATE TABLE IF NOT EXISTS coupons (
  id BIGSERIAL PRIMARY KEY,
  coupon_code TEXT NOT NULL UNIQUE,
  custom_plan_id BIGINT REFERENCES custom_plans(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  max_usage INTEGER DEFAULT 1,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(coupon_code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-incrementing ID |
| coupon_code | TEXT | UNIQUE, NOT NULL | Coupon code string |
| custom_plan_id | BIGINT | FK → custom_plans.id | Associated plan |
| is_active | BOOLEAN | DEFAULT TRUE | Coupon active |
| usage_count | INTEGER | DEFAULT 0 | Times used |
| max_usage | INTEGER | DEFAULT 1 | Max allowed uses |
| expires_at | TIMESTAMPTZ | | Expiration date |

---

## Quick Setup Script

Run this complete script to create all tables:

```sql
-- Run in PostgreSQL to create complete database schema

-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id BIGSERIAL PRIMARY KEY,
  org_name TEXT NOT NULL,
  trade_name TEXT,
  tenant_type TEXT,
  industry TEXT,
  size TEXT,
  api_access BOOLEAN NOT NULL DEFAULT FALSE,
  business_type TEXT,
  is_registered BOOLEAN,
  primary_email TEXT,
  primary_mobile TEXT,
  state TEXT,
  district TEXT,
  town TEXT,
  address TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  alt_phone TEXT,
  website TEXT,
  gst_number TEXT,
  pan_number TEXT,
  reg_number TEXT,
  date_inc DATE,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  features TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  plan TEXT NOT NULL DEFAULT 'Free',
  status TEXT NOT NULL DEFAULT 'Active',
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Organization Invites
CREATE TABLE IF NOT EXISTS organization_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    invite_token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Users
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE SET NULL,
  role TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT,
  department TEXT,
  permissions JSONB NOT NULL DEFAULT '{}'::JSONB,
  additional_permissions JSONB NOT NULL DEFAULT '{}'::JSONB,
  login_type TEXT NOT NULL DEFAULT 'manual',
  password_hash TEXT,
  force_reset BOOLEAN NOT NULL DEFAULT TRUE,
  security JSONB NOT NULL DEFAULT '{}'::JSONB,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Events
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  event_name TEXT NOT NULL,
  description TEXT,
  event_type TEXT,
  event_mode TEXT,
  industry TEXT,
  start_date DATE,
  end_date DATE,
  venue TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  organizer_name TEXT,
  contact_person TEXT,
  organizer_email TEXT,
  organizer_mobile TEXT,
  registration JSONB NOT NULL DEFAULT '{}'::JSONB,
  lead_capture JSONB NOT NULL DEFAULT '{}'::JSONB,
  communication JSONB NOT NULL DEFAULT '{}'::JSONB,
  qr_token TEXT,
  registration_link TEXT,
  qr_image_path TEXT,
  status TEXT NOT NULL DEFAULT 'Draft',
  enable_stalls BOOLEAN DEFAULT FALSE,
  stall_config JSONB DEFAULT '{}'::JSONB,
  stall_types JSONB DEFAULT '[]'::JSONB,
  ground_layout_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Exhibitors
CREATE TABLE IF NOT EXISTS exhibitors (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE SET NULL,
  event_id BIGINT REFERENCES events(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  gst_number TEXT,
  address TEXT,
  industry TEXT,
  logo_url TEXT,
  contact_person TEXT,
  email TEXT,
  mobile TEXT,
  password_hash TEXT,
  stall_number TEXT,
  stall_category TEXT,
  access_status TEXT NOT NULL DEFAULT 'Active',
  lead_capture JSONB NOT NULL DEFAULT '{}'::JSONB,
  communication JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Visitors
CREATE TABLE IF NOT EXISTS visitors (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT REFERENCES events(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  mobile TEXT,
  password_hash TEXT,
  unique_code TEXT UNIQUE,
  gender TEXT,
  age_group TEXT,
  organization TEXT,
  designation TEXT,
  visitor_category TEXT,
  valid_dates TEXT,
  communication JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Leads
CREATE TABLE IF NOT EXISTS leads (
  id BIGSERIAL PRIMARY KEY,
  exhibitor_id BIGINT REFERENCES exhibitors(id) ON DELETE CASCADE,
  event_id BIGINT REFERENCES events(id) ON DELETE SET NULL,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  designation TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  industry TEXT,
  source TEXT DEFAULT 'QR Scan',
  notes TEXT,
  rating INTEGER,
  status TEXT DEFAULT 'New',
  follow_up_date DATE,
  additional_data JSONB DEFAULT '{}'::JSONB,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Exhibitor Scanned Visitors
CREATE TABLE IF NOT EXISTS exhibitor_scanned_visitors (
    id SERIAL PRIMARY KEY,
    exhibitor_id INTEGER REFERENCES exhibitors(id) ON DELETE SET NULL,
    event_id INTEGER REFERENCES events(id) ON DELETE SET NULL,
    visitor_id INTEGER REFERENCES visitors(id) ON DELETE SET NULL,
    scan_type VARCHAR(20) NOT NULL CHECK (scan_type IN ('QR_SCAN', 'OCR')),
    visitor_name VARCHAR(255),
    visitor_email VARCHAR(255),
    visitor_phone VARCHAR(50),
    visitor_company VARCHAR(255),
    visitor_designation VARCHAR(255),
    visitor_unique_code VARCHAR(100),
    ocr_raw_text TEXT,
    notes TEXT,
    lead_status VARCHAR(50) DEFAULT 'New',
    interest_level VARCHAR(50),
    follow_up_date DATE,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id BIGSERIAL PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE SET NULL,
  billing_email TEXT,
  billing_address TEXT,
  tax_id TEXT,
  plan_type TEXT,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  due_date DATE,
  payment_method TEXT,
  items JSONB NOT NULL DEFAULT '[]'::JSONB,
  notes TEXT,
  terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Invoice Items
CREATE TABLE IF NOT EXISTS invoice_items (
  id BIGSERIAL PRIMARY KEY,
  invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT,
  quantity INT NOT NULL DEFAULT 1,
  price NUMERIC(12,2) NOT NULL DEFAULT 0
);

-- 11. Custom Plans
CREATE TABLE IF NOT EXISTS custom_plans (
  id BIGSERIAL PRIMARY KEY,
  plan_name TEXT NOT NULL,
  plan_type TEXT,
  description TEXT,
  validity_days INTEGER DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'Active',
  monthly_price NUMERIC(10,2),
  annual_price NUMERIC(10,2),
  enable_trial BOOLEAN DEFAULT FALSE,
  trial_days INTEGER DEFAULT 0,
  grace_period_days INTEGER DEFAULT 0,
  max_events INTEGER,
  max_leads INTEGER,
  max_users INTEGER,
  max_exhibitors_per_event INTEGER,
  whatsapp_messages INTEGER,
  ocr_scans INTEGER,
  advanced_analytics BOOLEAN DEFAULT FALSE,
  crm_integration BOOLEAN DEFAULT FALSE,
  api_access BOOLEAN DEFAULT FALSE,
  white_label BOOLEAN DEFAULT FALSE,
  per_lead_price NUMERIC(10,4),
  per_message_price NUMERIC(10,4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id BIGSERIAL PRIMARY KEY,
  coupon_code TEXT NOT NULL UNIQUE,
  custom_plan_id BIGINT REFERENCES custom_plans(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  max_usage INTEGER DEFAULT 1,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create all indexes
CREATE UNIQUE INDEX IF NOT EXISTS organizations_primary_email_uniq ON organizations (primary_email) WHERE primary_email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS organizations_gst_number_uniq ON organizations (gst_number) WHERE gst_number IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_email_uniq ON users (email);
CREATE INDEX IF NOT EXISTS events_organization_id_idx ON events (organization_id);
CREATE INDEX IF NOT EXISTS exhibitors_event_id_idx ON exhibitors (event_id);
CREATE INDEX IF NOT EXISTS visitors_event_id_idx ON visitors (event_id);
CREATE INDEX IF NOT EXISTS leads_exhibitor_id_idx ON leads (exhibitor_id);
CREATE INDEX IF NOT EXISTS leads_event_id_idx ON leads (event_id);
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads (email);
CREATE INDEX IF NOT EXISTS leads_scanned_at_idx ON leads (scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_esv_exhibitor_id ON exhibitor_scanned_visitors(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_esv_event_id ON exhibitor_scanned_visitors(event_id);
CREATE INDEX IF NOT EXISTS idx_esv_scan_type ON exhibitor_scanned_visitors(scan_type);
CREATE UNIQUE INDEX IF NOT EXISTS invoices_invoice_number_uniq ON invoices (invoice_number);
CREATE INDEX IF NOT EXISTS invoices_organization_id_idx ON invoices (organization_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(coupon_code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS organization_invites_email_idx ON organization_invites (email);
CREATE INDEX IF NOT EXISTS organization_invites_token_idx ON organization_invites (invite_token);
```

---

## Notes

1. **Password Storage**: All passwords are hashed using `bcryptjs` before storage
2. **JSONB Fields**: Used for flexible nested data (permissions, communication prefs, etc.)
3. **Timestamps**: All tables have `created_at` and `updated_at` with timezone
4. **Soft Deletes**: Status field used for logical deletion (Active/Inactive)
5. **Foreign Keys**: Use `ON DELETE SET NULL` or `ON DELETE CASCADE` as appropriate

---

*Generated: 2026-01-28*
