 import { properties, initThemeToggle, propertyCard } from "./data.js";

initThemeToggle();

const featuredGrid = document.getElementById("featuredGrid");
const heroSearch = document.getElementById("heroSearch");
const searchInput = document.getElementById("searchInput");

function renderFeatured() {
  const featured = properties.filter((property) => property.featured).slice(0, 8);
  featuredGrid.innerHTML = featured.map(propertyCard).join("");
}

heroSearch.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();
  const target = query ? `property.html?search=${encodeURIComponent(query)}` : "property.html";
  window.location.href = target;
});

renderFeatured();