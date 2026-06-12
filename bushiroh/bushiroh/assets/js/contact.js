import { initThemeToggle, storageKeys, addToList, makeId } from "./data.js";

initThemeToggle();

const form = document.getElementById("contactForm");
const message = document.getElementById("contactMessage");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const interest = String(formData.get("interest") || "").trim();
  const body = String(formData.get("message") || "").trim();

  if (!fullName || !email || !interest || !body) {
    message.textContent = "Please complete every field before saving your inquiry.";
    message.classList.remove("success");
    return;
  }

  addToList(storageKeys.contacts, {
    id: makeId("contact"),
    fullName,
    email,
    interest,
    message: body,
    createdAt: new Date().toISOString()
  });

  form.reset();
  message.textContent = "Inquiry saved locally for the TOUR-HOMES concierge dashboard.";
  message.classList.add("success");
});