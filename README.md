# Hardware Inventory Tracker

A simple, dark-mode web app for tracking hardware inventory with real-time updates via Firebase.

## Features

- **Inventory View** — See all items with search, filter by category/location, and stock status indicators
- **Admin Panel** — Add, edit, delete items and adjust quantities (alias-protected)
- **Take Items (Checkout)** — Simple cart-based checkout that auto-updates inventory
- **Activity Log** — Full history of who took/added what and when

## Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" and follow the steps
3. Once created, go to **Project Settings** (gear icon) > **General**
4. Scroll to "Your apps" > Click the **Web** icon (`</>`)
5. Register the app (any nickname) and copy the `firebaseConfig` object

### 2. Set Up Realtime Database

1. In Firebase Console, go to **Build** > **Realtime Database**
2. Click **Create Database**
3. Choose your region
4. Select **Start in test mode** (for development)
5. Click **Enable**

### 3. Configure the App

1. Open `js/firebase-config.js`
2. Replace the placeholder config with your Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};
```

### 4. Update Authorized Aliases

In `js/firebase-config.js`, update the `AUTHORIZED_ALIASES` array:

```javascript
const AUTHORIZED_ALIASES = [
    "admin",
    "aalejandro",
    "jsmith",
    "mgarcia"
];
```

### 5. Deploy to GitHub Pages

1. Create a new GitHub repository
2. Push this folder to the repo:
   ```bash
   cd hardware-inventory-tracker
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/hardware-inventory-tracker.git
   git push -u origin main
   ```
3. Go to repo **Settings** > **Pages**
4. Set source to **Deploy from a branch** > **main** > **/ (root)**
5. Your site will be live at `https://YOUR_USERNAME.github.io/hardware-inventory-tracker/`

## File Structure

```
hardware-inventory-tracker/
├── index.html          # Inventory view page
├── admin.html          # Admin management page
├── checkout.html       # Take items page
├── log.html            # Activity log page
├── css/
│   └── style.css       # Dark mode styling
├── js/
│   ├── firebase-config.js  # Firebase config + authorized aliases
│   ├── inventory.js    # Inventory view logic
│   ├── admin.js        # Admin panel logic
│   ├── checkout.js     # Checkout/take items logic
│   └── log.js          # Activity log logic
└── README.md
```

## Security Notes

- **Test mode** database rules expire after 30 days. Update your Firebase rules for production:
  ```json
  {
    "rules": {
      ".read": true,
      ".write": true
    }
  }
  ```
- The alias system is a convenience gate, not true security. For production use, consider Firebase Authentication.

## Browser Compatibility

Works in all modern browsers (Chrome, Firefox, Edge, Safari). Requires JavaScript enabled.
