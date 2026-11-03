const products = [
    {
        id: 1,
        title: "Apple MacBook Pro 16\"",
        desc: "Процесор M3 Max, 36 ГБ ОЗП, 1 ТБ SSD. Потужність для складних завдань.",
        price: 129999,
        category: "laptops",
        image: "./assets/images/mak.jpg"
    },
    {
        id: 2,
        title: "Samsung Galaxy S24 Ultra",
        desc: "Дисплей 6.8\", камера 200 Мп, підтримка S-Pen та штучного інтелекту Galaxy AI.",
        price: 52999,
        category: "smartphones",
        image: "./assets/images/s24.jpg"
    },
    {
        id: 3,
        title: "Sony PlayStation 5 Slim",
        desc: "Ігрова консоль з накопичувачем 1 ТБ та бездротовим геймпадом DualSense.",
        price: 21999,
        category: "consoles",
        image: "./assets/images/ps5.jpg"
    },
    {
        id: 4,
        title: "ASUS ROG Zephyrus G16",
        desc: "Ігровий ноутбук: Intel Core Ultra 9, RTX 4070, OLED-екран 240 Гц.",
        price: 89999,
        category: "laptops",
        image: "./assets/images/asus rog.jpg"
    },
    {
        id: 5,
        title: "Apple iPad Air 11\" M2",
        desc: "Планшет з дисплеєм Liquid Retina та підтримкою Apple Pencil Pro.",
        price: 28999,
        category: "tablets",
        image: "./assets/images/ipad iar.jpg"
    },
    {
        id: 6,
        title: "Sony WH-1000XM5",
        desc: "Преміальні навушники з найкращою системою активного шумозаглушення.",
        price: 14599,
        category: "audio",
        image: "./assets/images/sony.jpg"
    }
];

const container = document.querySelector(".products-grid");

function fetchProducts() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(products);
            // reject(new Error("Не вдалося підключитися до бази даних"));
        }, 1500);
    });
}

async function initShop() {
    const loader = document.getElementById("loader");
    
    if (loader) loader.classList.remove("hidden");
    if (container) container.innerHTML = ""; 

    try {
        const data = await fetchProducts();
        
        if (loader) loader.classList.add("hidden");
        
        const htmlString = data.map((product) => {
            return `
                <article class="product-card">
                    <div class="img-wrapper">
                        <img src="${product.image}" alt="${product.title}" class="product-img">
                    </div>
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-desc">${product.desc}</p>
                    <span class="product-price">${product.price.toLocaleString("uk-UA")} грн</span>
                    <button class="btn-buy" data-id="${product.id}">Купити</button>
                </article>
            `;
        }).join("");

        if (container) container.innerHTML = htmlString;
        
        attachCartEvents();

    } catch (error) {
        if (loader) loader.classList.add("hidden");
        if (container) container.innerHTML = `<p style="color: red; text-align: center;">Помилка: ${error.message}</p>`;
    }
}

initShop();

const cart = [];

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
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
    console.log("Загальна сума:", calculateTotal(), "грн");

    renderCartItems();
}

function attachCartEvents() {
    const buyButtons = document.querySelectorAll(".btn-buy");
    buyButtons.forEach(button => {
        button.addEventListener("click", function() {
            const id = Number(button.dataset.id);
            addToCart(id);
        });
    });
}

// ===== Модальне вікно кошика =====
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
            const product = products.find(p => p.id === item.id);
            return `
                <div class="cart-item">
                    <img src="${product.image}" alt="${item.title}">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-price">${item.price.toLocaleString("uk-UA")} грн × ${item.quantity}</div>
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

    totalSum.textContent = calculateTotal().toLocaleString("uk-UA");
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

// Слухачі
cartButton.addEventListener("click", openCartModal);
closeBtn.addEventListener("click", closeCartModal);

cartOverlay.addEventListener("click", (event) => {
    if (event.target === cartOverlay) {
        closeCartModal();
    }
});

// Плюс/мінус у кошику (делегування подій, бо кнопки створюються динамічно)
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