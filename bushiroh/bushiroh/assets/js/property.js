import { properties, getPropertyById, initThemeToggle, propertyCard, formatMoney, storageKeys, readList, addToList, makeId, escapeHtml, starText } from "./data.js";

initThemeToggle();

const app = document.getElementById("propertyApp");
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (id) {
  renderSingleProperty(id);
} else {
  renderListings();
}

function renderListings() {
  const initialSearch = params.get("search") || "";
  app.innerHTML = `
    <section class="container listing-hero">
      <div>
        <p class="eyebrow">Property portfolio</p>
        <h1>Browse luxury apartments and houses</h1>
        <p class="hero-lead">Search by property name or destination, then refine by nightly rate, property type, and guest capacity.</p>
      </div>
      <form class="filters" id="filtersForm">
        <div class="filter-grid">
          <div class="field-group">
            <label for="search">Search</label>
            <input id="search" type="search" inputmode="search" autocomplete="off" enterkeyhint="search" value="${escapeHtml(initialSearch)}" placeholder="City, district, or property name">
          </div>
          <div class="field-group">
            <label for="maxPrice">Max price</label>
            <input id="maxPrice" type="number" min="0" inputmode="numeric" enterkeyhint="done" placeholder="600">
          </div>
          <div class="field-group">
            <label for="type">Type</label>
            <select id="type">
              <option value="all">All types</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
            </select>
          </div>
          <div class="field-group">
            <label for="guests">Guests</label>
            <input id="guests" type="number" min="1" inputmode="numeric" enterkeyhint="done" placeholder="4">
          </div>
        </div>
        <div class="filter-actions">
          <button class="btn btn-primary" type="submit">Apply filters</button>
          <button class="btn btn-secondary" id="clearFilters" type="button">Clear filters</button>
          <span class="result-count" id="resultCount"></span>
        </div>
      </form>
    </section>
    <section class="container property-grid" id="propertiesGrid" aria-live="polite"></section>`;

  const form = document.getElementById("filtersForm");
  const search = document.getElementById("search");
  const maxPrice = document.getElementById("maxPrice");
  const type = document.getElementById("type");
  const guests = document.getElementById("guests");
  const grid = document.getElementById("propertiesGrid");
  const count = document.getElementById("resultCount");
  const clear = document.getElementById("clearFilters");

  function applyFilters() {
    const query = search.value.trim().toLowerCase();
    const priceLimit = Number(maxPrice.value) || Infinity;
    const guestLimit = Number(guests.value) || 0;
    const selectedType = type.value;

    const filtered = properties.filter((property) => {
      const matchesQuery = !query || property.title.toLowerCase().includes(query) || property.location.toLowerCase().includes(query);
      const matchesPrice = property.pricePerNight <= priceLimit;
      const matchesType = selectedType === "all" || property.type === selectedType;
      const matchesGuests = guestLimit === 0 || property.guests >= guestLimit;
      return matchesQuery && matchesPrice && matchesType && matchesGuests;
    });

    count.textContent = `${filtered.length} ${filtered.length === 1 ? "property" : "properties"} found`;
    grid.innerHTML = filtered.length ? filtered.map(propertyCard).join("") : `<div class="empty-state">No homes match those filters. Try a broader destination, a higher price range, or fewer guests.</div>`;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    applyFilters();
  });
  [search, maxPrice, type, guests].forEach((input) => input.addEventListener("input", applyFilters));
  clear.addEventListener("click", () => {
    search.value = "";
    maxPrice.value = "";
    type.value = "all";
    guests.value = "";
    applyFilters();
  });

  applyFilters();
}

