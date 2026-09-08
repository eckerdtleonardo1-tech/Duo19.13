// js/catalog.js

document.addEventListener('DOMContentLoaded', () => {
    initData();
    let products = getProducts();
    let currentUser = getCurrentUser();
    let cart = currentUser ? currentUser.cart : [];
    
    // UI Elements
    const grid = document.getElementById('productGrid');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    // Modals
    const productModal = document.getElementById('productModal');
    const authModal = document.getElementById('authModal');
    let currentSelectedProduct = null;

    // Cart DOM
    const cartSidebar = document.getElementById('cartSidebar');
    const cartBadgeHeader = document.getElementById('cartBadgeHeader');
    const cartBody = document.getElementById('cartBody');
    const cartTotal = document.getElementById('cartTotal');

    // Header toggles
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const collapsibleMenu = document.getElementById('collapsibleMenu');
    
    menuToggleBtn.addEventListener('click', () => {
        collapsibleMenu.classList.toggle('open');
    });

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

    // ---------------- AUTHENTICATION ---------------- //
    let isLoginMode = true;
    const authForm = document.getElementById('authForm');
    const toggleAuthMode = document.getElementById('toggleAuthMode');
    const authTitle = document.getElementById('authTitle');
    const authToggleText = document.getElementById('authToggleText');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const authError = document.getElementById('authError');
    
    document.getElementById('userBtn').addEventListener('click', () => {
        if(currentUser) {
            showToast('Ya has iniciado sesión.');
        } else {
            authModal.classList.add('active');
        }
    });

    document.getElementById('closeAuthModal').addEventListener('click', () => authModal.classList.remove('active'));

    toggleAuthMode.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        authError.style.display = 'none';
        
        if(isLoginMode) {
            authTitle.textContent = 'Iniciar Sesión';
            authSubmitBtn.textContent = 'Entrar';
            authToggleText.textContent = '¿No tienes cuenta?';
            toggleAuthMode.textContent = 'Regístrate';
        } else {
            authTitle.textContent = 'Crear Cuenta';
            authSubmitBtn.textContent = 'Registrarse';
            authToggleText.textContent = '¿Ya tienes cuenta?';
            toggleAuthMode.textContent = 'Inicia sesión';
        }
    });

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userVal = document.getElementById('authUsername').value.trim();
        const passVal = document.getElementById('authPassword').value.trim();
        
        if(!userVal || !passVal) return;

        let allUsers = getUsers();
        
        if(isLoginMode) {
            const user = allUsers.find(u => u.username === userVal && u.password === passVal);
            if(user) {
                setCurrentUser(user);
                showToast(`¡Bienvenido de nuevo, ${user.username}!`);
                authModal.classList.remove('active');
                handleLoginState();
            } else {
                authError.textContent = 'Usuario o contraseña incorrectos.';
                authError.style.display = 'block';
            }
        } else {
            if(allUsers.find(u => u.username === userVal)) {
                authError.textContent = 'El usuario ya existe.';
                authError.style.display = 'block';
            } else {
                const newUser = { username: userVal, password: passVal, role: 'customer', cart: [] };
                allUsers.push(newUser);
                saveUsers(allUsers);
                setCurrentUser(newUser);
                showToast(`¡Cuenta creada con éxito!`);
                authModal.classList.remove('active');
                handleLoginState();
            }
        }
    });

    function handleLoginState() {
        currentUser = getCurrentUser();
        const greetingBox = document.getElementById('userGreeting');
        const adminLink = document.getElementById('adminLink');
        
        if(currentUser) {
            cart = currentUser.cart || [];
            greetingBox.style.display = 'flex';
            document.getElementById('greetingName').textContent = currentUser.username;
            if(currentUser.role === 'admin') {
                adminLink.style.display = 'inline-block';
            } else {
                adminLink.style.display = 'none';
            }
        } else {
            cart = [];
            greetingBox.style.display = 'none';
            adminLink.style.display = 'none';
        }
        updateCartUI();
    }

    document.getElementById('logoutLink').addEventListener('click', () => {
        logoutUser();
        handleLoginState();
        showToast('Sesión cerrada.');
    });

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

    function updateProductView() {
        const query = searchInput.value.toLowerCase();
        const category = categoryFilter.value;
        const sortBy = sortFilter.value;

        let filtered = products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query);
            const matchesCat = category === 'all' || p.category === category;
            return matchesSearch && matchesCat;
        });

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
        
        productModal.classList.add('active');
    }

    document.getElementById('closeProductModal').addEventListener('click', () => productModal.classList.remove('active'));

    document.getElementById('addToCartBtn').addEventListener('click', () => {
        if (!currentUser) {
            showToast('Inicia sesión para usar el carrito', 'error');
            productModal.classList.remove('active');
            authModal.classList.add('active');
            return;
        }
        if (currentSelectedProduct) {
            addToCart(currentSelectedProduct);
            productModal.classList.remove('active');
        }
    });

    // ---------------- SHOPPING CART LOGIC ---------------- //
    function addToCart(product) {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            if (existing.qty < product.stock) {
                existing.qty += 1;
                showToast(`Agregaste otro "${product.name}" al carrito.`);
            } else {
                showToast(`No hay más stock disponible.`, 'error');
                return;
            }
        } else {
            cart.push({ ...product, qty: 1 });
            showToast(`"${product.name}" agregado al carrito.`);
        }
        syncUserCart(cart);
        updateCartUI();
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
            syncUserCart(cart);
            updateCartUI();
        }
    };

    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        cartBadgeHeader.textContent = totalItems;
        
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
    document.getElementById('cartBtnHeader').addEventListener('click', () => {
        if (!currentUser) {
            showToast('Inicia sesión para ver tu carrito', 'error');
            authModal.classList.add('active');
            return;
        }
        cartSidebar.classList.add('active');
    });
    
    document.getElementById('closeCart').addEventListener('click', () => cartSidebar.classList.remove('active'));

    // Checkout via WhatsApp
    document.getElementById('checkoutBtn').addEventListener('click', () => {
        if (cart.length === 0) return;

        let message = `*¡Hola Duo19-13!* Soy ${currentUser.username}. Quiero realizar el siguiente pedido:\n\n`;
        let total = 0;

        cart.forEach(item => {
            const subtotal = item.price * item.qty;
            total += subtotal;
            message += `- ${item.qty}x *${item.name}* ($${subtotal.toLocaleString('es-AR')})\n`;
        });

        message += `\n*Total a pagar: $${total.toLocaleString('es-AR')}*`;
        
        const wppNumber = '5493329534029'; 
        window.open(`https://wa.me/${wppNumber}?text=${encodeURIComponent(message)}`, '_blank');
        
        // Vaciamos el carrito tras enviar (Opcional, lo activamos)
        cart = [];
        syncUserCart(cart);
        updateCartUI();
        cartSidebar.classList.remove('active');
    });

    // Inicializar
    handleLoginState();
    updateProductView();

    // Sync multi-pestaña
    window.addEventListener('storage', (e) => {
        if (e.key === 'duo1913_products') {
            products = getProducts();
            updateProductView();
        }
    });
});
