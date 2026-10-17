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

  function initSizeChartModal() {
    document.addEventListener('click', function (e) {
      const openBtn = e.target.closest('[data-modal-open]');
      if (openBtn) {
        e.preventDefault();
        const targetId = openBtn.getAttribute('data-modal-open');
        const modal = document.querySelector(targetId);
        if (modal) {
          modal.removeAttribute('hidden');
          document.body.classList.add('overflow-hidden');
        }
        return;
      }

      const closeTrigger = e.target.closest('[data-modal-close]');
      if (closeTrigger) {
        e.preventDefault();
        const modal = closeTrigger.closest('.tskies-modal');
        if (modal) {
          modal.setAttribute('hidden', '');
          document.body.classList.remove('overflow-hidden');
        }
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        const openModal = document.querySelector('.tskies-modal:not([hidden])');
        if (openModal) {
          openModal.setAttribute('hidden', '');
          document.body.classList.remove('overflow-hidden');
        }
      }
    });
  }

  function initBundleSelector() {
    document.addEventListener('click', function (e) {
      // Tier selection
      const tier = e.target.closest('.tskies-bundle__tier');
      if (tier && !e.target.closest('.tskies-bundle__qty-stepper') && !e.target.closest('.tskies-bundle__size-wrap')) {
        const bundle = tier.closest('.tskies-bundle');
        if (!bundle) return;

        bundle.querySelectorAll('.tskies-bundle__tier').forEach(function (t) {
          t.classList.remove('tskies-bundle__tier--active');
        });
        tier.classList.add('tskies-bundle__tier--active');

        const radio = tier.querySelector('.tskies-bundle__radio');
        if (radio) radio.checked = true;

        syncQuantity(bundle, tier);
      }

      // Quantity Stepper Plus
      const plusBtn = e.target.closest('.tskies-bundle__qty-plus');
      if (plusBtn) {
        e.preventDefault();
        const input = plusBtn.parentElement.querySelector('.tskies-bundle__qty-val');
        if (input) {
          let val = parseInt(input.value, 10) || 1;
          if (val < 10) {
            val += 1;
            input.value = val;
            const tier = plusBtn.closest('.tskies-bundle__tier');
            const bundle = plusBtn.closest('.tskies-bundle');
            syncQuantity(bundle, tier);
          }
        }
      }

      // Quantity Stepper Minus
      const minusBtn = e.target.closest('.tskies-bundle__qty-minus');
      if (minusBtn) {
        e.preventDefault();
        const input = minusBtn.parentElement.querySelector('.tskies-bundle__qty-val');
        if (input) {
          let val = parseInt(input.value, 10) || 1;
          if (val > 1) {
            val -= 1;
            input.value = val;
            const tier = minusBtn.closest('.tskies-bundle__tier');
            const bundle = minusBtn.closest('.tskies-bundle');
            syncQuantity(bundle, tier);
          }
        }
      }
    });

    // Sync Bundle Ring Size dropdown with Main Variant Picker
    document.addEventListener('change', function (e) {
      const sizeSelect = e.target.closest('.tskies-bundle__size-select');
      if (sizeSelect) {
        const selectedVal = sizeSelect.value;
        const matchingRadio = document.querySelector('.product-form__input--square-sizes input[value="' + CSS.escape(selectedVal) + '"]');
        if (matchingRadio) {
          matchingRadio.click();
        }
      }

      const variantRadio = e.target.closest('.product-form__input--square-sizes input[type="radio"]');
      if (variantRadio) {
        const selects = document.querySelectorAll('.tskies-bundle__size-select');
        selects.forEach(function (sel) {
          sel.value = variantRadio.value;
        });
      }
    });

    function syncQuantity(bundle, activeTier) {
      if (!bundle || !activeTier) return;
      let qty = 1;
      const tierVal = activeTier.getAttribute('data-tier');
      if (tierVal === '2') {
        qty = 2;
      } else {
        const qtyInput = activeTier.querySelector('.tskies-bundle__qty-val');
        if (qtyInput) qty = parseInt(qtyInput.value, 10) || 1;
      }

      // Update form quantity input if it exists
      const formQty = document.querySelector('form[data-type="add-to-cart-form"] input[name="quantity"]') ||
                      document.querySelector('form[id^="product-form-"] input[name="quantity"]');
      if (formQty) {
        formQty.value = qty;
        formQty.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }

  // Collection "Load more": fetch the next page and append its products in place.
  function initLoadMore() {
    document.addEventListener('click', async (event) => {
      const link = event.target.closest('[data-tskies-load-more]');
      if (!link) return;
      event.preventDefault();
      if (link.dataset.busy === 'true') return;
      link.dataset.busy = 'true';
      link.setAttribute('aria-busy', 'true');
      try {
        const response = await fetch(link.href);
        const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
        const grid = document.getElementById('product-grid');
        const nextGrid = doc.getElementById('product-grid');
        if (!grid || !nextGrid) { window.location.href = link.href; return; }
        nextGrid.querySelectorAll(':scope > li').forEach((item) => grid.appendChild(document.importNode(item, true)));
        const nextLink = doc.querySelector('[data-tskies-load-more]');
        if (nextLink) { link.href = nextLink.href; } else { link.closest('.tskies-load-more')?.remove(); }
        const pagination = document.querySelector('.pagination-wrapper');
        const nextPagination = doc.querySelector('.pagination-wrapper');
        if (pagination && nextPagination) pagination.replaceWith(document.importNode(nextPagination, true));
        window.history.replaceState({}, '', link.href === window.location.href ? window.location.href : window.location.href);
      } catch (error) {
        window.location.href = link.href;
      } finally {
        link.dataset.busy = 'false';
        link.removeAttribute('aria-busy');
      }
    });
  }

  function init() {
    initLoadMore();
    initTskiesAddToCart();
    initSizeChartModal();
    initBundleSelector();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

