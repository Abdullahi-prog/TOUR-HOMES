import { properties, getPropertyById, initThemeToggle, formatMoney, storageKeys, addToList, makeId, nightsBetween, escapeHtml, todayIso } from "./data.js";

initThemeToggle();

const params = new URLSearchParams(window.location.search);
const selectedId = Number(params.get("id")) || properties[0].id;
const propertySelect = document.getElementById("propertySelect");
const preview = document.getElementById("bookingPropertyPreview");
const form = document.getElementById("bookingForm");
const checkIn = document.getElementById("checkIn");
const checkOut = document.getElementById("checkOut");
const guests = document.getElementById("guests");
const pricePanel = document.getElementById("pricePanel");
const message = document.getElementById("bookingMessage");
const modal = document.getElementById("successModal");
const modalText = document.getElementById("modalText");
const closeModal = document.getElementById("closeModal");

propertySelect.innerHTML = properties.map((property) => `<option value="${property.id}">${escapeHtml(property.title)} — ${escapeHtml(property.location)}</option>`).join("");
propertySelect.value = getPropertyById(selectedId) ? String(selectedId) : String(properties[0].id);
checkIn.min = todayIso();
checkOut.min = todayIso();
guests.value = "2";

function activeProperty() {
  return getPropertyById(propertySelect.value) || properties[0];
}

function renderPreview() {
  const property = activeProperty();
  guests.max = String(property.guests);
  preview.innerHTML = `
    <img src="${property.images[0]}" width="800" height="500" alt="${escapeHtml(property.title)} booking preview">
    <div>
      <h3>${escapeHtml(property.title)}</h3>
      <p class="card-location">${escapeHtml(property.location)}</p>
      <p>${property.bedrooms} bedrooms · ${property.bathrooms} bathrooms · up to ${property.guests} guests</p>
      <p class="price">${formatMoney(property.pricePerNight)} / night</p>
    </div>`;
  if (Number(guests.value) > property.guests) {
    guests.value = String(property.guests);
  }
  calculate();
}

function calculate() {
  const property = activeProperty();
  checkOut.min = checkIn.value || todayIso();
  const nights = checkIn.value && checkOut.value ? nightsBetween(checkIn.value, checkOut.value) : 0;
  const guestCount = Number(guests.value) || 0;
  if (!checkIn.value || !checkOut.value) {
    pricePanel.textContent = "Select dates to calculate your stay.";
    return { ok: false, nights: 0, total: 0 };
  }
  if (nights <= 0) {
    pricePanel.textContent = "Check-out must be after check-in.";
    return { ok: false, nights: 0, total: 0 };
  }
  if (guestCount < 1 || guestCount > property.guests) {
    pricePanel.textContent = `Guest count must be between 1 and ${property.guests}.`;
    return { ok: false, nights: 0, total: 0 };
  }
  const total = nights * property.pricePerNight;
  pricePanel.innerHTML = `<strong>${formatMoney(total)}</strong><br>${nights} ${nights === 1 ? "night" : "nights"} × ${formatMoney(property.pricePerNight)} for ${guestCount} ${guestCount === 1 ? "guest" : "guests"}`;
  return { ok: true, nights, total };
}

[propertySelect, checkIn, checkOut, guests].forEach((input) => {
  input.addEventListener("input", () => {
    message.textContent = "";
    message.classList.remove("success");
    if (input === propertySelect) renderPreview();
    else calculate();
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const property = activeProperty();
  const result = calculate();
  if (!result.ok) {
    message.textContent = "Please choose valid dates and guest count before confirming.";
    message.classList.remove("success");
    return;
  }
  const booking = {
    id: makeId("booking"),
    propertyId: property.id,
    propertyTitle: property.title,
    location: property.location,
    checkIn: checkIn.value,
    checkOut: checkOut.value,
    guests: Number(guests.value),
    nights: result.nights,
    total: result.total,
    createdAt: new Date().toISOString()
  };
  addToList(storageKeys.bookings, booking);
  message.textContent = "Booking saved locally.";
  message.classList.add("success");
  modalText.textContent = `${property.title} is reserved in this browser for ${result.nights} ${result.nights === 1 ? "night" : "nights"}. Total: ${formatMoney(result.total)}.`;
  modal.hidden = false;
});

closeModal.addEventListener("click", () => {
  modal.hidden = true;
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.hidden = true;
  }
});

renderPreview();
calculate();