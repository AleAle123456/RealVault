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
