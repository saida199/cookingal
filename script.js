const products = [
  {
    id: 1, category: 'dessert',
    name: 'Trilece',
    local: 'Trilek',
    emoji: '🍮',
    bg: '#f5e6c8',
    desc: 'Le gâteau aux trois laits albanais – moelleux, imbibé de crème et couronné d\'un caramel doré.',
    price: 5.50,
    unit: 'part',
    badge: 'Best-seller'
  },
  {
    id: 2, category: 'dessert',
    name: 'Baklava',
    local: 'Bakllavë',
    emoji: '🍯',
    bg: '#f0d28a',
    desc: 'Feuilletés de pâte filo croustillante, garnis de noix concassées et nappés de sirop de miel.',
    price: 1.80,
    unit: 'pièce',
    badge: null
  },
  {
    id: 3, category: 'dessert',
    name: 'Kadaïf',
    local: 'Kadaif',
    emoji: '🧆',
    bg: '#e8c87a',
    desc: 'Cheveux d\'ange dorés au four, enroulés autour d\'une garniture de noix, parfumés à l\'eau de rose.',
    price: 2.20,
    unit: 'pièce',
    badge: null
  },
  {
    id: 4, category: 'pite',
    name: 'Pite au Fromage',
    local: 'Byrek me djathë',
    emoji: '🥐',
    bg: '#f0e0b0',
    desc: 'Feuilleté doré et croustillant garni d\'un généreux mélange de fromages blancs albanais.',
    price: 3.50,
    unit: 'part',
    badge: 'Maison'
  },
  {
    id: 5, category: 'pite',
    name: 'Pite Épinards & Feta',
    local: 'Byrek me spinaq',
    emoji: '🥬',
    bg: '#d4e8c8',
    desc: 'Pâte fine et feuilletée, garnie d\'épinards frais et de feta crémeuse, relevée d\'herbes aromatiques.',
    price: 3.50,
    unit: 'part',
    badge: null
  },
  {
    id: 6, category: 'pite',
    name: 'Pite aux Poireaux',
    local: 'Byrek me presh',
    emoji: '🫚',
    bg: '#e8f0d0',
    desc: 'Pite fondante aux poireaux confits, légèrement relevée, une recette de grand-mère revisitée.',
    price: 3.50,
    unit: 'part',
    badge: null
  },
];

// ── CART: persisté dans sessionStorage ──
const CART_KEY = 'shtepia_cart';

function loadCart() {
  try { return JSON.parse(sessionStorage.getItem(CART_KEY) || '{}'); }
  catch { return {}; }
}

function saveCart(c) {
  sessionStorage.setItem(CART_KEY, JSON.stringify(c));
}

let cart = loadCart();
let currentFilter = 'all';

function renderProducts(filter = 'all') {
  const grid = document.getElementById('productsGrid');
  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
  grid.innerHTML = filtered.map(p => `
    <div class="product-card" data-category="${p.category}">
      ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
      <div class="product-img-wrap">
        <div class="emoji-img" style="background:${p.bg}">${p.emoji}</div>
      </div>
      <div class="product-body">
        <p class="product-category">${p.category === 'dessert' ? 'Dessert' : 'Pite'}</p>
        <h3 class="product-name">${p.name}</h3>
        <p class="product-name-local">${p.local}</p>
        <p class="product-desc">${p.desc}</p>
        <div class="product-footer">
          <div class="product-price">
            ${p.price.toFixed(2).replace('.',',')} €
            <small>/ ${p.unit}</small>
          </div>
          <button class="add-btn" id="btn-${p.id}" onclick="addToCart(${p.id})">Ajouter</button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterProducts(cat, btn) {
  currentFilter = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(cat);
}

function addToCart(id) {
  const p = products.find(x => x.id === id);
  if (!cart[id]) cart[id] = { ...p, qty: 0 };
  cart[id].qty++;
  saveCart(cart);
  updateCartUI();
  showToast(`${p.emoji} ${p.name} ajouté au panier`);
  const btn = document.getElementById('btn-' + id);
  if (btn) {
    btn.classList.add('added');
    btn.textContent = 'Ajouté ✓';
    setTimeout(() => { btn.classList.remove('added'); btn.textContent = 'Ajouter'; }, 1500);
  }
}

function removeFromCart(id) {
  if (!cart[id]) return;
  cart[id].qty--;
  if (cart[id].qty <= 0) delete cart[id];
  saveCart(cart);
  updateCartUI();
}

function updateCartUI() {
  const items = Object.values(cart);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('cartCount').textContent = count;
  document.getElementById('cartTotal').textContent = total.toFixed(2).replace('.',',') + ' €';
  const cartEl = document.getElementById('cartItems');
  if (items.length === 0) {
    cartEl.innerHTML = `<div class="empty-cart"><span>🛒</span>Votre panier est vide</div>`;
  } else {
    cartEl.innerHTML = items.map(i => `
      <div class="cart-item">
        <div class="cart-item-emoji">${i.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${i.name}</div>
          <div class="cart-item-price">${(i.price * i.qty).toFixed(2).replace('.',',')} €</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="removeFromCart(${i.id})">−</button>
            <span class="qty-num">${i.qty}</span>
            <button class="qty-btn" onclick="addToCart(${i.id})">+</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Bouton "Procéder au paiement" dans la sidebar
  const footerEl = document.querySelector('.cart-footer');
  if (footerEl) {
    let existing = document.getElementById('checkoutLink');
    if (items.length > 0 && !existing) {
      const link = document.createElement('a');
      link.id = 'checkoutLink';
      link.href = 'checkout.html';
      link.className = 'checkout-btn';
      link.style.cssText = 'display:block; text-align:center; text-decoration:none; margin-top:0.8rem;';
      link.textContent = '→ Procéder au paiement';
      footerEl.appendChild(link);
    } else if (items.length === 0 && existing) {
      existing.remove();
    }
  }
}

function openCart() {
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
}

function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
}

function checkout() {
  const items = Object.values(cart);
  if (items.length === 0) { showToast('🛒 Votre panier est vide !'); return; }
  window.location.href = 'checkout.html';
}

let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

// Navbar scroll
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
});

// Init
renderProducts();
updateCartUI();
