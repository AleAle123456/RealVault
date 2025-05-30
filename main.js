// ===== LOGIN LOGIC =====
const PASSWORD = "231723"; // Change this to your secret password
const loginScreen = document.getElementById("login-screen");
const appScreen = document.getElementById("app");
const loginInput = document.getElementById("password-input");
const loginBtn = document.getElementById("login-button");
const loginError = document.getElementById("login-error");

// Auto login if previously authenticated
if (localStorage.getItem("realvault-logged-in") === "true") {
  loginScreen.style.display = "none";
  appScreen.style.display = "block";
}

loginBtn?.addEventListener("click", () => {
  if (loginInput.value === PASSWORD) {
    localStorage.setItem("realvault-logged-in", "true");
    loginScreen.style.display = "none";
    appScreen.style.display = "block";
  } else {
    loginError.style.display = "block";
  }
});

// ===== FIREBASE INIT =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA1lNI0aO5E0Usw-H5jWMljzVC9qvT3XSg",
  authDomain: "physwallet-8f451.firebaseapp.com",
  databaseURL: "https://physwallet-8f451-default-rtdb.firebaseio.com",
  projectId: "physwallet-8f451",
  storageBucket: "physwallet-8f451.appspot.com",
  messagingSenderId: "473808876376",
  appId: "1:473808876376:ios:6cd301420f57f3ccebab2d"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const balanceRef = ref(db, "balance");

// ===== DOM Elements =====
const balanceDisplay = document.getElementById("balance");
const amountInput = document.getElementById("amount");
const addBtn = document.getElementById("add");
const subtractBtn = document.getElementById("subtract");

// ===== Balance Helpers =====
function getLocalBalance() {
  const val = localStorage.getItem("localBalance");
  return val ? parseFloat(val) : 0;
}

function setLocalBalance(value) {
  localStorage.setItem("localBalance", value);
  showBalance(value);
}

function showBalance(amount) {
  balanceDisplay.textContent = `${amount.toFixed(2)} RON`;
}

// ===== Firebase Syncing =====
function syncToFirebase() {
  const localValue = getLocalBalance();
  set(balanceRef, localValue)
    .then(() => console.log("✔ Synced to Firebase:", localValue))
    .catch((err) => console.error("Sync error:", err));
}

onValue(balanceRef, (snapshot) => {
  const val = snapshot.val();
  if (val !== null && navigator.onLine) {
    setLocalBalance(val);
  }
});

// ===== Update Logic =====
function updateBalance(multiplier) {
  const input = parseFloat(amountInput.value);
  if (isNaN(input) || input <= 0) return;

  const current = getLocalBalance();
  const updated = current + multiplier * input;

  setLocalBalance(updated);
  if (navigator.onLine) set(balanceRef, updated);

  amountInput.value = "";
}

// ===== Event Listeners =====
addBtn?.addEventListener("click", () => updateBalance(1));
subtractBtn?.addEventListener("click", () => updateBalance(-1));

window.addEventListener("online", () => {
  console.log("✅ Back online. Syncing...");
  syncToFirebase();
});

// ===== First Load =====
if (navigator.onLine) {
  syncToFirebase();
} else {
  showBalance(getLocalBalance());
}

const logoutBtn = document.getElementById("logout-button");

logoutBtn?.addEventListener("click", () => {
  localStorage.removeItem("realvault-logged-in");
  location.reload(); // Refresh the page to show login screen
});
