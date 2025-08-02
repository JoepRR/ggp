# Testing Guide - Good Girl Points App

## 🧪 **How to Test Your App**

### **1. Basic Functionality Test**

Visit your Railway URL and test these features:

#### **Login Test:**
- **Admin Login**: `anthony` / `admin123`
  - Should redirect to Admin Panel
  - Should see Points Management, Rewards Management, Redemption Tracker tabs
  
- **User Login**: `joep` / `user123`
  - Should redirect to Dashboard
  - Should see "Hi Joep 💖 You've been such a good girl!"
  - Should show 100 points balance

#### **Navigation Test:**
- **Hamburger menu** should work on mobile
- **All navigation links** should work
- **Admin Panel** should only be visible to anthony
- **Logout** should clear session and return to login

### **2. User Features (Joep)**

#### **Dashboard:**
- ✅ Shows current point balance (100)
- ✅ Shows recent activity
- ✅ Welcome message with cute emoji

#### **Rewards Shop:**
- ✅ Lists all available rewards
- ✅ Shows "Redeem" button for affordable rewards
- ✅ Shows point cost for each reward
- ✅ Redeeming should:
  - Deduct points from balance
  - Show confirmation message
  - Send notification to anthony

#### **My History:**
- ✅ Shows chronological activity log
- ✅ Displays action type, reason, points, timestamp
- ✅ Properly formatted dates

#### **Notifications:**
- ✅ Shows recent notifications
- ✅ Displays message and timestamp
- ✅ Updates when points are added/removed

### **3. Admin Features (Anthony)**

#### **Points Management:**
- ✅ Select user (joep)
- ✅ Add/Subtract points
- ✅ Enter amount and reason
- ✅ Submit updates balance and logs history

#### **Rewards Management:**
- ✅ Add new rewards
- ✅ Edit existing rewards
- ✅ Delete rewards
- ✅ Form validation

#### **Redemption Tracker:**
- ✅ Lists all redemptions
- ✅ Shows who redeemed what and when
- ✅ Properly formatted data

### **4. API Endpoints Test**

Test these URLs in your browser:
- `https://your-app.railway.app/api/health` - Should show status
- `https://your-app.railway.app/api/test` - Should show backend info

### **5. Common Issues & Fixes**

#### **If login doesn't work:**
- Check browser console for errors
- Try clearing browser cookies
- Check if backend is running

#### **If API calls fail:**
- Check CORS settings
- Verify session configuration
- Check database connection

#### **If database is empty:**
- Backend should auto-initialize with default data
- Check Railway logs for errors
- Restart the deployment if needed

### **6. Expected Default Data**

#### **Users:**
- anthony (admin) - 0 points
- joep (user) - 100 points

#### **Default Rewards:**
- Movie Night - 50 points
- Dinner Date - 100 points  
- Massage - 75 points
- Gaming Time - 25 points

## 🎉 **Success Indicators**

Your app is working correctly if:
- ✅ Both users can log in
- ✅ Role-based redirects work
- ✅ Points can be added/removed
- ✅ Rewards can be redeemed
- ✅ History and notifications work
- ✅ Admin panel is fully functional

## 🚨 **If Something's Broken**

1. **Check Railway logs** for error messages
2. **Test API endpoints** directly
3. **Clear browser cache** and try again
4. **Check database initialization** in logs

Your Good Girl Points app should now be fully functional! 💖 