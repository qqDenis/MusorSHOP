let globalStoreProducts = [];

const container = document.querySelector(".products-grid");

async function fetchProducts() {
    try {
        const response = await fetch("https://fakestoreapi.com/products?limit=8");

        if (!response.ok) {
            throw new Error(`HTTP помилка: ${response.status}`);
        }

        const realProducts = await response.json();
        return realProducts;
    } catch (error) {
        console.error("Помилка завантаження товарів:", error.message);
        throw error;
    }
}

async function initShop() {
    const loader = document.getElementById("loader");

    if (loader) loader.classList.remove("hidden");
    if (container) container.innerHTML = "";

    try {
        const data = await fetchProducts();
        globalStoreProducts = data;

        if (loader) loader.classList.add("hidden");

        const htmlString = data.map((product) => {
            return `
                <article class="product-card" draggable="true" data-id="${product.id}">
                    <div class="img-wrapper">
                        <img src="${product.image}" alt="${product.title}" class="product-img" draggable="false">
                    </div>
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-desc">${product.description}</p>
                    <span class="product-price">$${product.price}</span>
                    <button class="btn-buy" data-id="${product.id}">Купити</button>
                </article>
            `;
        }).join("");

        if (container) container.innerHTML = htmlString;

    } catch (error) {
        if (loader) loader.classList.add("hidden");
        if (container) container.innerHTML = `<p style="color: red; text-align: center;">Помилка: ${error.message}</p>`;
    }
}

initShop();

/* ---------------- Кошик ---------------- */

const cart = [];

function addToCart(productId) {
    const product = globalStoreProducts.find(p => p.id === productId);
    if (!product) return;

    const itemInCart = cart.find(item => item.id === productId);

    if (itemInCart) {
        itemInCart.quantity = itemInCart.quantity + 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            quantity: 1
        });
    }
    updateUI();
}

function calculateTotal() {
    let totalSum = 0;
    cart.forEach(item => {
        totalSum = totalSum + (item.price * item.quantity);
    });
    return totalSum;
}

function updateUI() {
    const cartCounter = document.querySelector(".cart-counter");
    let totalItems = 0;

    cart.forEach(item => {
        totalItems = totalItems + item.quantity;
    });

    if (cartCounter) {
        cartCounter.textContent = totalItems;
    }

    console.log("Кошик:", cart);
    console.log("Загальна сума:", calculateTotal().toFixed(2), "$");

    renderCartItems();
}

const cartButton = document.querySelector(".btn-cart");
const cartOverlay = document.getElementById("cartOverlay");
const closeBtn = document.getElementById("closeCartBtn");
const cartItemsContainer = document.getElementById("cartItemsContainer");

function openCartModal() {
    cartOverlay.classList.remove("hidden");
    renderCartItems();
}

function closeCartModal() {
    cartOverlay.classList.add("hidden");
}

function renderCartItems() {
    const totalSum = document.getElementById("cartTotalSum");

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = "<p>Кошик порожній.</p>";
    } else {
        cartItemsContainer.innerHTML = cart.map(item => {
            const product = globalStoreProducts.find(p => p.id === item.id);
            return `
                <div class="cart-item">
                    <img src="${product.image}" alt="${item.title}">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-price">$${item.price} × ${item.quantity}</div>
                    </div>
                    <div class="qty-controls">
                        <button data-action="minus" data-id="${item.id}">−</button>
                        <span>${item.quantity}</span>
                        <button data-action="plus" data-id="${item.id}">+</button>
                    </div>
                </div>
            `;
        }).join("");
    }

    totalSum.textContent = calculateTotal().toFixed(2);
}

function decreaseFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index === -1) return;

    cart[index].quantity = cart[index].quantity - 1;
    if (cart[index].quantity === 0) {
        cart.splice(index, 1);
    }
    updateUI();
}

cartButton.addEventListener("click", openCartModal);
closeBtn.addEventListener("click", closeCartModal);

cartOverlay.addEventListener("click", (event) => {
    if (event.target === cartOverlay) {
        closeCartModal();
    }
});

cartItemsContainer.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) return;

    const id = Number(btn.dataset.id);
    if (btn.dataset.action === "plus") {
        addToCart(id);
    } else if (btn.dataset.action === "minus") {
        decreaseFromCart(id);
    }
});


const productsContainer = document.querySelector(".products-grid");

productsContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("btn-buy")) {
        const productId = event.target.dataset.id;
        console.log("Клік по товару з ID:", productId);
        addToCart(Number(productId));
    }
});

productsContainer.addEventListener("dragstart", (event) => {
    const card = event.target.closest(".product-card");
    if (card) {
        event.dataTransfer.setData("text/plain", card.dataset.id);
        card.classList.add("dragging");
    }
});

productsContainer.addEventListener("dragend", (event) => {
    const card = event.target.closest(".product-card");
    if (card) {
        card.classList.remove("dragging");
    }
});

const favoritesZone = document.getElementById("favoritesZone");

favoritesZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    favoritesZone.classList.add("drag-over");
});

favoritesZone.addEventListener("dragleave", () => {
    favoritesZone.classList.remove("drag-over");
});

favoritesZone.addEventListener("drop", (event) => {
    event.preventDefault();
    favoritesZone.classList.remove("drag-over");

    const productId = event.dataTransfer.getData("text/plain");
    if (!productId) return;

    if (favoritesZone.querySelector(`.fav-item[data-id="${productId}"]`)) return;

    favoritesZone.insertAdjacentHTML(
        "beforeend",
        `<div class="fav-item" data-id="${productId}">Товар #${productId}</div>`
    );
});