# First Admin Setup Instructions

## Step 1: Sign Up
Go to `/signup` and create an account with:
- Email: `rmartinezwindycity@gmail.com`
- Password: `Mexico123$`
- Full Name: Your Name

## Step 2: Promote to Admin

### Option A: Easy Way (No SQL Required)
1. While logged in, go to `/first-admin`
2. Click "Make Me Admin"
3. You'll be redirected to `/staff-login` on success

### Option B: Manual SQL Method
If Option A doesn't work, run this SQL query in your backend:

```sql
SELECT promote_user_to_admin('rmartinezwindycity@gmail.com');
```

This will:
- Remove the default customer role
- Assign the admin role
- Grant full access to the Admin Dashboard at `/admin`

## Step 3: Access Admin Dashboard
1. Log out and log back in (or refresh)
2. Go to `/staff-login`
3. Login with the same credentials
4. You'll be redirected to `/admin` automatically

## What You Can Do as Admin
- **Appointments Tab**: View and manage all appointments
- **Users Tab**: Manage user accounts and assign roles (admin/barber/customer)
- **Barbers Tab**: Create barber accounts, manage profiles, set availability schedules

## Creating Additional Admins
Once you're logged in as admin:
1. Go to Admin Dashboard → Users Tab
2. Click "Create Admin"
3. Fill in email, password, and name
4. New admin will be created instantly

## Creating Barber Accounts
1. Go to Admin Dashboard → Barbers Tab
2. Click "Add Barber"
3. Fill in all barber information
4. Barber account is created with login credentials
5. Default availability is set (Mon-Fri 9am-6pm)
6. Edit availability as needed
