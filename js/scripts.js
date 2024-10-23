// Opens up modal on hash
if (window.location.hash) {
  var modalId = window.location.hash.substring(1);
  var modalElement = document.getElementById(modalId);
  if (modalElement && modalElement.classList.contains("modal")) {
    var modal = new bootstrap.Modal(modalElement);
    modal.show();
  }
}

// sticky add to cart
document.addEventListener("DOMContentLoaded", () => {
  const stickyNavbar = document.querySelector(".sticky-add-to-cart");
  const addToCartSections = document.querySelectorAll("#addToCart");

  const toggleNavbarVisibility = (isAnyVisible) => {
    if (isAnyVisible) {
      stickyNavbar.classList.add('show');
    } else {
      stickyNavbar.classList.remove('show');
    }
  };

  const checkInitialVisibility = () => {
    if (addToCartSections.length > 0) {
      const addToCartRect = addToCartSections[0].getBoundingClientRect();
      const isVisible = addToCartRect.top < window.innerHeight && addToCartRect.bottom > 0;
      toggleNavbarVisibility(!isVisible); 
    }
  };

  setTimeout(() => {
    checkInitialVisibility();
  }, 100);

  const observerOptions = {
    root: null,
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        toggleNavbarVisibility(false);
      } else {
        toggleNavbarVisibility(true);
      }
    });
  }, observerOptions);

  addToCartSections.forEach((section) => {
    observer.observe(section);
  });
});

// compare section - accordion mobile
document.querySelectorAll(".toggle").forEach((cell) => {
  cell.addEventListener("click", function () {
    const chevron = this.querySelector(".toggle-chevron");
    const benefitTexts =
      this.closest("tr").nextElementSibling.querySelectorAll(".pros-cons");
    const isExpanded = benefitTexts[0].style.display === "inline";

    benefitTexts.forEach((text) => {
      text.style.display = isExpanded ? "none" : "inline";
    });

    chevron.classList.toggle("bi-chevron-down", isExpanded);
    chevron.classList.toggle("bi-chevron-up", !isExpanded);
  });
});

// compare section
document.getElementById("overview-btn").addEventListener("click", function () {
  document.querySelector("table").classList.remove("detailed-active");

  this.classList.add("active");
  document.getElementById("detailed-btn").classList.remove("active");
});

document.getElementById("detailed-btn").addEventListener("click", function () {
  document.querySelector("table").classList.add("detailed-active");

  this.classList.add("active");
  document.getElementById("overview-btn").classList.remove("active");
});

// Show and Hide Button
document.getElementById("show-more-btn").addEventListener("click", function () {
  const secondParagraph = document.querySelector(".second-paragraph");
  const showMoreBtn = document.getElementById("show-more-btn");
  const showLessBtn = document.getElementById("show-less-btn");

  secondParagraph.style.display = "block";
  showMoreBtn.style.display = "none";
  showLessBtn.style.display = "block";
});

document.getElementById("show-less-btn").addEventListener("click", function () {
  const secondParagraph = document.querySelector(".second-paragraph");
  const showMoreBtn = document.getElementById("show-more-btn");
  const showLessBtn = document.getElementById("show-less-btn");

  secondParagraph.style.display = "none";
  showMoreBtn.style.display = "inline";
  showLessBtn.style.display = "none";
});

