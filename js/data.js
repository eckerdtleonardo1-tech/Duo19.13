// js/data.js

const DEFAULT_PRODUCTS = [
  { 
    id: 1, 
    name: "Teclado Mecánico RGB Pro", 
    price: 120000, 
    category: "perifericos", 
    stock: 15, 
    image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80", 
    description: "Teclado mecánico con switches red, iluminación RGB personalizable por tecla y estructura de aluminio." 
  },
  { 
    id: 2, 
    name: "Mouse Gamer Inalámbrico", 
    price: 85000, 
    category: "perifericos", 
    stock: 10, 
    image: "https://images.unsplash.com/photo-1615663245857-ac1eeb536fcb?w=500&q=80", 
    description: "Alta precisión, sensor óptico de 16000 DPI, batería de larga duración y diseño ergonómico." 
  },
  { 
    id: 3, 
    name: "Tira LED Inteligente 5m", 
    price: 30000, 
    category: "iluminacion", 
    stock: 50, 
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&q=80", 
    description: "Tira LED RGB sincronizable con música, controlable por app y comandos de voz." 
  }
];

function initData() {
  if (!localStorage.getItem('duo1913_products')) {
    localStorage.setItem('duo1913_products', JSON.stringify(DEFAULT_PRODUCTS));
  }
}

function getProducts() {
  return JSON.parse(localStorage.getItem('duo1913_products')) || [];
}

function saveProducts(products) {
  localStorage.setItem('duo1913_products', JSON.stringify(products));
}

function generateId() {
  return Date.now();
}

/**
 * Función para redimensionar imágenes subidas y convertirlas a Base64
 * Esto permite guardar imágenes reales en LocalStorage sin ocupar los 5MB de límite rápido.
 */
function resizeImageFile(file, maxWidth = 800, maxHeight = 800) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7)); // Comprimir a JPEG 70% calidad
            };
            img.src = e.target.result;
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}
