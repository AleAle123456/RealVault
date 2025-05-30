// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Firebase Config
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

// UI Elements
const balanceDisplay = document.getElementById("balance");
const amountInput = document.getElementById("amount");
const addBtn = document.getElementById("add");
const subtractBtn = document.getElementById("subtract");

// Update UI on balance change
onValue(balanceRef, (snapshot) => {
  const value = snapshot.val();
  balanceDisplay.textContent = `${(value ?? 0).toFixed(2)} RON`;
});

// Button Handlers
addBtn.addEventListener("click", () => updateBalance(1));
subtractBtn.addEventListener("click", () => updateBalance(-1));

// Update or Queue Balance
function updateBalance(change) {
  const amount = parseFloat(amountInput.value);
  if (isNaN(amount) || amount <= 0) return;

  if (navigator.onLine) {
    applyBalanceChange(change, amount);
  } else {
    queueOfflineChange(change, amount);
    alert("You're offline. Change saved and will sync later.");
  }

  amountInput.value = "";
}

// Apply to Firebase
function applyBalanceChange(change, amount) {
  onValue(balanceRef, (snapshot) => {
    const current = snapshot.val() ?? 0;
    const newBalance = current + change * amount;
    set(balanceRef, newBalance);
  }, { onlyOnce: true });
}

// Save locally while offline
function queueOfflineChange(change, amount) {
  const queue = JSON.parse(localStorage.getItem("unsyncedChanges") || "[]");
  queue.push({ change, amount });
  localStorage.setItem("unsyncedChanges", JSON.stringify(queue));
}

// Sync changes when online
function syncOfflineChanges() {
  const changes = JSON.parse(localStorage.getItem("unsyncedChanges") || "[]");
  if (changes.length === 0) return;

  onValue(balanceRef, (snapshot) => {
    let current = snapshot.val() ?? 0;
    for (const { change, amount } of changes) {
      current += change * amount;
    }
    set(balanceRef, current).then(() => {
      localStorage.removeItem("unsyncedChanges");
      console.log("Offline changes synced.");
    });
  }, { onlyOnce: true });
}

// Listen for online status
window.addEventListener("online", syncOfflineChanges);
