# Supabase Setup Guide for Vispute Restaurant

## 1. Create Your Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Name: `vispute-restaurant`
3. Database password: (save this!)
4. Region: **South Asia (Mumbai)** – for lowest latency
5. Plan: **Free**

## 2. Run Migrations in Order

Go to **SQL Editor** in Supabase Dashboard and run each file **in order**:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls.sql
supabase/migrations/003_seed.sql
```

> **Important**: Run them one at a time, check for errors before proceeding.

## 3. Get Your API Keys

Go to **Project Settings → API**:

| Key | Where to copy |
|-----|--------------|
| `Project URL` | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` key | `SUPABASE_SERVICE_ROLE_KEY` (server only, never expose) |

## 4. Create the First Admin User

1. Go to **Authentication → Users → Invite user**
2. Email: your admin email
3. After they sign up, go to **SQL Editor** and run:

```sql
INSERT INTO staff (user_id, role, name)
SELECT id, 'admin', 'Owner'
FROM auth.users
WHERE email = 'your-admin@email.com';
```

## 5. Create Staff Accounts

For each staff member (waiter, kitchen, cashier):

```sql
-- After they sign up via /admin panel, assign their role:
INSERT INTO staff (user_id, role, name)
SELECT id, 'waiter', 'Raju Waiter'  -- change role and name
FROM auth.users
WHERE email = 'staff@email.com';
```

## 6. Storage Bucket (for menu photos)

Go to **Storage → New Bucket**:
- Name: `menu-images`
- Public bucket: ✅ Yes
- File size limit: 5 MB
- Allowed MIME types: `image/jpeg, image/png, image/webp`

Then go to **Policies** for `menu-images` bucket:
```sql
-- Allow admin to upload
CREATE POLICY "Admin can upload menu images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'menu-images'
  AND EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND role = 'admin')
);

-- Allow public to view
CREATE POLICY "Public can view menu images"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');
```

## 7. Enable Realtime

Go to **Database → Replication** and ensure these tables have Realtime enabled:
- `orders`
- `order_items`
- `table_sessions`
- `menu_items`

## 8. Environment Variables

Create `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...
NEXT_PUBLIC_APP_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key_here
```

Get Gemini API key free at: [aistudio.google.com](https://aistudio.google.com/app/apikey)
