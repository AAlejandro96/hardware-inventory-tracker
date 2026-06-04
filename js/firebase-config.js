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
    apiKey: "AIzaSyB9zKe_vuoxcdIMJO3ZnPkASs3DBD91Y8g",
    authDomain: "hardware-inventory-track-ff9f6.firebaseapp.com",
    databaseURL: "https://hardware-inventory-track-ff9f6-default-rtdb.firebaseio.com",
    projectId: "hardware-inventory-track-ff9f6",
    storageBucket: "hardware-inventory-track-ff9f6.firebasestorage.app",
    messagingSenderId: "1037380143341",
    appId: "1:1037380143341:web:40f7cba9eba162a69b24e4"
};

// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getDatabase, ref, set, get, push, remove, update, onValue, query, orderByChild, limitToLast }
    from "https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ============================================================
// Authorized Aliases
// ============================================================
// Add or remove aliases as needed. Case-insensitive matching is used.
const AUTHORIZED_ALIASES = [
    "stplatis",
    "ngamache",
    "katikins",
    "stacyf",
    "aalejandro"
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
