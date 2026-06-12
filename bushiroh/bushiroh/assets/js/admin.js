import { properties, initThemeToggle, storageKeys, readList, writeList, formatMoney, escapeHtml, starText } from "./data.js";

initThemeToggle();

const DEMO_EMAIL = "oyetayo@gmail.com";
const DEMO_PASSWORD = "ABDULLAHI";
const ADMIN_SESSION_KEY = "tourHomesAdminSession";

const loginSection = document.getElementById("adminLoginSection");
const dashboard = document.getElementById("adminDashboard");
const loginForm = document.getElementById("adminLoginForm");
const loginMessage = document.getElementById("adminLoginMessage");
const loginButton = document.getElementById("adminLoginButton");
const adminLogout = document.getElementById("adminLogout");
const statsGrid = document.getElementById("statsGrid");
const bookingsTable = document.getElementById("bookingsTable");
const reviewsTable = document.getElementById("reviewsTable");
const contactsTable = document.getElementById("contactsTable");
const clearBookings = document.getElementById("clearBookings");
const clearReviews = document.getElementById("clearReviews");
const clearContacts = document.getElementById("clearContacts");

function isAdminLoggedIn() {
  try {
    const session = JSON.parse(localStorage.getItem(ADMIN_SESSION_KEY) || "null");
    return Boolean(session && session.email === DEMO_EMAIL && session.loggedIn === true);
  } catch (error) {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    return false;
  }
}

function setAdminView(isLoggedIn) {
  loginSection.hidden = isLoggedIn;
  dashboard.hidden = !isLoggedIn;
  if (isLoggedIn) {
    render();
  }
}

function propertyName(id) {
  const property = properties.find((item) => item.id === Number(id));
  return property ? property.title : `Property ${id}`;
}

function render() {
  const bookings = readList(storageKeys.bookings);
  const reviews = readList(storageKeys.reviews);
  const contacts = readList(storageKeys.contacts);
  const revenue = bookings.reduce((sum, booking) => sum + (Number(booking.total) || 0), 0);

  statsGrid.innerHTML = `
    <div class="stat-card"><strong>${bookings.length}</strong><span>local bookings</span></div>
    <div class="stat-card"><strong>${reviews.length}</strong><span>property reviews</span></div>
    <div class="stat-card"><strong>${formatMoney(revenue)}</strong><span>simulated booking value</span></div>`;

  bookingsTable.innerHTML = bookings.length ? `
    <table>
      <thead><tr><th>Property</th><th>Dates</th><th>Guests</th><th>Nights</th><th>Total</th><th>Saved</th></tr></thead>
      <tbody>${bookings.map((booking) => `<tr>
        <td><strong>${escapeHtml(booking.propertyTitle || propertyName(booking.propertyId))}</strong><br><span class="small-muted">${escapeHtml(booking.location || "Location recorded")}</span></td>
        <td>${escapeHtml(booking.checkIn)} to ${escapeHtml(booking.checkOut)}</td>
        <td>${Number(booking.guests) || 0}</td>
        <td>${Number(booking.nights) || 0}</td>
        <td>${formatMoney(booking.total)}</td>
        <td>${new Date(booking.createdAt).toLocaleString()}</td>
      </tr>`).join("")}</tbody>
    </table>` : `<div class="empty-state">No bookings have been saved yet. Confirm a stay from the booking page to populate this dashboard.</div>`;

  reviewsTable.innerHTML = reviews.length ? `
    <table>
      <thead><tr><th>Property</th><th>Rating</th><th>Comment</th><th>Saved</th></tr></thead>
      <tbody>${reviews.map((review) => `<tr>
        <td>${escapeHtml(propertyName(review.propertyId))}</td>
        <td><span class="stars">${starText(review.rating)}</span></td>
        <td>${escapeHtml(review.comment)}</td>
        <td>${new Date(review.createdAt).toLocaleString()}</td>
      </tr>`).join("")}</tbody>
    </table>` : `<div class="empty-state">No reviews have been submitted yet. Open a property detail page to add guest feedback.</div>`;

  contactsTable.innerHTML = contacts.length ? `
    <table>
      <thead><tr><th>Name</th><th>Email</th><th>Interest</th><th>Message</th><th>Saved</th></tr></thead>
      <tbody>${contacts.map((contact) => `<tr>
        <td>${escapeHtml(contact.fullName)}</td>
        <td>${escapeHtml(contact.email)}</td>
        <td>${escapeHtml(contact.interest)}</td>
        <td>${escapeHtml(contact.message)}</td>
        <td>${new Date(contact.createdAt).toLocaleString()}</td>
      </tr>`).join("")}</tbody>
    </table>` : `<div class="empty-state">No contact inquiries have been saved yet.</div>`;
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const email = String(formData.get("adminEmail") || "").trim().toLowerCase();
  const password = String(formData.get("adminPassword") || "");

  loginButton.disabled = true;
  loginMessage.textContent = "Checking demo credentials...";
  loginMessage.classList.remove("success");

  if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    loginMessage.textContent = "Incorrect login. Use oyetayo@gmail.com and password ABDULLAHI.";
    loginButton.disabled = false;
    return;
  }

  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ email: DEMO_EMAIL, loggedIn: true, loggedInAt: new Date().toISOString() }));
  loginForm.reset();
  loginMessage.textContent = "";
  loginButton.disabled = false;
  setAdminView(true);
});

adminLogout.addEventListener("click", () => {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  loginMessage.textContent = "You have logged out of the local admin dashboard.";
  loginMessage.classList.add("success");
  setAdminView(false);
});

clearBookings.addEventListener("click", () => {
  if (confirm("Clear all locally stored TOUR-HOMES bookings?")) {
    writeList(storageKeys.bookings, []);
    render();
  }
});

clearReviews.addEventListener("click", () => {
  if (confirm("Clear all locally stored TOUR-HOMES reviews?")) {
    writeList(storageKeys.reviews, []);
    render();
  }
});

clearContacts.addEventListener("click", () => {
  if (confirm("Clear all locally stored TOUR-HOMES contact inquiries?")) {
    writeList(storageKeys.contacts, []);
    render();
  }
});

setAdminView(isAdminLoggedIn());