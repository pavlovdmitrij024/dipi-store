(function () {
  function getCart() {
    try {
      const raw = localStorage.getItem('cart');
      return raw ? JSON.parse(raw) : [];
    } catch {
      localStorage.removeItem('cart');
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  function render() {
    const listEl = document.querySelector('.cart-items');
    const totalEl = document.querySelector('.cart-total');
    const cart = getCart();

    if (!listEl || !totalEl) return;

    if (cart.length === 0) {
      listEl.innerHTML = '<p>Корзина пуста</p>';
      totalEl.textContent = '';
      return;
    }

    listEl.innerHTML = cart.map((item, i) => {
      const src = item.image || item.img || './img/placeholder.png';
      const priceNum = Number(item.price) || 0;
      const currency = item.currency || '₸';
      const qty = item.qty || 1;
      return `
      <div class="product cart-item" data-idx="${i}">
        <img src="${src}" alt="${item.name}" class="product-img">
        <div class="info">
          <h3>${item.name}</h3>
          <p class="price">${priceNum.toLocaleString('ru-KZ')} ${currency}</p>
        </div>
        <div class="qty">
          <button class="dec">−</button>
          <span class="qty-value">${qty}</span>
          <button class="inc">+</button>
        </div>
        <div class="actions">
          <button class="remove">Удалить</button>
        </div>
      </div>
    `;
    }).join('');

    const total = cart.reduce((sum, it) => {
      const p = Number(it.price) || 0;
      const q = it.qty || 1;
      return sum + p * q;
    }, 0);
    totalEl.textContent = `Итого: ${total.toLocaleString('ru-KZ')} ₸`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const listEl = document.querySelector('.cart-items');
    const clearBtn = document.querySelector('.cart-clear');
    const checkoutBtn = document.querySelector('.cart-checkout');

    if (listEl) {
      listEl.addEventListener('click', (e) => {
        const cart = getCart();
        const itemEl = e.target.closest('.cart-item');
        if (!itemEl) return;
        const idx = Number(itemEl.dataset.idx);

        if (e.target.classList.contains('remove')) {
          cart.splice(idx, 1);
          saveCart(cart);
          render();
        }

        if (e.target.classList.contains('inc')) {
          cart[idx].qty = (cart[idx].qty || 1) + 1;
          saveCart(cart);
          render();
        }

        if (e.target.classList.contains('dec')) {
          cart[idx].qty = Math.max(1, (cart[idx].qty || 1) - 1);
          saveCart(cart);
          render();
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        localStorage.removeItem('cart');
        render();
      });
    }

    if (checkoutBtn) {
      // Если это не ссылка, явно переадресуем на pay.html.
      checkoutBtn.addEventListener('click', (e) => {
        if (checkoutBtn.tagName.toLowerCase() !== 'a') {
          e.preventDefault();
          window.location.href = 'pay.html';
        }
        // Если это <a href="pay.html"> — позволяем браузеру перейти по ссылке.
      });
    }

    render();
  });
})();