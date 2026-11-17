/* Kun Foods theme — interactive components */

const formatMoney = (cents) => {
  const format = (window.theme && window.theme.moneyFormat) || '{{amount}}';
  const value = Number(cents || 0) / 100;
  const group = (n, decimals, thousands, decimal) => {
    const [whole, frac] = n.toFixed(decimals).split('.');
    return whole.replace(/\B(?=(\d{3})+(?!\d))/g, thousands) + (frac ? decimal + frac : '');
  };
  return format.replace(/\{\{\s*(\w+)\s*\}\}/, (_, key) => {
    switch (key) {
      case 'amount_no_decimals': return group(value, 0, ',', '.');
      case 'amount_with_comma_separator': return group(value, 2, '.', ',');
      case 'amount_no_decimals_with_comma_separator': return group(value, 0, '.', ',');
      case 'amount_with_apostrophe_separator': return group(value, 2, "'", '.');
      default: return group(value, 2, ',', '.');
    }
  });
};

/* Keep the mobile drawer below the header */
const setHeaderOffset = () => {
  const header = document.querySelector('.section-header');
  if (!header) return;
  const rect = header.getBoundingClientRect();
  document.documentElement.style.setProperty('--header-bottom', `${Math.max(rect.bottom, 0)}px`);
  document.documentElement.style.setProperty('--header-height', `${rect.height}px`);
};
window.addEventListener('scroll', setHeaderOffset, { passive: true });
window.addEventListener('resize', setHeaderOffset);
document.addEventListener('DOMContentLoaded', setHeaderOffset);

/* Close open dropdowns when clicking elsewhere or pressing Escape */
document.addEventListener('click', (event) => {
  document.querySelectorAll('.nav__dropdown[open]').forEach((d) => {
    if (!d.contains(event.target)) d.removeAttribute('open');
  });
});
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  document.querySelectorAll('.nav__dropdown[open], .drawer[open]').forEach((d) => d.removeAttribute('open'));
});

/* Quantity stepper */
class QuantityInput extends HTMLElement {
  connectedCallback() {
    this.input = this.querySelector('input');
    this.querySelectorAll('[data-step]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const min = Number(this.input.min || 0);
        const next = Math.max(min, Number(this.input.value || 0) + Number(btn.dataset.step));
        this.input.value = next;
        this.input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
  }
}
customElements.define('quantity-input', QuantityInput);

/* Rotating hero taglines */
class RotatingText extends HTMLElement {
  connectedCallback() {
    this.items = [...this.children];
    if (this.items.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.index = 0;
    this.timer = setInterval(() => this.next(), Number(this.dataset.interval) || 3000);
  }
  disconnectedCallback() { clearInterval(this.timer); }
  next() {
    this.items[this.index].classList.remove('is-active');
    this.index = (this.index + 1) % this.items.length;
    this.items[this.index].classList.add('is-active');
  }
}
customElements.define('rotating-text', RotatingText);

/* Tap-to-play review videos */
class VideoPlayer extends HTMLElement {
  connectedCallback() {
    this.video = this.querySelector('video');
    this.button = this.querySelector('button');
    if (!this.video || !this.button) return;
    this.button.addEventListener('click', () => this.toggle());
    this.video.addEventListener('click', () => this.toggle());
  }
  toggle() {
    if (this.video.paused) {
      document.querySelectorAll('video-player.is-playing').forEach((p) => p !== this && p.pause());
      this.video.muted = false;
      this.video.play();
      this.classList.add('is-playing');
    } else {
      this.pause();
    }
  }
  pause() {
    this.video.pause();
    this.classList.remove('is-playing');
  }
}
customElements.define('video-player', VideoPlayer);

/* Product page: gallery, variant picker, bundle tiers, subscriptions */
class ProductForm extends HTMLElement {
  connectedCallback() {
    this.form = this.querySelector('form');
    const variantsEl = this.querySelector('[data-variants]');
    this.variants = variantsEl ? JSON.parse(variantsEl.textContent) : [];
    this.idInput = this.querySelector('[data-variant-id]');
    this.addButton = this.querySelector('[data-add-button]');
    this.currentVariant = this.variants.find((v) => String(v.id) === this.idInput.value) || this.variants[0];

    this.querySelectorAll('[data-thumb]').forEach((thumb) => {
      thumb.addEventListener('click', () => this.showMedia(thumb.dataset.thumb));
    });

    this.querySelectorAll('[data-option-index]').forEach((input) => {
      input.addEventListener('change', () => this.onOptionChange());
    });

    this.tierQty = this.querySelector('[data-tier-quantity]');
    this.querySelectorAll('input[name="tier"]').forEach((input) => {
      input.addEventListener('change', () => { this.tierQty.value = input.value; });
    });

    this.planSelect = this.querySelector('[data-selling-plan]');
    this.querySelectorAll('input[name="purchase_type"]').forEach((input) => {
      input.addEventListener('change', () => {
        if (this.planSelect) this.planSelect.disabled = input.value !== 'subscribe';
      });
    });

    this.updateAvailability();
  }