(async function ($) {
  $(".reviews").owlCarousel({
    loop: true,
    margin: 10,
    nav: false,
    responsive: {
      0: {
        items: 1,
      },
      600: {
        items: 2,
      },
      1000: {
        items: 3,
      },
    },
  });

  // neuromatrix video
  document
    .getElementById("neuromatrixVideo")
    .addEventListener("click", function () {
      var container = document.querySelector(".neuromatrix-video");

      var videoHtml = `
			<div class="video-container">
				<iframe src="https://www.youtube.com/embed/xIauFGK2-NM?autoplay=1&rel=0" title="Freedom Patch - How it Works" allow="autoplay; encrypted-media" allowfullscreen></iframe>
			</div>
		`;

      container.innerHTML = videoHtml;
    });

  // save utm parameters to local storage
  const params = new URLSearchParams(location.search);
  params.forEach((v, k) => sessionStorage.setItem(k, v));

  const customAttributes = [
    "Campaign",
    "Source",
    "Medium",
    "Content",
    "Term",
    "Version",
  ]
    .map((p) => {
      return {
        key: p,
        value: sessionStorage.getItem("utm_" + p.toLowerCase()),
      };
    })
    .filter((p) => p.value);

  var currentQuantity = 0;
  const productId = document.body.dataset.id;
  const productName = document.body.dataset.name;
  const productGID = "gid://shopify/Product/" + document.body.dataset.product;
  const variantId =
    "gid://shopify/ProductVariant/" + document.body.dataset.variant;
  const max_qty_available = parseInt(document.body.dataset.maxQuantity);

  const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
  const addToCartMbl = document.querySelector(".add-to-cart-mbl");
  const checkoutButtons = document.querySelectorAll('[data-action="checkout"]');
  const plusButtons = document.querySelectorAll(".plus-btn");
  const minusButtons = document.querySelectorAll(".minus-btn");
  const inputFields = document.querySelectorAll(".quantity");
  const quantitySelect = document.querySelector(".quantity-select");
  const totalPriceElement = document.getElementById("totalPrice");
  const pricePerItem = 60.0;

  // add to cart and cart modal
  inputFields.forEach((inp) => (inp.max = max_qty_available));

  addToCartMbl.addEventListener("click", async function () {
    const quantityInputMbl = document.querySelector(".quantity-input input[type='number']");
    let quantity = parseInt(quantityInputMbl.value);
    
    if (quantity === 0) return;
  
    currentQuantity += quantity;
  
    let new_qty_available = max_qty_available - currentQuantity;
  
    inputFields.forEach((inp) => {
      inp.max = new_qty_available;
      inp.value = Math.min(1, new_qty_available);
    });
    
    quantitySelect.value = currentQuantity;
    updateTotalPrice(max_qty_available - new_qty_available);
    
    document.getElementById("cartModalOverlay").style.display =
      max_qty_available - new_qty_available === 0 ? "" : "block";
    quantitySelect.closest(".row").querySelector("button").dataset.quantity =
      max_qty_available - new_qty_available;
  
    let event = new CustomEvent("add_to_cart", {
      detail: {
        item_id: productId,
        item_sku: productId.slice(0, -2),
        item_name: productName,
        item_price: pricePerItem,
        quantity: quantity,
      },
    });
    document.dispatchEvent(event);
  });

  addToCartButtons.forEach((button) => {
    button.addEventListener("click", async function () {
      let quantity = parseInt(
        button.closest(".row").querySelector("input").value
      );
      currentQuantity = currentQuantity + quantity;

      if (quantity == 0) return;

      let new_qty_available = max_qty_available - currentQuantity;
      inputFields.forEach((inp) => {
        inp.max = new_qty_available;
        inp.value = Math.min(1, new_qty_available);
      });
      quantitySelect.value = currentQuantity;
      updateTotalPrice(max_qty_available - new_qty_available);
      document.getElementById("cartModalOverlay").style.display =
        max_qty_available - new_qty_available == 0 ? "" : "block";
      quantitySelect.closest(".row").querySelector("button").dataset.quantity =
        max_qty_available - new_qty_available;

      let event = new CustomEvent("add_to_cart", {
        detail: {
          item_id: productId,
          item_sku: productId.slice(0, -2),
          item_name: productName,
          item_price: pricePerItem,
          quantity: quantity,
        },
      });
      document.dispatchEvent(event);
    });
  });

  quantitySelect.addEventListener("change", async function () {
    let quantity = parseInt(this.value);

    currentQuantity = quantity;

    let new_qty_available =
      max_qty_available - (currentQuantity ? currentQuantity : 0);

    inputFields.forEach((inp) => {
      inp.max = new_qty_available;
      inp.value = Math.min(1, new_qty_available);
    });
    updateTotalPrice(max_qty_available - new_qty_available);
    document.getElementById("cartModalOverlay").style.display =
      max_qty_available - new_qty_available == 0 ? "" : "block";
    this.closest(".row").querySelector("button").dataset.quantity =
      max_qty_available - new_qty_available;

    let event = new CustomEvent("add_to_cart", {
      detail: {
        item_id: productId,
        item_sku: productId.slice(0, -2),
        item_name: productName,
        item_price: pricePerItem,
        quantity: quantity,
      },
    });
    document.dispatchEvent(event);
  });

  checkoutButtons.forEach((ckbt) => {
    ckbt.addEventListener("click", async function (e) {
      e.preventDefault();

      let quantityCount = Math.max(1, currentQuantity);
      let totalValue = quantityCount * pricePerItem;

      let items = [
        {
          item_id: productId,
          item_sku: productId.slice(0, -2),
          item_name: productName,
          item_price: pricePerItem,
          quantity: quantityCount,
        },
      ];

      let event = new CustomEvent("init_checkout", {
        detail: {
          quantity: quantityCount,
          value: totalValue,
          items: items,
        },
      });
      document.dispatchEvent(event);

      const utmParams = ["utm_campaign", "utm_source", "utm_medium"];
      let utmString = utmParams.reduce((acc, param) => {
        const value = params.get(param);
        if (value) {
          acc += `&${param}=${encodeURIComponent(value)}`;
        }
        return acc;
      }, "");

      let utmContentString = "";
      const utmContent = params.get("utm_content");
      const utmVersion = params.get("utm_version");

      if (utmVersion) {
        if (utmContent) {
          utmContentString = `&utm_content=${encodeURIComponent(`${utmContent},${utmVersion}`)}`;
        } else {
          utmContentString = `&utm_content=${encodeURIComponent(utmVersion)}`;
        }
      } else if (utmContent) {
        utmContentString = `&utm_content=${encodeURIComponent(utmContent)}`;
      }

      const checkoutVariantId = variantId.replace(
        "gid://shopify/ProductVariant/",
        ""
      );
      const checkoutUrl = `https://store.superpatch.com/cart/${checkoutVariantId}:${quantityCount}?access_token=87f20013717bc33265c0ab86ead28dc0${utmString}${utmContentString}`;

      const checkoutLink = document.createElement("a");
      checkoutLink.href = checkoutUrl;
      await new Promise((r) => setTimeout(r, 1000));

      checkoutLink.click();
    });
  });

  function updateQuantities(value) {
    inputFields.forEach((input) => {
      input.value = value;
    });
  }

  function updateTotalPrice(quantity) {
    const totalPrice = pricePerItem * quantity;
    totalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;
  }

  inputFields.forEach((qtyfield) => {
    qtyfield.addEventListener("change", function () {
      updateQuantities(Math.min(qtyfield.max, qtyfield.value));
    });
  });

  plusButtons.forEach((button) => {
    button.addEventListener("click", function () {
      let newValue = parseInt(inputFields[0].value) + 1;
      updateQuantities(Math.min(newValue, inputFields[0].max));
    });
  });

  minusButtons.forEach((button) => {
    button.addEventListener("click", function () {
      let currentValue = parseInt(inputFields[0].value);
      if (currentValue > 1) {
        let newValue = currentValue - 1;
        updateQuantities(Math.min(newValue, inputFields[0].max));
      }
    });
  });
})(jQuery);
