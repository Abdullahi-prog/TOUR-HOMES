export function initNavMenu() {
  const toggle = document.getElementById("navMenuToggle");
  const menu = document.getElementById("primaryNav");
  const nav = toggle ? toggle.closest(".nav") : null;

  if (!toggle || !menu || !nav) return;

  function setOpen(open) {
    menu.classList.toggle("is-open", open);
    toggle.classList.toggle("is-active", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  }

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    setOpen(!menu.classList.contains("is-open"));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("click", (event) => {
    if (menu.classList.contains("is-open") && !nav.contains(event.target)) {
      setOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setOpen(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 640px)").matches) {
      setOpen(false);
    }
  });
}

initNavMenu();