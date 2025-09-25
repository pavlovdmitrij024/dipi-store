(function () {
  function getCart() {
    try {
      const raw = localStorage.getItem('cart');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('Сломанные данные в localStorage.cart, очищаю…', e);
      localStorage.removeItem('cart');
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  function addToCart(product) {
    const cart = getCart();
    cart.push(product);
    saveCart(cart);
  }

  function showNotification(message = 'Товар добавлен в корзину') {
    const el = document.getElementById('cart-notification');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 3000);
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn-buy').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();

        const card = button.closest('.card');
        if (!card) {
          console.error('Не найден родитель .card для кнопки', button);
          return;
        }

        const nameEl = card.querySelector('h3');
        const priceEl = card.querySelector('.price');
        const imgEl = card.querySelector('img');

        if (!nameEl || !priceEl || !imgEl) {
          console.error('Не найдены name/price/img внутри карточки', card);
          return;
        }

        const name = nameEl.innerText.trim();
        const priceText = priceEl.innerText.trim();
        const price = parseInt(priceText.replace(/\D+/g, ''), 10);
        const image = imgEl.getAttribute('src');

        const product = {
          id: name,
          name,
          price,
          currency: '₸',
          image,
          qty: 1,
          addedAt: Date.now()
        };

        addToCart(product);
        showNotification(`Добавлено в корзину: ${name}`);
      });
    });

    document.querySelectorAll('.btn-desc').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = btn.closest('.card');
        if (!card) return;
        const name = card.querySelector('h3')?.innerText?.trim() || card.dataset.id || 'Товар';
        const img = card.querySelector('img')?.getAttribute('src') || './img/placeholder.png';
        const priceText = card.querySelector('.price')?.innerText?.trim() || '';
        const desc = card.dataset.desc || '';
        const product = { id: name, name, img, priceText, description: desc };
        openModalForProduct(product);
      });
    });
  });

  function getReviews(key) {
    try { return JSON.parse(localStorage.getItem('reviews:' + key) || '[]'); } catch { return []; }
  }
  function saveReviews(key, arr) { localStorage.setItem('reviews:' + key, JSON.stringify(arr)); }

  function openModalForProduct(product) {
    const modal = document.getElementById('product-modal');
    if (!modal) return;
    modal.querySelector('.modal-title').textContent = product.name;
    modal.querySelector('.modal-img').src = product.img;
    modal.querySelector('.modal-desc').textContent = product.description || '';
    modal.dataset.key = product.id;
    renderReviewsIndex(modal.dataset.key);
    modal.classList.add('open');
  }
  function closeModalIndex() {
    const modal = document.getElementById('product-modal');
    if (!modal) return;
    modal.classList.remove('open');
  }
  function renderReviewsIndex(key) {
    const list = document.querySelector('#product-modal .reviews-list');
    if (!list) return;
    const reviews = getReviews(key);
    if (reviews.length === 0) {
      list.innerHTML = '<p class="muted">Еще нет отзывов.</p>';
      return;
    }
    list.innerHTML = reviews.map(r => `<div class="review"><strong>${escapeHtml(r.name)}</strong><p>${escapeHtml(r.text)}</p></div>`).join('');
  }
  function escapeHtml(s = '') {
    return String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('product-modal');
    if (!modal) return;
    modal.querySelector('.modal-close').addEventListener('click', closeModalIndex);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModalIndex(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModalIndex(); });

    const form = modal.querySelector('.review-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const key = modal.dataset.key;
        const name = form.querySelector('[name="review-name"]').value.trim() || 'Аноним';
        const text = form.querySelector('[name="review-text"]').value.trim();
        if (!text) return;
        const reviews = getReviews(key);
        reviews.unshift({name, text, at: Date.now()});
        saveReviews(key, reviews);
        form.reset();
        renderReviewsIndex(key);
      });
    }
  });
})();
