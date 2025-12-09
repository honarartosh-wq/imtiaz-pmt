# 🔐 Imtiaz Trading Platform - Login Guide

## ✅ System Status: ALL LOGINS CONFIRMED WORKING

**Last Verified:** December 9, 2025  
**Testing Method:** Comprehensive E2E automated testing + API validation

---

## 📋 Valid Login Credentials

### 1️⃣ Manager Account
```
Email: manager@imtiaz.com
Password: manager123
```
- **Role:** Platform Manager
- **Access:** Full platform management capabilities

### 2️⃣ Admin Account
```
Email: admin@imtiaz.com
Password: admin123
```
- **Role:** Branch Administrator
- **Access:** Branch management and oversight

### 3️⃣ Client Account
```
Email: client@example.com
Password: client123
```
- **Role:** Trading Client
- **Access:** Trading dashboard with account balance $5,000

---

## 🌐 Accessing the Application

### For Development Environment:
- **Frontend URL:** http://localhost:3000
- **Backend API:** http://localhost:8001

### For Production/Preview Environment:
- Check your Emergent preview URL (usually provided in platform dashboard)
- Should be in format: `https://[your-app-name].preview.emergentagent.com`

---

## 🚀 Step-by-Step Login Instructions

### Step 1: Open the Application
1. Navigate to the correct URL (see above)
2. You should see the login page with two input fields

### Step 2: Clear Browser Cache (If Having Issues)
**Chrome/Edge:**
- Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
- Select "Cached images and files" and "Cookies and other site data"
- Click "Clear data"

**Firefox:**
- Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
- Select "Cookies" and "Cache"
- Click "Clear Now"

**Safari:**
- Go to Safari menu → Preferences → Privacy
- Click "Manage Website Data" → "Remove All"

### Step 3: Try Incognito/Private Mode
If clearing cache doesn't work, try opening the application in:
- **Chrome/Edge:** Press `Ctrl + Shift + N` (Windows) or `Cmd + Shift + N` (Mac)
- **Firefox:** Press `Ctrl + Shift + P` (Windows) or `Cmd + Shift + P` (Mac)
- **Safari:** File menu → New Private Window

### Step 4: Enter Credentials
1. Type the email address **exactly** as shown above (copy-paste recommended)
2. Type the password **exactly** as shown above (copy-paste recommended)
3. Click the "Login" button

### Step 5: Verify Success
- You should be redirected to the appropriate dashboard:
  - **Manager:** Manager Dashboard with platform overview
  - **Admin:** Admin Dashboard with branch management
  - **Client:** Client Dashboard with trading interface

---

## 🔍 Troubleshooting Common Issues

### Issue: "Incorrect email or password" Error

**Cause:** Credentials entered incorrectly

**Solution:**
1. Double-check email and password (they are **case-sensitive**)
2. Copy-paste credentials directly from this guide
3. Ensure no extra spaces before or after the email/password

### Issue: Page Shows "Loading..." Forever

**Cause:** Backend server not running or network issues

**Solution:**
1. Verify backend is running: `sudo supervisorctl status backend`
2. Check backend logs: `tail -n 50 /var/log/supervisor/backend.*.log`
3. Restart services if needed: `sudo supervisorctl restart backend frontend`

### Issue: Login Button Doesn't Respond

**Cause:** JavaScript errors or cached old code

**Solution:**
1. Open browser developer tools (F12)
2. Check Console tab for errors
3. Hard refresh the page: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
4. Clear cache and try again

### Issue: Dashboard Shows "Invalid user role"

**Cause:** User role not properly set in database

**Solution:**
Contact system administrator to verify user role in database

---

## 🛠 Technical Validation Results

### Backend API Testing ✅
```bash
# Manager Login Test
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@imtiaz.com","password":"manager123"}'
# Result: ✅ SUCCESS - Returns access_token and user data

# Admin Login Test  
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@imtiaz.com","password":"admin123"}'
# Result: ✅ SUCCESS - Returns access_token and user data

# Client Login Test
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@example.com","password":"client123"}'
# Result: ✅ SUCCESS - Returns access_token and user data
```

### Frontend E2E Testing ✅
- ✅ Login page loads correctly
- ✅ Form fields are functional
- ✅ API requests return HTTP 200 status
- ✅ JWT tokens stored in localStorage
- ✅ Manager Dashboard renders successfully
- ✅ Admin Dashboard renders successfully
- ✅ Client Dashboard renders successfully
- ✅ No console errors detected
- ✅ No CORS issues detected

---

## 📞 Still Having Issues?

If you've tried all the above steps and still cannot log in:

1. **Verify you're on the correct URL**
   - Development: http://localhost:3000
   - Preview: Check your Emergent dashboard for the correct preview URL

2. **Check your internet connection**
   - Ensure you can access the backend API

3. **Try a different browser**
   - Sometimes browser-specific issues can occur

4. **Check browser console for errors**
   - Press F12 to open Developer Tools
   - Go to Console tab
   - Share any error messages with support

---

## 📊 System Requirements

- **Browser:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **JavaScript:** Must be enabled
- **Cookies:** Must be enabled (for token storage)
- **LocalStorage:** Must be enabled (for authentication persistence)

---

## 🔒 Security Notes

- All passwords are hashed using bcrypt in the database
- JWT tokens are used for authentication
- Tokens expire after configured time period
- Refresh tokens allow seamless session renewal

---

**Document Version:** 1.0  
**Last Updated:** December 9, 2025  
**System Status:** ✅ Fully Operational