  showMedia(id) {
    this.querySelectorAll('.gallery__slide').forEach((s) => s.classList.toggle('is-active', s.dataset.mediaId === String(id)));
    this.querySelectorAll('[data-thumb]').forEach((t) => t.classList.toggle('is-active', t.dataset.thumb === String(id)));
  }

  selectedOptions() {
    const options = [];
    this.querySelectorAll('[data-option-index]:checked').forEach((input) => {
      options[Number(input.dataset.optionIndex)] = input.value;
    });
    return options;
  }

  onOptionChange() {
    const options = this.selectedOptions();
    options.forEach((value, i) => {
      const label = this.querySelector(`[data-option-label="${i}"]`);
      if (label) label.textContent = value;
    });
    const variant = this.variants.find((v) => v.options.every((o, i) => o === options[i]));
    this.currentVariant = variant;
    if (!variant) {
      this.setButton(false, window.theme.strings.soldOut);
      return;
    }
    this.idInput.value = variant.id;
    const url = new URL(window.location.href);
    url.searchParams.set('variant', variant.id);
    window.history.replaceState({}, '', url);
    if (variant.featured_media) this.showMedia(variant.featured_media.id);
    this.updatePrices(variant);
    this.updateAvailability();
  }

  updatePrices(variant) {
    const price = this.querySelector('[data-price]');
    if (price) price.textContent = formatMoney(variant.price);
    const compare = this.querySelector('[data-compare]');
    if (compare) {
      compare.hidden = !(variant.compare_at_price > variant.price);
      compare.textContent = formatMoney(variant.compare_at_price || 0);
    }
    this.querySelectorAll('input[name="tier"]').forEach((input) => {
      const label = input.nextElementSibling;
      const qty = Number(input.value);
      const pct = Number(input.dataset.discount || 0);
      const unit = Math.round(variant.price * (100 - pct) / 100);
      const total = label.querySelector('[data-tier-total]');
      const full = label.querySelector('[data-tier-full]');
      const unitEl = label.querySelector('[data-tier-unit]');
      if (total) total.textContent = formatMoney(unit * qty);
      if (full) full.textContent = formatMoney(variant.price * qty);
      if (unitEl) unitEl.textContent = unitEl.dataset.template.replace('__PRICE__', formatMoney(unit));
    });
  }

  updateAvailability() {
    if (!this.currentVariant) return;
    const available = this.currentVariant.available;
    this.setButton(available, available ? window.theme.strings.addToCart : window.theme.strings.soldOut);
  }

  setButton(enabled, text) {
    if (!this.addButton) return;
    this.addButton.disabled = !enabled;
    this.addButton.textContent = text;
  }
}
customElements.define('product-form', ProductForm);

/* AJAX add to cart for any form with data-ajax-cart */
const updateCartCount = (count) => {
  document.querySelectorAll('[data-cart-count]').forEach((el) => {
    el.textContent = count;
    el.hidden = count === 0;
  });
};

let toastTimer;
const showToast = (message) => {
  const toast = document.getElementById('CartToast');
  if (!toast) return;
  toast.querySelector('.toast__text').textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 4000);
};

document.addEventListener('submit', async (event) => {
  const form = event.target;
  if (!form.matches('[data-ajax-cart]')) return;
  if (document.body.dataset.cartBehavior === 'page') return;
  event.preventDefault();

  const button = form.querySelector('[type="submit"]');
  button && button.classList.add('is-loading');
  try {
    const response = await fetch(`${window.theme.routes.cartAdd}.js`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.description || data.message || window.theme.strings.error);
    const cart = await fetch(`${window.theme.routes.cart}.js`).then((r) => r.json());
    updateCartCount(cart.item_count);
    showToast(window.theme.strings.added);
  } catch (error) {
    showToast(error.message || window.theme.strings.error);
  } finally {
    button && button.classList.remove('is-loading');
  }
});
