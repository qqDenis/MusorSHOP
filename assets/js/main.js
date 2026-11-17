let globalStoreProducts = [];
const cart = [];

const container = document.querySelector(".products-grid");


async function fetchProducts() {
    try {
        const response = await fetch("https://fakestoreapi.com/products?limit=8");

        if (!response.ok) {
            throw new Error(`HTTP помилка: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Помилка завантаження товарів:", error.message);
        throw error;
    }
}

function renderProducts(products) {
    if (!container) return;

    if (!products || products.length === 0) {
        container.innerHTML = '<p class="no-products">Товарів не знайдено</p>';
        return;
    }

    container.innerHTML = products.map(product => `
        <article class="product-card" draggable="true" data-id="${product.id}">
            <div class="img-wrapper">
                <img src="${product.image}" alt="${product.title}" class="product-img" draggable="false">
            </div>
            <h3 class="product-title">${product.title}</h3>
            <p class="product-desc">${product.description}</p>
            <span class="product-price">$${product.price}</span>
            <button class="btn-buy" data-id="${product.id}">Купити</button>
        </article>
    `).join("");
}

async function initShop() {
    const loader = document.getElementById("loader");

    if (loader) loader.classList.remove("hidden");
    if (container) container.innerHTML = "";

    try {
        const data = await fetchProducts();
        globalStoreProducts = data;

        if (loader) loader.classList.add("hidden");

        renderProducts(data);
    } catch (error) {
        if (loader) loader.classList.add("hidden");
        if (container) container.innerHTML = `<p style="color: red; text-align: center;">Помилка: ${error.message}</p>`;
    }
}

initShop();


const searchInput = document.getElementById("searchInput");
const searchResultCount = document.getElementById("searchResultCount");

if (searchInput) {
    searchInput.addEventListener("input", (event) => {
        const searchQuery = event.target.value.trim().toLowerCase();

        const matchedProducts = globalStoreProducts.filter(product => {
            return product.title.toLowerCase().includes(searchQuery);
        });

        if (searchQuery.length > 0) {
            searchResultCount.textContent = `Знайдено товарів: ${matchedProducts.length}`;
        } else {
            searchResultCount.textContent = "";
        }

        renderProducts(matchedProducts);
    });
}


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
    updateCartSummary();
}

function decreaseFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index === -1) return;

    cart[index].quantity = cart[index].quantity - 1;
    if (cart[index].quantity === 0) {
        cart.splice(index, 1);
    }
    updateCartSummary();
}

function calculateTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}


function updateCartSummary() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const subtotalSum = calculateTotal();

    const cartBadge = document.querySelector(".cart-counter");
    const modalTotalElement = document.getElementById("cartTotalSum");

    if (cartBadge) cartBadge.textContent = totalItems;
    if (modalTotalElement) modalTotalElement.textContent = subtotalSum.toFixed(2);

    renderCartItems();

    return subtotalSum;
}


const cartButton = document.querySelector(".btn-cart");
const cartOverlay = document.getElementById("cartOverlay");
const closeBtn = document.getElementById("closeCartBtn");
const cartItemsContainer = document.getElementById("cartItemsContainer");

function openCartModal() {
    cartOverlay.classList.remove("hidden");
    updateCartSummary();
}

function closeCartModal() {
    cartOverlay.classList.add("hidden");
}

function renderCartItems() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = "<p>Кошик порожній.</p>";
        return;
    }

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


container.addEventListener("click", (event) => {
    if (event.target.classList.contains("btn-buy")) {
        addToCart(Number(event.target.dataset.id));
    }
});

container.addEventListener("dragstart", (event) => {
    const card = event.target.closest(".product-card");
    if (card) {
        event.dataTransfer.setData("text/plain", card.dataset.id);
        card.classList.add("dragging");
    }
});

container.addEventListener("dragend", (event) => {
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
    if (!/^\d+$/.test(productId)) return;

    if (favoritesZone.querySelector(`.fav-item[data-id="${productId}"]`)) return;

    favoritesZone.insertAdjacentHTML(
        "beforeend",
        `<div class="fav-item" data-id="${productId}">Товар #${productId}</div>`
    );
});


function validateCheckoutForm(name, phone, email) {
    let isValid = true;

    document.getElementById("nameError").textContent = "";
    document.getElementById("phoneError").textContent = "";
    document.getElementById("emailError").textContent = "";

    const words = name.split(" ").filter(Boolean);
    if (words.length < 2 || name.length < 5) {
        document.getElementById("nameError").textContent = "Введіть повне ім'я та прізвище (щонайменше 2 слова).";
        isValid = false;
    }

    const phonePattern = /^\+?380\d{9}$/;
    if (!phonePattern.test(phone)) {
        document.getElementById("phoneError").textContent = "Введіть коректний номер у форматі +380XXXXXXXXX.";
        isValid = false;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
        document.getElementById("emailError").textContent = "Введіть дійсну поштову адресу (наприклад, user@mail.com).";
        isValid = false;
    }

    return isValid;
}


const orderForm = document.getElementById("checkoutOrderForm");

function completeCheckoutProcess(name, phone, email, promo) {
    if (cart.length === 0) {
        alert("Ваш кошик порожній! Спочатку додайте товари до кошика.");
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    let discountPercent = 0;
    if (promo === "SALE10") {
        discountPercent = 10;
    } else if (promo) {
        alert("Невірний промокод, знижку не застосовано.");
    }

    const discountAmount = Math.round(subtotal * discountPercent) / 100;
    const finalAmount = Math.max(0, subtotal - discountAmount);

    const orderData = {
        customer: { name, phone, email },
        items: cart.map(item => ({
            id: item.id,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
            cost: Number((item.price * item.quantity).toFixed(2))
        })),
        promoCode: promo || null,
        discountAmount: Number(discountAmount.toFixed(2)),
        totalToPay: Number(finalAmount.toFixed(2)),
        createdAt: new Date().toISOString()
    };

    console.log("Замовлення сформовано (JSON Payload):", orderData);
    alert(`Дякуємо, ${name}! Замовлення на суму $${finalAmount.toFixed(2)} успішно прийнято.`);

    cart.length = 0;
    updateCartSummary();
    orderForm.reset();

    closeCartModal();
}


if (orderForm) {
    orderForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(orderForm);

        const rawName = formData.get("clientName") || "";
        const rawPhone = formData.get("clientPhone") || "";
        const rawEmail = formData.get("clientEmail") || "";
        const rawPromo = formData.get("orderPromo") || "";

        const cleanName = rawName.trim().replace(/\s+/g, " ");
        const cleanPhone = rawPhone.replaceAll(/[\s()\-]/g, "");
        const cleanEmail = rawEmail.trim().toLowerCase();
        const cleanPromo = rawPromo.trim().toUpperCase();

        const isFormValid = validateCheckoutForm(cleanName, cleanPhone, cleanEmail);
        if (!isFormValid) {
            return;
        }

        completeCheckoutProcess(cleanName, cleanPhone, cleanEmail, cleanPromo);
    });
}