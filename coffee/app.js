// Data: Menu items
const menuItems = [
  { id: 1, name: "Espresso", description: "Strong and bold espresso shot.", price: 3.0, img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80" },
  { id: 2, name: "Cappuccino", description: "Espresso with steamed milk foam.", price: 4.5, img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=80" },
  { id: 3, name: "Latte", description: "Creamy latte with rich espresso flavor.", price: 4.75, img: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=400&q=80" },
  { id: 4, name: "Americano", description: "Espresso diluted with hot water.", price: 3.25, img: "https://images.unsplash.com/photo-1515442261605-2e7e2b4e9a27?auto=format&fit=crop&w=400&q=80" },
  { id: 5, name: "Mocha", description: "Chocolate-infused espresso drink.", price: 5.0, img: "https://images.unsplash.com/photo-1562440499-78d9e1a87eb2?auto=format&fit=crop&w=400&q=80" }
];

// State: Cart, Order Type & Order History
let cart = [];
let orderType = "Dine In";
let orderHistory = [];

// DOM Elements
const menuContainer = document.getElementById('menu-container');
const cartList = document.getElementById('cart-list');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const orderTypeInputs = document.querySelectorAll('input[name="orderType"]');
const orderHistoryList = document.getElementById('order-history-list');

// --- Render Menu ---
function renderMenu() {
  menuContainer.innerHTML = '';
  menuItems.forEach(item => {
    const menuItem = document.createElement('article');
    menuItem.classList.add('menu-item');
    menuItem.setAttribute('role', 'listitem');
    menuItem.setAttribute('tabindex', '0');
    menuItem.innerHTML = `
      <img src="${item.img}" alt="${item.name}" />
      <div class="menu-info">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="price-order">
          <span class="price">$${item.price.toFixed(2)}</span>
          <button class="order-btn" aria-label="Add ${item.name} to cart" data-id="${item.id}">Add</button>
        </div>
      </div>
    `;
    menuContainer.appendChild(menuItem);
  });

  // Add event listeners to Add buttons
  document.querySelectorAll('.order-btn').forEach(button => {
    button.addEventListener('click', () => {
      const id = Number(button.dataset.id);
      addToCart(id);
    });
  });
}

// --- Add Item to Cart ---
function addToCart(id) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity++;
  } else {
    const item = menuItems.find(m => m.id === id);
    cart.push({ ...item, quantity: 1 });
  }
  renderCart();
}

// --- Render Cart ---
function renderCart() {
  cartList.innerHTML = '';
  if (cart.length === 0) {
    cartList.innerHTML = '<li>Your cart is empty.</li>';
    cartTotal.textContent = 'Total: $0.00';
    checkoutBtn.disabled = true;
    return;
  }

  cart.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="cart-item-info">
        <img src="${item.img}" alt="${item.name}" />
        <div class="cart-item-details">
          <strong>${item.name}</strong>
          <small>$${item.price.toFixed(2)} each</small>
        </div>
      </div>
      <div class="cart-controls" aria-label="Modify quantity for ${item.name}">
        <button aria-label="Decrease quantity" data-id="${item.id}" class="decrement">−</button>
        <span class="cart-quantity" aria-live="polite" aria-atomic="true">${item.quantity}</span>
        <button aria-label="Increase quantity" data-id="${item.id}" class="increment">+</button>
        <button aria-label="Remove ${item.name} from cart" data-id="${item.id}" class="remove">×</button>
      </div>
    `;
    cartList.appendChild(li);
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = `Total: $${total.toFixed(2)}`;
  checkoutBtn.disabled = false;

  // Add event listeners for controls
  cartList.querySelectorAll('button.increment').forEach(btn =>
    btn.addEventListener('click', () => updateQuantity(Number(btn.dataset.id), 1))
  );
  cartList.querySelectorAll('button.decrement').forEach(btn =>
    btn.addEventListener('click', () => updateQuantity(Number(btn.dataset.id), -1))
  );
  cartList.querySelectorAll('button.remove').forEach(btn =>
    btn.addEventListener('click', () => removeFromCart(Number(btn.dataset.id)))
  );
}

// --- Update Quantity ---
function updateQuantity(id, change) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.quantity += change;
  if (item.quantity <= 0) {
    removeFromCart(id);
  } else {
    renderCart();
  }
}

// --- Remove from Cart ---
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  renderCart();
}

// --- Handle Order Type Change ---
function handleOrderTypeChange() {
  orderTypeInputs.forEach(input => {
    input.addEventListener('change', () => {
      orderType = document.querySelector('input[name="orderType"]:checked').value;
    });
  });
}

// --- Save Order History to Local Storage ---
function saveOrderHistory() {
  localStorage.setItem('jyllyOrderHistory', JSON.stringify(orderHistory));
}

// --- Load Order History from Local Storage ---
function loadOrderHistory() {
  const data = localStorage.getItem('jyllyOrderHistory');
  if (data) {
    orderHistory = JSON.parse(data);
  }
}

// --- Render Order History ---
function renderOrderHistory() {
  orderHistoryList.innerHTML = '';
  if (orderHistory.length === 0) {
    orderHistoryList.innerHTML = '<li>No past orders yet.</li>';
    return;
  }
  orderHistory.forEach((order) => {
    const li = document.createElement('li');
    const dateStr = new Date(order.timestamp).toLocaleString();

    // Create a small sub-list for order items
    const itemsList = document.createElement('ul');
    itemsList.style.margin = '5px 0 0 15px';
    itemsList.style.padding = '0';
    itemsList.style.listStyleType = 'circle';

    order.items.forEach(item => {
      const itemLi = document.createElement('li');
      itemLi.textContent = `${item.name} ×${item.quantity}`;
      itemsList.appendChild(itemLi);
    });

    li.innerHTML = `
      <strong>Order Type:</strong> ${order.type} <br>
      <strong>Date:</strong> ${dateStr} <br>
      <strong>Total:</strong> $${order.total.toFixed(2)}
    `;
    li.appendChild(itemsList);
    orderHistoryList.appendChild(li);
  });
}

// --- Checkout ---
function checkout() {
  if (cart.length === 0) return;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = {
    id: Date.now(),
    timestamp: Date.now(),
    type: orderType,
    items: cart.map(i => ({ id: i.id, name: i.name, quantity: i.quantity })),
    total,
  };

  orderHistory.unshift(order); // newest on top
  saveOrderHistory();
  renderOrderHistory();

  alert(`Order placed!\nType: ${orderType}\nTotal: $${total.toFixed(2)}`);

  cart = [];
  renderCart();
}

// --- Initialize ---
function init() {
  renderMenu();
  renderCart();
  loadOrderHistory();
  renderOrderHistory();
  handleOrderTypeChange();
  checkoutBtn.addEventListener('click', checkout);
}

init();
