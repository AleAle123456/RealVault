// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA1lNI0aO5E0Usw-H5jWMljzVC9qvT3XSg",
  authDomain: "physwallet-8f451.firebaseapp.com",
  databaseURL: "https://physwallet-8f451-default-rtdb.firebaseio.com",
  projectId: "physwallet-8f451",
  storageBucket: "physwallet-8f451.appspot.com",
  messagingSenderId: "473808876376",
  appId: "1:473808876376:ios:6cd301420f57f3ccebab2d"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const balanceRef = ref(db, 'balance');

// 1. Listen for online status
window.addEventListener("online", syncLocalChanges);
window.addEventListener("offline", () => {
  console.log("You are now offline.");
});

// 2. Override updateBalance to store changes offline if needed
function updateBalance(change) {
  const amount = parseFloat(amountInput.value);
  if (isNaN(amount) || amount <= 0) return;

  if (!navigator.onLine) {
    queueOfflineChange(change, amount);
    alert("You're offline. Your change has been saved and will sync when you're back online.");
  } else {
    applyBalanceChange(change, amount);
  }

  amountInput.value = "";
}

// 3. Save unsynced changes locally
function queueOfflineChange(change, amount) {
  const changes = JSON.parse(localStorage.getItem("unsyncedChanges") || "[]");
  changes.push({ change, amount });
  localStorage.setItem("unsyncedChanges", JSON.stringify(changes));
}

// 4. Apply and sync them when online
function syncLocalChanges() {
  const changes = JSON.parse(localStorage.getItem("unsyncedChanges") || "[]");
  if (changes.length === 0) return;

  console.log("Syncing offline changes...");

  onValue(balanceRef, (snapshot) => {
    let current = snapshot.val() ?? 0;
    for (const { change, amount } of changes) {
      current += change * amount;
    }
    set(balanceRef, current).then(() => {
      localStorage.removeItem("unsyncedChanges");
      console.log("Offline changes synced successfully!");
    });
  }, { onlyOnce: true });
}


// UI Elements
const balanceDisplay = document.getElementById("balance");
const amountInput = document.getElementById("amount");
const addBtn = document.getElementById("add");
const subtractBtn = document.getElementById("subtract");

// Local fallback
let localBalance = parseFloat(localStorage.getItem("balance")) || 0;
balanceDisplay.textContent = `${localBalance.toFixed(2)} RON`;

// Firebase updates
onValue(balanceRef, (snapshot) => {
  const value = snapshot.val();
  if (value != null) {
    localBalance = value;
    localStorage.setItem("balance", value);
    balanceDisplay.textContent = `${value.toFixed(2)} RON`;
  }
});

// Update balance
function updateBalance(change) {
  const amount = parseFloat(amountInput.value);
  if (isNaN(amount) || amount <= 0) return;

  const newBalance = localBalance + change * amount;
  localBalance = newBalance;
  localStorage.setItem("balance", newBalance);
  balanceDisplay.textContent = `${newBalance.toFixed(2)} RON`;

  // Update Firebase (fails silently if offline)
  set(balanceRef, newBalance).catch(() => {
    console.warn("Offline: Firebase update failed, saved locally.");
  });

  amountInput.value = "";
}

// Button actions
addBtn.addEventListener("click", () => updateBalance(1));
subtractBtn.addEventListener("click", () => updateBalance(-1));

// Optional: Register service worker for PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log("✅ Service Worker Registered"))
    .catch(err => console.error("Service Worker Failed:", err));
}
