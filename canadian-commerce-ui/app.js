(function () {
  var tabs = document.querySelectorAll(".view-tab");
  var panels = document.querySelectorAll(".view-panel[data-panel]");

  function showView(name) {
    tabs.forEach(function (tab) {
      var active = tab.dataset.view === name;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });
    panels.forEach(function (panel) {
      var match = panel.dataset.panel === name;
      panel.hidden = !match;
      panel.classList.toggle("is-visible", match);
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var v = tab.dataset.view;
      if (v) showView(v);
    });
  });

  /* Marketplace category filter */
  var CATEGORY_LABELS = {
    all: "All categories",
    "home-living": "Home & living",
    "food-pantry": "Food & pantry",
    apparel: "Apparel",
    electronics: "Electronics",
    "sports-outdoors": "Sports & outdoors",
  };

  var productGrid = document.getElementById("product-grid");
  var productCountEl = document.getElementById("product-count");
  var productCountScopeEl = document.getElementById("product-count-scope");

  function setCategoryFilter(category) {
    if (!productGrid) return;

    var cards = productGrid.querySelectorAll(".product-card");
    var visible = 0;

    cards.forEach(function (card) {
      var cat = card.getAttribute("data-category") || "";
      var show = category === "all" || cat === category;
      card.hidden = !show;
      if (show) visible++;
    });

    if (productCountEl) {
      productCountEl.textContent = String(visible);
    }
    if (productCountScopeEl) {
      if (category === "all") {
        productCountScopeEl.textContent = "";
        productCountScopeEl.hidden = true;
      } else {
        var label = CATEGORY_LABELS[category] || category;
        productCountScopeEl.textContent = " · " + label;
        productCountScopeEl.hidden = false;
      }
    }

    var filterRoot = document.querySelector(".filters .filter-list");
    if (filterRoot) {
      filterRoot.querySelectorAll(".filter-btn").forEach(function (btn) {
        var active = btn.getAttribute("data-category") === category;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }
  }

  function onCategoryClick(ev) {
    var t = ev.target;
    if (!t || !t.getAttribute) return;
    var cat = t.getAttribute("data-category");
    if (!cat) return;
    ev.preventDefault();
    setCategoryFilter(cat);
  }

  function onProductGridClick(ev) {
    var btn = ev.target.closest(".product-cat");
    if (!btn || !productGrid || !productGrid.contains(btn)) return;
    var card = btn.closest(".product-card");
    if (!card) return;
    var cat = card.getAttribute("data-category");
    if (cat) {
      ev.preventDefault();
      setCategoryFilter(cat);
      var toolbar = document.querySelector(".market-toolbar");
      if (toolbar) {
        toolbar.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }

  function initMarketplaceFilter() {
    var filterList = document.querySelector(".filters .filter-list");
    if (filterList) {
      filterList.addEventListener("click", onCategoryClick);
    }
    if (productGrid) {
      productGrid.addEventListener("click", onProductGridClick);
    }
    setCategoryFilter("all");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMarketplaceFilter);
  } else {
    initMarketplaceFilter();
  }
})();

