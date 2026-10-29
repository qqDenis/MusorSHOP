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

if (container) {
    const htmlString = products
        .map((product) => {
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
        })
        .join("");

    container.innerHTML = htmlString;
}