function renderSingleProperty(propertyId) {
  const property = getPropertyById(propertyId);
  if (!property) {
    app.innerHTML = `<section class="container"><a class="back-link" href="property.html">← Back to listings</a><div class="empty-state">This property is no longer available in the TOUR-HOMES portfolio.</div></section>`;
    return;
  }

  const reviews = readList(storageKeys.reviews).filter((review) => Number(review.propertyId) === property.id);
  app.innerHTML = `
    <section class="container">
      <a class="back-link" href="property.html">← Back to all properties</a>
      <div class="detail-layout">
        <div class="gallery">
          <div class="gallery-main"><img src="${property.images[0]}" width="1200" height="825" alt="Main view of ${escapeHtml(property.title)}"></div>
          <div class="gallery-thumbs">
            ${property.images.map((image, index) => `<img src="${image}" width="500" height="375" loading="lazy" alt="${escapeHtml(property.title)} gallery image ${index + 1}">`).join("")}
          </div>
        </div>
        <aside class="detail-card">
          <span class="badge">${escapeHtml(property.type)}</span>
          <h1>${escapeHtml(property.title)}</h1>
          <p class="card-location">${escapeHtml(property.location)}</p>
          <div class="detail-meta">
            <span>${property.bedrooms} bedrooms</span>
            <span>${property.bathrooms} bathrooms</span>
            <span>Up to ${property.guests} guests</span>
          </div>
          <div class="price"><strong>${formatMoney(property.pricePerNight)}</strong> / night</div>
          <a class="btn btn-primary" href="booking.html?id=${property.id}">Book Now</a>
        </aside>
      </div>
    </section>
    <section class="container section">
      <div class="section-heading">
        <p class="eyebrow">Amenities</p>
        <h2>Designed for comfortable stays</h2>
      </div>
      <div class="amenity-grid">
        ${property.amenities.map((amenity) => `<div class="amenity">${escapeHtml(amenity)}</div>`).join("")}
      </div>
    </section>
    <section class="container reviews-section">
      <div class="section-heading">
        <p class="eyebrow">Guest feedback</p>
        <h2>Reviews for ${escapeHtml(property.title)}</h2>
      </div>
      <div id="reviewsList">${reviewsMarkup(reviews)}</div>
      <form class="review-form" id="reviewForm">
        <div class="field-group">
          <label for="rating">Star rating</label>
          <select id="rating" required>
            <option value="5">5 stars — exceptional</option>
            <option value="4">4 stars — very good</option>
            <option value="3">3 stars — comfortable</option>
            <option value="2">2 stars — needs improvement</option>
            <option value="1">1 star — poor</option>
          </select>
        </div>
        <div class="field-group">
          <label for="comment">Comment</label>
          <textarea id="comment" rows="4" required placeholder="Share what stood out about the stay"></textarea>
        </div>
        <p class="form-message" id="reviewMessage" role="alert"></p>
        <button class="btn btn-primary" type="submit">Submit review</button>
      </form>
    </section>`;

  const form = document.getElementById("reviewForm");
  const message = document.getElementById("reviewMessage");
  const list = document.getElementById("reviewsList");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const rating = Number(document.getElementById("rating").value);
    const comment = document.getElementById("comment").value.trim();
    if (!comment) {
      message.textContent = "Please add a review comment before submitting.";
      message.classList.remove("success");
      return;
    }
    const review = { id: makeId("review"), propertyId: property.id, rating, comment, createdAt: new Date().toISOString() };
    addToList(storageKeys.reviews, review);
    const freshReviews = readList(storageKeys.reviews).filter((item) => Number(item.propertyId) === property.id);
    list.innerHTML = reviewsMarkup(freshReviews);
    form.reset();
    message.textContent = "Review saved locally for this property.";
    message.classList.add("success");
  });
}

function reviewsMarkup(reviews) {
  if (!reviews.length) {
    return `<div class="empty-state">No reviews yet. Be the first to rate this TOUR-HOMES property.</div>`;
  }
  return reviews.map((review) => {
    const date = new Date(review.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    return `<article class="review-card">
      <div class="stars" aria-label="${review.rating} out of 5 stars">${starText(review.rating)}</div>
      <p>${escapeHtml(review.comment)}</p>
      <span class="review-date">Submitted ${date}</span>
    </article>`;
  }).join("");
}