// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA1lNI0aO5E0Usw-H5jWMljzVC9qvT3XSg",
  authDomain: "physwallet-8f451.firebaseapp.com",
  databaseURL: "https://physwallet-8f451-default-rtdb.firebaseio.com", // ✅ Correct URL
  projectId: "physwallet-8f451",
  storageBucket: "physwallet-8f451.appspot.com",
  messagingSenderId: "473808876376",
  appId: "1:473808876376:ios:6cd301420f57f3ccebab2d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const balanceRef = ref(db, "balance");

// DOM Elements
const balanceDisplay = document.getElementById("balance");
const amountInput = document.getElementById("amount");
const addBtn = document.getElementById("add");
const subtractBtn = document.getElementById("subtract");

// Helper: Show balance in RON
function showBalance(amount) {
  balanceDisplay.textContent = `${amount.toFixed(2)} RON`;
}

// Local storage helpers
function getLocalBalance() {
  const value = localStorage.getItem("localBalance");
  return value ? parseFloat(value) : 0;
}

function setLocalBalance(value) {
  localStorage.setItem("localBalance", value);
  showBalance(value);
}

// Sync local balance to Firebase when online
function syncToFirebase() {
  const localValue = getLocalBalance();
  set(balanceRef, localValue);
  console.log("✔ Synced local balance to Firebase:", localValue);
}

// Real-time Firebase listener
onValue(balanceRef, (snapshot) => {
  const val = snapshot.val();
  if (val !== null) {
    setLocalBalance(val); // Update local as well
  }
});

// Update balance (works offline or online)
function updateBalance(change) {
  const inputAmount = parseFloat(amountInput.value);
  if (isNaN(inputAmount) || inputAmount <= 0) return;

  const current = getLocalBalance();
  const updated = current + change * inputAmount;

  setLocalBalance(updated);
  if (navigator.onLine) {
    set(balanceRef, updated);
  }

  amountInput.value = "";
}

// Event listeners
addBtn.addEventListener("click", () => updateBalance(1));
subtractBtn.addEventListener("click", () => updateBalance(-1));

// Initial balance display
if (!navigator.onLine) {
  setLocalBalance(getLocalBalance());
}

// Sync once back online
window.addEventListener("online", () => {
  syncToFirebase();
});

// Optional: Sync on page load if online
if (navigator.onLine) {
  syncToFirebase();
}
