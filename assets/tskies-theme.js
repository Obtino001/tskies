/**
 * T.Skies Storefront Interactions
 * Handles quick add to cart, loading spinners, and cart drawer opening
 */
(function () {
  function initTskiesAddToCart() {
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('.tskies-add-to-cart-btn');
      if (!btn) return;

      e.preventDefault();
      e.stopPropagation();

      if (btn.classList.contains('loading') || btn.classList.contains('success')) {
        return;
      }

      const textEl = btn.querySelector('.tskies-btn__text');
      const spinnerEl = btn.querySelector('.tskies-btn__spinner');
      const checkEl = btn.querySelector('.tskies-btn__check');

      // Start loading animation
      btn.classList.add('loading');
      if (textEl) textEl.classList.add('hidden');
      if (checkEl) checkEl.classList.add('hidden');
      if (spinnerEl) spinnerEl.classList.remove('hidden');

      // Simulate network add to cart / drawer trigger
      setTimeout(function () {
        // Switch to success checkmark
        if (spinnerEl) spinnerEl.classList.add('hidden');
        if (checkEl) checkEl.classList.remove('hidden');
        btn.classList.remove('loading');
        btn.classList.add('success');

        // Increment cart count bubble in header
        updateHeaderCartCount();

        // Open cart drawer
        const cartDrawer = document.querySelector('cart-drawer');
        if (cartDrawer && typeof cartDrawer.open === 'function') {
          cartDrawer.open(btn);
        }

        // Reset button after 2.2s
        setTimeout(function () {
          btn.classList.remove('success');
          if (checkEl) checkEl.classList.add('hidden');
          if (textEl) textEl.classList.remove('hidden');
        }, 2200);
      }, 500);
    }, true);
  }

  function updateHeaderCartCount() {
    const bubbleWrapper = document.getElementById('cart-icon-bubble');
    if (!bubbleWrapper) return;

    let countBubble = bubbleWrapper.querySelector('.cart-count-bubble');
    if (!countBubble) {
      countBubble = document.createElement('div');
      countBubble.className = 'cart-count-bubble';
      countBubble.innerHTML = '<span aria-hidden="true">1</span><span class="visually-hidden">1 vare</span>';
      bubbleWrapper.appendChild(countBubble);
    } else {
      const numberSpan = countBubble.querySelector('span[aria-hidden="true"]');
      if (numberSpan) {
        const current = parseInt(numberSpan.textContent.trim(), 10) || 0;
        const next = current + 1;
        numberSpan.textContent = next;
        const visuallyHidden = countBubble.querySelector('.visually-hidden');
        if (visuallyHidden) {
          visuallyHidden.textContent = next + (next === 1 ? ' vare' : ' varer');
        }
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTskiesAddToCart);
  } else {
    initTskiesAddToCart();
  }
})();
