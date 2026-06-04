// ============================================================
// Firebase Configuration
// ============================================================
// INSTRUCTIONS: Replace the config below with your Firebase project config.
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project (or use existing)
// 3. Go to Project Settings > General > Your apps > Add web app
// 4. Copy the firebaseConfig object and paste it below
// 5. In Firebase Console, go to Realtime Database > Create Database
//    - Choose "Start in test mode" for development
// ============================================================

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, get, push, remove, update, onValue, query, orderByChild, limitToLast }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ============================================================
// Authorized Aliases
// ============================================================
// Add or remove aliases as needed. Case-insensitive matching is used.
const AUTHORIZED_ALIASES = [
    "admin",
    "aalejandro",
    "jsmith",
    "mgarcia"
];

// ============================================================
// Shared Utility Functions
// ============================================================
function isAuthorized(alias) {
    return AUTHORIZED_ALIASES.includes(alias.toLowerCase().trim());
}

function formatTimestamp(ts) {
    const date = new Date(ts);
    return date.toLocaleString();
}

function getStatusBadge(quantity) {
    if (quantity === 0) return '<span class="status-badge status-out">Out of Stock</span>';
    if (quantity <= 5) return '<span class="status-badge status-low">Low Stock</span>';
    return '<span class="status-badge status-ok">In Stock</span>';
}

// Export for use in other modules
window.FirebaseDB = { db, ref, set, get, push, remove, update, onValue, query, orderByChild, limitToLast };
window.AppUtils = { isAuthorized, formatTimestamp, getStatusBadge, AUTHORIZED_ALIASES };
