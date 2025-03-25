// Remove version based on UTM
// (function (isV2) {
//   if (isV2) return document.getElementById("version-1").remove();
//   return document.getElementById("version-2").remove();
// })(window.is_v2);

// Opens up modal on hash
if (window.location.hash) {
  var modalId = window.location.hash.substring(1);
  var modalElement = document.getElementById(modalId);
  if (modalElement && modalElement.classList.contains("modal")) {
      var modal = new bootstrap.Modal(modalElement);
      modal.show();
  }
}

/** All Element Functions */

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

  $(".advisory-board").owlCarousel({
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

  $(".rem-percentage").owlCarousel({
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

  $("#version-1 .wear-tech").owlCarousel({
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

  // sleep deeply video
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

  // jay glazer video
  document
      .getElementById("jayGlazerVideo")
      .addEventListener("click", function () {
          var container = document.querySelector(".jay-glazer-video");

          var videoHtml = `
    <div class="video-container">
      <iframe src="https://www.youtube.com/embed/3BucBrM8xRM?autoplay=1&rel=0" title="The REM Super Patch - One Man's Journey" allow="autoplay; encrypted-media" allowfullscreen></iframe>
    </div>
  `;

          container.innerHTML = videoHtml;

          var videoContainer = document.querySelector(".jay-glazer-video");
          videoContainer.style.setProperty("bottom", "0", "important");
      });
})(jQuery);

/** All Cart Functions */

(async () => {
  // -----------------------------------------
  // CONSTANTS
  // -----------------------------------------
  const SHOP_DOMAIN = "store.superpatch.com";
  const STOREFRONT_TOKEN = "446d09be3c60038e8da0f4a0970afb1e";
  const MAX_CART_QUANTITY = document.body.dataset.maxQuantity || 10;
  const VARIANT_ID = document.body.dataset.variant;
  const CART_STORAGE_KEY = "cartId";
  const CART_MODAL = document.getElementById("cartModalOverlay");
  const QUANTITY_SELECT = CART_MODAL.querySelector(".quantity-select");
  const UTM_PARAMETERS = [
      "Campaign",
      "Source",
      "Medium",
      "Content",
      "Term",
      "Version",
  ];
  const CART_QUERY = `{
      id
      lines(first: 100) {
          edges {
              node {
                  id
                  quantity
                  merchandise { ... on ProductVariant { id, title } }
              }
          }
      }
      checkoutUrl
  }`;

  // -----------------------------------------
  // UTM HANDLING
  // -----------------------------------------
  function storeUTMParams() {
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.forEach((value, key) => {
          if (key.startsWith("utm_")) {
              const cleanKey = key.replace("utm_", "").toLowerCase();
              sessionStorage.setItem(cleanKey, value);
              localStorage.setItem(cleanKey, value);
          }
      });
  }

  function getUTMAttributes() {
      return UTM_PARAMETERS.map((param) => {
          const key = param.toLowerCase();
          const value =
              sessionStorage.getItem(key) || localStorage.getItem(key);
          return value ? { key, value } : null;
      }).filter(Boolean);
  }

  function clearUTMParams() {
      UTM_PARAMETERS.forEach((param) => {
          const key = param.toLowerCase();
          sessionStorage.removeItem(key);
          localStorage.removeItem(key);
      });
  }

  // -----------------------------------------
  // SHOPIFY API HANDLING
  // -----------------------------------------
  async function shopifyGraphQL(query, variables) {
      try {
          const response = await fetch(
              `https://${SHOP_DOMAIN}/api/2025-01/graphql.json`,
              {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json",
                      "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
                  },
                  body: JSON.stringify({ query, variables }),
              }
          );
          if (!response.ok) {
              throw new Error(
                  `HTTP Error: ${response.status} ${response.statusText}`
              );
          }
          const result = await response.json();
          if (result.errors) {
              throw new Error(
                  result.errors.map((err) => err.message).join(", ")
              );
          }
          return result.data;
      } catch (error) {
          console.error("Shopify API Error:", error.message);
          return null; // Return null instead of breaking execution
      }
  }

  async function getCart(cartId) {
      if (!cartId) return await createCart(getUTMAttributes());
      const query = `query getCart($cartId: ID!) { cart(id: $cartId) ${CART_QUERY} }`;
      const data = await shopifyGraphQL(query, { cartId });
      return data?.cart || (await createCart(getUTMAttributes()));
  }

  async function createCart(utmAttributes) {
      const query = `mutation cartCreate($input: CartInput!) { cartCreate(input: $input) { cart ${CART_QUERY} } }`;
      const { cartCreate } = await shopifyGraphQL(query, {
          input: { attributes: utmAttributes },
      });
      const cart = cartCreate.cart;
      localStorage.setItem(CART_STORAGE_KEY, cart.id);
      return cart;
  }

  async function updateCart(cartId, variantId, quantity) {
      const existingLine = globalCart.lines.edges.find(
          (edge) =>
              edge.node.merchandise.id ===
              `gid://shopify/ProductVariant/${variantId}`
      );

      const query = existingLine
          ? `mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
              cartLinesUpdate(cartId: $cartId, lines: $lines) { cart ${CART_QUERY} }
          }`
          : `mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
              cartLinesAdd(cartId: $cartId, lines: $lines) { cart ${CART_QUERY} }
          }`;

      const variables = {
          cartId,
          lines: existingLine
              ? [{ id: existingLine.node.id, quantity }]
              : [
                    {
                        quantity,
                        merchandiseId: `gid://shopify/ProductVariant/${variantId}`,
                    },
                ],
      };

      const response = await shopifyGraphQL(query, variables);
      clearUTMParams();
      return existingLine
          ? response.cartLinesUpdate.cart
          : response.cartLinesAdd.cart;
  }

  function loadInputs(globalCart, firstLoad = false) {
      if (!CART_MODAL) return;

      const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
      const checkoutButtons = document.querySelectorAll(
          '[data-action="checkout"]'
      );
      const plusButtons = document.querySelectorAll(".plus-btn");
      const minusButtons = document.querySelectorAll(".minus-btn");
      const inputFields = document.querySelectorAll(".quantity");
      const totalPriceElement = document.getElementById("totalPrice");
      const pricePerItem = 60.0;

      const itemInCart = globalCart.lines.edges.find(
          (edge) =>
              edge.node.merchandise.id ===
              `gid://shopify/ProductVariant/${VARIANT_ID}`
      );

      QUANTITY_SELECT.value = itemInCart?.node?.quantity || 0;
      CART_MODAL.style.display = QUANTITY_SELECT.value != 0 ? "block" : "none";

      inputFields.forEach((inputField) => {
          inputField.value = 1;
          inputField.max = MAX_CART_QUANTITY - QUANTITY_SELECT.value;
      });

      totalPriceElement.textContent = `$${(
          QUANTITY_SELECT.value * pricePerItem
      ).toFixed(2)}`;

      if (firstLoad) {
          QUANTITY_SELECT.addEventListener("change", handleQuantityChange);
          addToCartButtons.forEach((addToCartButton) =>
              addToCartButton.addEventListener("click", handleAddToCart)
          );
          plusButtons.forEach((plusButton) =>
              plusButton.addEventListener("click", increaseQuantityValue)
          );
          minusButtons.forEach((minusButton) =>
              minusButton.addEventListener("click", decreaseQuantityValue)
          );
          inputFields.forEach((inputField) =>
              inputField.addEventListener("chanege", changeQuantityValue)
          );
          checkoutButtons.forEach((checkoutButton) =>
              checkoutButton.addEventListener("click", handleCheckout)
          );
      }
  }

  function increaseQuantityValue() {
      let newValue = parseInt(document.querySelector(".quantity").value) + 1;
      updateInputQuantities(
          Math.min(newValue, document.querySelector(".quantity").max)
      );
  }
  function decreaseQuantityValue() {
      let currentValue = parseInt(document.querySelector(".quantity").value);
      if (currentValue > 1) {
          let newValue = currentValue - 1;
          updateInputQuantities(
              Math.min(newValue, document.querySelector(".quantity").max)
          );
      }
  }
  function changeQuantityValue(event) {
      updateInputQuantities(Math.min(event.target.max, event.target.value));
  }
  function updateInputQuantities(value) {
      document.querySelectorAll(".quantity").forEach((input) => {
          input.value = value;
      });
  }

  function handleAddToCart(event) {
      let quantity = parseInt(
              event.target.closest(".row").querySelector("input").value
          )
      if (!quantity) return null;
      QUANTITY_SELECT.value = parseInt(QUANTITY_SELECT.value) + quantity;
      QUANTITY_SELECT.dispatchEvent(new Event("change"));
  }

  async function handleQuantityChange(event) {
      const newQuantity = parseInt(event.target.value) || 0;
      const cartId = localStorage.getItem(CART_STORAGE_KEY);

      globalCart = await updateCart(cartId, VARIANT_ID, newQuantity);
      loadInputs(globalCart, false);
  }
  async function handleCheckout() {
      window.location.href = globalCart.checkoutUrl;
  }
  
  // Initialize
  storeUTMParams();
  let globalCart = await getCart(localStorage.getItem(CART_STORAGE_KEY));
  loadInputs(globalCart, true);
})();
