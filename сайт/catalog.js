const products = [
    {name: "Logitech G Pro X", brand: "Logitech", price: 45000, img: "./img/1.png", description: "Профессиональная игровая гарнитура Logitech G Pro X — четкий звук и удобство длительных сессий."},
    {name: "Razer DeathAdder", brand: "Razer", price: 35000, img: "./img/7.webp", description: "Классическая игровая мышь Razer DeathAdder с точным сенсором и эргономикой."},
    {name: "Inphic Wireless Mouse", brand: "Inphic", price: 15000, img: "./img/8.png", description: "Компактная беспроводная мышь Inphic — хорошая автономность и цена."},
    {name: "Attack Shark Keyboard", brand: "Attack Shark", price: 25000, img: "./img/2l.jpeg", description: "Механическая клавиатура Attack Shark с подсветкой и тактильными переключателями."},
    {name: "HyperX Cloud II", brand: "HyperX", price: 40000, img: "./img/4.jpg", description: "Комфортная гарнитура HyperX Cloud II с объемным звуком и шумоподавлением."},
    {name: "ASUS Gaming Monitor", brand: "ASUS", price: 120000, img: "./img/5.jpg", description: "Игровой монитор ASUS с высокой частотой обновления и быстрой матрицей."},
    {name: "LG UltraGear Monitor", brand: "LG", price: 110000, img: "./img/3.webp", description: "Монитор LG UltraGear для качественной картинки и плавной игры."},
    {name: "MSI Gaming Laptop", brand: "MSI", price: 550000, img: "./img/6.webp", description: "Мощный игровой ноутбук MSI с дискретной видеокартой и охлаждением."}
];

const productList = document.getElementById("product-list");
const filterSelect = document.getElementById("brand-filter");
// добавлены элементы фильтрации/сортировки
const priceMinEl = document.getElementById("price-min");
const priceMaxEl = document.getElementById("price-max");
const priceResetBtn = document.getElementById("price-reset");
const priceSortEl = document.getElementById("price-sort");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function renderProducts(filter = "all") {
    productList.innerHTML = "";

    // читаем текущие значения цен и сортировки
    const min = Number(priceMinEl?.value) || 0;
    const maxRaw = priceMaxEl?.value;
    const max = (maxRaw === '' || maxRaw == null) ? Infinity : Number(maxRaw);
    const sortMode = priceSortEl?.value || 'default';

    // фильтруем товары по бренду и цене
    let visible = products
        .filter(p => (filter === "all" || p.brand === filter))
        .filter(p => {
            const price = Number(p.price) || 0;
            return price >= min && price <= max;
        });

    // сортируем если нужно
    if (sortMode === 'asc') {
        visible.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortMode === 'desc') {
        visible.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    }

    visible.forEach((p, index) => {
        const div = document.createElement("div");
        div.className = "product";
        div.innerHTML = `
            <img src="${p.img}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p><strong>${p.price} ₸</strong></p>
            <div class="product-actions">
                <button class="add-btn" data-id="${index}" type="button">В корзину</button>
                <button class="desc-btn" data-id="${index}" type="button">Описание</button>
            </div>
        `;
        productList.appendChild(div);
    });

    // навешиваем обработчики (обновляем элементы внутри текущего списка)
    productList.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = Number(e.currentTarget.dataset.id);
            addToCart(idx);
        });
    });

    productList.querySelectorAll('.desc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = Number(e.currentTarget.dataset.id);
            openModal(visible[idx] || products[idx]);
        });
    });
}

function addToCart(index) {
    const p = products[index];
    const productToSave = {
        id: p.id || p.name,
        name: p.name,
        price: Number(p.price) || 0,
        currency: p.currency || '₸',
        image: p.img || p.image || './img/placeholder.png',
        qty: 1,
        addedAt: Date.now()
    };

    cart.push(productToSave);
    localStorage.setItem("cart", JSON.stringify(cart));

    showNotification(`Добавлено в корзину: ${productToSave.name}`);
}

function showNotification(message = 'Товар добавлен в корзину') {
    const note = document.getElementById("cart-notification");
    if (note) {
        note.textContent = message;
        note.classList.add('show');
        setTimeout(() => note.classList.remove('show'), 3000);
    } else {
        console.log(message);
    }
}

filterSelect.addEventListener("change", e => renderProducts(e.target.value));
priceMinEl?.addEventListener("input", () => renderProducts(filterSelect?.value || "all"));
priceMaxEl?.addEventListener("input", () => renderProducts(filterSelect?.value || "all"));
priceResetBtn?.addEventListener("click", () => {
    if (priceMinEl) priceMinEl.value = '';
    if (priceMaxEl) priceMaxEl.value = '';
    if (priceSortEl) priceSortEl.value = 'default';
    renderProducts(filterSelect?.value || "all");
});
priceSortEl?.addEventListener("change", () => renderProducts(filterSelect?.value || "all"));

// инициируем первый рендер
renderProducts();

function getReviews(key) {
    try {
        return JSON.parse(localStorage.getItem('reviews:' + key) || '[]');
    } catch {
        return [];
    }
}
function saveReviews(key, arr) {
    localStorage.setItem('reviews:' + key, JSON.stringify(arr));
}

function openModal(product) {
    const modal = document.getElementById('product-modal');
    if (!modal) return;
    modal.querySelector('.modal-title').textContent = product.name;
    modal.querySelector('.modal-img').src = product.img || './img/placeholder.png';
    modal.querySelector('.modal-desc').textContent = product.description || '';
    modal.dataset.key = product.id || product.name;

    renderReviews(modal.dataset.key);

    modal.classList.add('open');
}
function closeModal() {
    const modal = document.getElementById('product-modal');
    if (!modal) return;
    modal.classList.remove('open');
}

function renderReviews(key) {
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

    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    const form = modal.querySelector('.review-form');
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
        renderReviews(key);
    });
});