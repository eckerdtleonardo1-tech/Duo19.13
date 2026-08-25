// js/catalog.js

document.addEventListener('DOMContentLoaded', () => {
    initData();
    let products = getProducts();
    let cart = JSON.parse(localStorage.getItem('duo1913_cart')) || [];
    
    const grid = document.getElementById('productGrid');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    // Modal Details
    const modal = document.getElementById('productModal');
    const closeModal = document.querySelector('.close-modal');
    let currentSelectedProduct = null;

    // Cart DOM
    const cartBtn = document.getElementById('cartBtn');
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCart = document.getElementById('closeCart');
    const cartBadge = document.getElementById('cartBadge');
    const cartBody = document.getElementById('cartBody');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // ---------------- UI & NOTIFICATIONS ---------------- //
    function showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = message;
        container.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ---------------- RENDERING PRODUCTS ---------------- //
    function renderProducts(items) {
        grid.innerHTML = '';
        if(items.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted)">No se encontraron productos.</p>';
            return;
        }

        items.forEach(prod => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${prod.image}" alt="${prod.name}" class="card-img" loading="lazy">
                <div class="card-body">
                    <p class="card-cat">${prod.category}</p>
                    <h3 class="card-title">${prod.name}</h3>
                    <p class="card-price">$${prod.price.toLocaleString('es-AR')}</p>
                </div>
            `;
            card.addEventListener('click', () => openModal(prod));
            grid.appendChild(card);
        });
    }

    // ---------------- FILTERS & SORTING ---------------- //
    function updateProductView() {
        const query = searchInput.value.toLowerCase();
        const category = categoryFilter.value;
        const sortBy = sortFilter.value;

        // Filter
        let filtered = products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query);
            const matchesCat = category === 'all' || p.category === category;
            return matchesSearch && matchesCat;
        });

        // Sort
        if (sortBy === 'price-asc') filtered.sort((a, b) => a.price - b.price);
        if (sortBy === 'price-desc') filtered.sort((a, b) => b.price - a.price);
        if (sortBy === 'name-asc') filtered.sort((a, b) => a.name.localeCompare(b.name));

        renderProducts(filtered);
    }

    searchInput.addEventListener('input', updateProductView);
    categoryFilter.addEventListener('change', updateProductView);
    sortFilter.addEventListener('change', updateProductView);

    // ---------------- PRODUCT MODAL ---------------- //
    function openModal(prod) {
        currentSelectedProduct = prod;
        document.getElementById('modalImg').src = prod.image;
        document.getElementById('modalTitle').textContent = prod.name;
        document.getElementById('modalCategory').textContent = prod.category;
        document.getElementById('modalDescription').textContent = prod.description;
        document.getElementById('modalPrice').textContent = `$${prod.price.toLocaleString('es-AR')}`;
        
        const stockEl = document.getElementById('modalStock');
        stockEl.textContent = prod.stock > 0 ? `Stock: ${prod.stock} un.` : 'Sin Stock';
        stockEl.style.color = prod.stock > 0 ? 'var(--neon-secondary)' : '#ff3366';
        
        const addToCartBtn = document.getElementById('addToCartBtn');
        addToCartBtn.disabled = prod.stock <= 0;
        
        modal.classList.add('active');
    }

    closeModal.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
        if(e.target === modal) modal.classList.remove('active');
    });

    document.getElementById('addToCartBtn').addEventListener('click', () => {
        if (currentSelectedProduct) {
            addToCart(currentSelectedProduct);
            modal.classList.remove('active');
        }
    });

    // ---------------- SHOPPING CART LOGIC ---------------- //
    function saveCart() {
        localStorage.setItem('duo1913_cart', JSON.stringify(cart));
        updateCartUI();
    }

    function addToCart(product) {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            if (existing.qty < product.stock) {
                existing.qty += 1;
                showToast(`Agregaste otro "${product.name}" al carrito.`);
            } else {
                showToast(`No hay más stock de "${product.name}".`, 'error');
                return;
            }
        } else {
            cart.push({ ...product, qty: 1 });
            showToast(`"${product.name}" agregado al carrito.`);
        }
        saveCart();
    }

    window.updateCartQty = (id, change) => {
        const item = cart.find(i => i.id === id);
        if (item) {
            const product = products.find(p => p.id === id);
            const newQty = item.qty + change;
            
            if (newQty > 0 && newQty <= product.stock) {
                item.qty = newQty;
            } else if (newQty <= 0) {
                cart = cart.filter(i => i.id !== id);
            } else {
                showToast(`Stock máximo alcanzado`, 'error');
                return;
            }
            saveCart();
        }
    };

    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        cartBadge.textContent = totalItems;
        
        cartBody.innerHTML = '';
        if (cart.length === 0) {
            cartBody.innerHTML = '<p style="color: var(--text-muted); text-align: center;">Tu carrito está vacío.</p>';
            cartTotal.textContent = '$0';
            return;
        }

        let total = 0;
        cart.forEach(item => {
            total += item.price * item.qty;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toLocaleString('es-AR')}</div>
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="updateCartQty(${item.id}, -1)">-</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" onclick="updateCartQty(${item.id}, 1)">+</button>
                    </div>
                </div>
            `;
            cartBody.appendChild(div);
        });

        cartTotal.textContent = `$${total.toLocaleString('es-AR')}`;
    }

    // Cart Sidebar Toggle
    cartBtn.addEventListener('click', () => cartSidebar.classList.add('active'));
    closeCart.addEventListener('click', () => cartSidebar.classList.remove('active'));

    // Checkout via WhatsApp
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast('El carrito está vacío', 'error');
            return;
        }

        let message = `*¡Hola Duo19-13!* Quiero realizar el siguiente pedido:\n\n`;
        let total = 0;

        cart.forEach(item => {
            const subtotal = item.price * item.qty;
            total += subtotal;
            message += `- ${item.qty}x *${item.name}* ($${subtotal.toLocaleString('es-AR')})\n`;
        });

        message += `\n*Total a pagar: $${total.toLocaleString('es-AR')}*`;
        
        const wppNumber = '5493329534029'; // El número configurado
        window.open(`https://wa.me/${wppNumber}?text=${encodeURIComponent(message)}`, '_blank');
        
        // Opcional: vaciar carrito después de enviar
        // cart = [];
        // saveCart();
    });

    // Inicializar
    updateProductView();
    updateCartUI();

    // Sincronización entre pestañas
    window.addEventListener('storage', (e) => {
        if (e.key === 'duo1913_products') {
            products = getProducts();
            updateProductView();
        }
    });
});
