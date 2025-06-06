// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
  push
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Firebase config (replace with yours if needed)
const firebaseConfig = {
  apiKey: "AIzaSyDnH-sDgfjj2BfwwMJ-RuEKKi6oMCnzXOE",
  authDomain: "realvault.firebaseapp.com",
  projectId: "realvault",
  storageBucket: "realvault.appspot.com",
  messagingSenderId: "642931443380",
  appId: "1:642931443380:web:041abbc649d9613aee484e",
  databaseURL: "https://realvault-default-rtdb.europe-west1.firebasedatabase.app/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// References
const balanceRef = ref(db, "balance");
const transactionsRef = ref(db, "transactions");

// DOM Elements
const balanceDisplay = document.getElementById("balance");
const amountInput = document.getElementById("amount");
const addButton = document.getElementById("add");
const subtractButton = document.getElementById("subtract");
const historyDiv = document.getElementById("history");

const loginScreen = document.getElementById("login-screen");
const appScreen = document.getElementById("app");
const loginButton = document.getElementById("login-button");
const passwordInput = document.getElementById("password-input");
const loginError = document.getElementById("login-error");

// Password for demo (replace or secure in real app)
const PASSWORD = "1234";

// === Local Storage Sync ===
function getLocalBalance() {
  return parseFloat(localStorage.getItem("balance") || "0");
}

function setLocalBalance(value) {
  localStorage.setItem("balance", value);
  updateBalanceDisplay(value);
}

function updateBalanceDisplay(value) {
  balanceDisplay.textContent = `${value.toFixed(2)} RON`;
}

// === Update Firebase + Add Transaction ===
function updateBalance(multiplier) {
  const input = parseFloat(amountInput.value);
  if (isNaN(input) || input <= 0) return;

  const current = getLocalBalance();
  const updated = current + multiplier * input;

  setLocalBalance(updated);

  if (navigator.onLine) {
    // Sync balance
    set(balanceRef, updated);

    // Log transaction
    const transaction = {
      amount: multiplier * input,
      timestamp: Date.now(),
      note: "" // Optional note support in future
    };
    push(transactionsRef, transaction);
  } else {
    // Offline: store transaction locally and render after login or reconnect
    addLocalTransaction(multiplier * input);
  }

  amountInput.value = "";
}

// === Local transaction history for offline support ===
function getLocalHistory() {
  return JSON.parse(localStorage.getItem("history") || "[]");
}

function setLocalHistory(history) {
  localStorage.setItem("history", JSON.stringify(history));
}

function addLocalTransaction(amount) {
  const history = getLocalHistory();
  history.push({
    amount,
    timestamp: Date.now(),
    note: ""
  });
  setLocalHistory(history);
  renderLocalHistory();
}

// === Render History ===
function renderHistory(data) {
  historyDiv.innerHTML = ""; // Clear existing
  const entries = Object.entries(data || {}).reverse(); // Newest first

  if (entries.length === 0) {
    historyDiv.innerHTML = "<p>No transactions yet.</p>";
    return;
  }

  for (const [id, tx] of entries) {
    const date = new Date(tx.timestamp).toLocaleString();
    const sign = tx.amount >= 0 ? "+" : "−";
    const color = tx.amount >= 0 ? "green" : "red";
    const note = tx.note || "";

    const item = document.createElement("div");
    item.style.borderBottom = "1px solid #ccc";
    item.style.padding = "6px 0";
    item.innerHTML = `
      <div><strong style="color:${color}">${sign}${Math.abs(tx.amount).toFixed(2)} RON</strong></div>
      <small>${date}</small>${note ? `<br><em>${note}</em>` : ""}
    `;
    historyDiv.appendChild(item);
  }
}

function renderLocalHistory() {
  const localHistory = getLocalHistory().slice().reverse();
  historyDiv.innerHTML = "";

  if (localHistory.length === 0) {
    historyDiv.innerHTML = "<p>No transactions yet.</p>";
    return;
  }

  for (const tx of localHistory) {
    const date = new Date(tx.timestamp).toLocaleString();
    const sign = tx.amount >= 0 ? "+" : "−";
    const color = tx.amount >= 0 ? "green" : "red";
    const note = tx.note || "";

    const item = document.createElement("div");
    item.style.borderBottom = "1px solid #ccc";
    item.style.padding = "6px 0";
    item.innerHTML = `
      <div><strong style="color:${color}">${sign}${Math.abs(tx.amount).toFixed(2)} RON</strong></div>
      <small>${date}</small>${note ? `<br><em>${note}</em>` : ""}
    `;
    historyDiv.appendChild(item);
  }
}

// === Firebase Realtime Listeners ===
onValue(balanceRef, (snapshot) => {
  const value = snapshot.val();
  if (value !== null) {
    setLocalBalance(value);
  }
});

onValue(transactionsRef, (snapshot) => {
  const data = snapshot.val();
  renderHistory(data);
});

// === Login Logic ===
function showApp() {
  loginScreen.style.display = "none";
  appScreen.style.display = "block";

  // Show balance and history
  updateBalanceDisplay(getLocalBalance());

  // Render history from Firebase or local offline transactions
  if (navigator.onLine) {
    // History will be rendered by Firebase listener
  } else {
    renderLocalHistory();
  }
}

loginButton.addEventListener("click", () => {
  const pass = passwordInput.value;
  if (pass === PASSWORD) {
    localStorage.setItem("realvault-logged-in", "true");
    loginError.style.display = "none";
    showApp();
  } else {
    loginError.style.display = "block";
  }
});

window.addEventListener("load", () => {
  if (localStorage.getItem("realvault-logged-in") === "true") {
    showApp();
  }
});

// === Button Listeners ===
addButton.addEventListener("click", () => updateBalance(+1));
subtractButton.addEventListener("click", () => updateBalance(-1));
