// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue, set, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Your Firebase config with your DB URL
const firebaseConfig = {
  apiKey: "AIzaSyA1lNI0aO5E0Usw-H5jWMljzVC9qvT3XSg",
  authDomain: "physwallet-8f451.firebaseapp.com",
  databaseURL: "https://physwallet-8f451-default-rtdb.firebaseio.com",
  projectId: "physwallet-8f451",
  storageBucket: "physwallet-8f451.appspot.com",
  messagingSenderId: "473808876376",
  appId: "1:473808876376:ios:6cd301420f57f3ccebab2d"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const balanceRef = ref(db, 'balance');

// UI Elements
const balanceDisplay = document.getElementById("balance");
const amountInput = document.getElementById("amount");
const addBtn = document.getElementById("add");
const subtractBtn = document.getElementById("subtract");

// Update UI when Firebase data changes
onValue(balanceRef, (snapshot) => {
  const value = snapshot.val() ?? 0;
  balanceDisplay.textContent = value.toFixed(2) + " RON";
});

// Async update balance helper
async function updateBalance(change) {
  const amount = parseFloat(amountInput.value);
  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid positive number");
    return;
  }
  
  try {
    const snapshot = await get(balanceRef);
    const current = snapshot.val() ?? 0;
    const newBalance = current + change * amount;
    await set(balanceRef, newBalance);
    amountInput.value = "";
  } catch (error) {
    console.error("Failed to update balance:", error);
    alert("Failed to update balance. Check console.");
  }
}

// Button events
addBtn.addEventListener("click", () => updateBalance(1));
subtractBtn.addEventListener("click", () => updateBalance(-1));
