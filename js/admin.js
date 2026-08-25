// js/admin.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginScreen = document.getElementById('loginScreen');
    const adminPanel = document.getElementById('adminPanel');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if(sessionStorage.getItem('duoAdminLogged')) showAdmin();

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;
        
        if(user === 'admin' && pass === 'admin123') {
            sessionStorage.setItem('duoAdminLogged', 'true');
            showAdmin();
        } else {
            document.getElementById('loginError').style.display = 'block';
        }
    });

    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('duoAdminLogged');
        location.reload(); 
    });

    function showAdmin() {
        loginScreen.style.display = 'none';
        adminPanel.style.display = 'block';
        initAdminData();
    }

    // ---------------- UI NOTIFICATIONS ---------------- //
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

    /* ================= CRUD PANEL ================= */
    let products = [];
    const tableBody = document.getElementById('adminTableBody');
    const form = document.getElementById('productForm');
    
    function initAdminData() {
        initData(); 
        products = getProducts();
        renderTable();
    }

    function renderTable() {
        tableBody.innerHTML = '';
        products.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${p.image}" alt="${p.name}"></td>
                <td>${p.name}</td>
                <td>$${p.price.toLocaleString('es-AR')}</td>
                <td><span class="badge">${p.category}</span></td>
                <td>${p.stock}</td>
                <td>
                    <button class="btn-small btn-edit" onclick="editProduct(${p.id})">Editar</button>
                    <button class="btn-small btn-delete" onclick="deleteProduct(${p.id})">Eliminar</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const saveBtn = document.getElementById('saveBtn');
        saveBtn.textContent = 'Guardando...';
        saveBtn.disabled = true;

        const idInput = document.getElementById('productId').value;
        const fileInput = document.getElementById('prodImageFile');
        const urlInput = document.getElementById('prodImage');
        
        let finalImageUrl = urlInput.value;

        // Si se subió un archivo, lo procesamos
        if (fileInput.files && fileInput.files[0]) {
            try {
                // Usamos la función de data.js para comprimir y pasar a base64
                finalImageUrl = await resizeImageFile(fileInput.files[0]);
            } catch (error) {
                showToast('Error al procesar la imagen', 'error');
                saveBtn.textContent = 'Guardar Producto';
                saveBtn.disabled = false;
                return;
            }
        } else if (!finalImageUrl) {
            showToast('Debes proveer una URL o subir una imagen', 'error');
            saveBtn.textContent = 'Guardar Producto';
            saveBtn.disabled = false;
            return;
        }

        const productData = {
            id: idInput ? parseInt(idInput) : generateId(),
            name: document.getElementById('prodName').value,
            price: parseFloat(document.getElementById('prodPrice').value),
            category: document.getElementById('prodCategory').value,
            stock: parseInt(document.getElementById('prodStock').value),
            image: finalImageUrl,
            description: document.getElementById('prodDesc').value
        };

        if(idInput) {
            const index = products.findIndex(p => p.id === parseInt(idInput));
            if(index !== -1) products[index] = productData;
            showToast('Producto actualizado correctamente');
        } else {
            products.push(productData);
            showToast('Producto agregado correctamente');
        }

        saveProducts(products);
        renderTable();
        resetForm();
        
        saveBtn.textContent = 'Guardar Producto';
        saveBtn.disabled = false;
    });

    window.editProduct = (id) => {
        const prod = products.find(p => p.id === id);
        if(!prod) return;

        document.getElementById('formTitle').textContent = 'Editar Producto';
        document.getElementById('productId').value = prod.id;
        document.getElementById('prodName').value = prod.name;
        document.getElementById('prodPrice').value = prod.price;
        document.getElementById('prodCategory').value = prod.category;
        document.getElementById('prodStock').value = prod.stock;
        
        // Limpiamos ambos inputs de imagen pero mostramos la URL si es string corto, sino dejamos vacío
        document.getElementById('prodImage').value = prod.image.length < 500 ? prod.image : ''; 
        document.getElementById('prodImageFile').value = '';
        
        document.getElementById('prodDesc').value = prod.description;
        document.getElementById('cancelBtn').style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    };

    window.deleteProduct = (id) => {
        if(confirm('¿Estás seguro de eliminar este producto?')) {
            products = products.filter(p => p.id !== id);
            saveProducts(products);
            renderTable();
            showToast('Producto eliminado');
        }
    };

    document.getElementById('cancelBtn').addEventListener('click', resetForm);

    function resetForm() {
        form.reset();
        document.getElementById('productId').value = '';
        document.getElementById('prodImageFile').value = '';
        document.getElementById('formTitle').textContent = 'Agregar Producto';
        document.getElementById('cancelBtn').style.display = 'none';
    }
});
