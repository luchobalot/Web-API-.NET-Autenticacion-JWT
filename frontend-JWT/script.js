// Configuración de la API
const API_BASE_URL = 'http://localhost:5085/api';

// Variables globales
let currentToken = localStorage.getItem('jwtToken') || null;
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Elementos del DOM
const authContainer = document.getElementById('authContainer');
const userPanel = document.getElementById('userPanel');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginFormElement = document.getElementById('loginFormElement');
const registerFormElement = document.getElementById('registerFormElement');
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');
const logoutBtn = document.getElementById('logoutBtn');
const loadProductsBtn = document.getElementById('loadProductsBtn');
const productsContainer = document.getElementById('productsContainer');
const alertContainer = document.getElementById('alertContainer');
const alertMessage = document.getElementById('alertMessage');
const alertClose = document.getElementById('alertClose');
const userName = document.getElementById('userName');
const tokenDisplay = document.getElementById('tokenDisplay');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    if (currentToken && currentUser) {
        showUserPanel();
    } else {
        showAuthContainer();
    }
}

function setupEventListeners() {
    // Alternar entre formularios
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterForm();
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
    });

    // Formularios
    loginFormElement.addEventListener('submit', handleLogin);
    registerFormElement.addEventListener('submit', handleRegister);

    // Botones del panel de usuario
    logoutBtn.addEventListener('click', handleLogout);
    loadProductsBtn.addEventListener('click', loadProducts);

    // Cerrar alerta
    alertClose.addEventListener('click', hideAlert);
}

// Mostrar/ocultar formularios
function showLoginForm() {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
}

function showRegisterForm() {
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    // Intercambiar después de un pequeño delay para animación
    setTimeout(() => {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    }, 100);
}

function showAuthContainer() {
    authContainer.classList.remove('hidden');
    userPanel.classList.add('hidden');
}

function showUserPanel() {
    authContainer.classList.add('hidden');
    userPanel.classList.remove('hidden');
    
    if (currentUser) {
        console.log('Mostrando panel para usuario:', currentUser); // Para debug
        // Priorizar el nombre, usar email solo como último recurso
        const displayName = currentUser.nombre && currentUser.nombre !== currentUser.correo 
            ? currentUser.nombre 
            : currentUser.correo;
        
        userName.textContent = displayName;
        tokenDisplay.textContent = currentToken;
    }
}

// Función para decodificar JWT y extraer información
function parseJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error parsing JWT:', error);
        return null;
    }
}

// Manejo de formularios
async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const loginData = {
        correo: formData.get('correo'),
        clave: formData.get('clave')
    };

    setLoading(e.target, true);

    try {
        const response = await fetch(`${API_BASE_URL}/Acceso/Login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });

        const result = await response.json();
        console.log('Login response:', result); // Para debug

        if (result.isSuccess) {
            currentToken = result.token;
            
            // Crear el objeto de usuario con el nombre de la API
            currentUser = { 
                correo: loginData.correo, 
                nombre: result.nombre || loginData.correo // Usar el nombre de la API, o email como fallback
            };
            
            console.log('Usuario guardado:', currentUser); // Para debug
            
            localStorage.setItem('jwtToken', currentToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showAlert('Login exitoso', 'success');
            showUserPanel();
            e.target.reset();
        } else {
            showAlert('Credenciales incorrectas', 'error');
        }
    } catch (error) {
        console.error('Error en login:', error);
        showAlert('Error de conexión con el servidor. Verifica que la API esté ejecutándose.', 'error');
    } finally {
        setLoading(e.target, false);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const registerData = {
        nombre: formData.get('nombre'),
        correo: formData.get('correo'),
        clave: formData.get('clave')
    };

    setLoading(e.target, true);

    try {
        const response = await fetch(`${API_BASE_URL}/Acceso/Registrarse`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registerData)
        });

        const result = await response.json();
        console.log('Register response:', result); // Para debug

        if (result.isSucces) { // Nota: tu API usa "isSucces" (sin la segunda 's')
            showAlert('Registro exitoso. Ahora puedes iniciar sesión.', 'success');
            showLoginForm();
            e.target.reset();
        } else {
            showAlert('Error en el registro', 'error');
        }
    } catch (error) {
        console.error('Error en registro:', error);
        showAlert('Error de conexión con el servidor. Verifica que la API esté ejecutándose.', 'error');
    } finally {
        setLoading(e.target, false);
    }
}

function handleLogout() {
    currentToken = null;
    currentUser = null;
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('currentUser');
    showAlert('Sesión cerrada correctamente', 'success');
    showAuthContainer();
    productsContainer.innerHTML = '';
}

async function loadProducts() {
    if (!currentToken) {
        showAlert('No tienes un token válido', 'error');
        return;
    }

    setLoading(loadProductsBtn, true);

    try {
        const response = await fetch(`${API_BASE_URL}/Producto/Lista`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json',
            }
        });

        console.log('Products response status:', response.status); // Para debug

        if (response.ok) {
            const result = await response.json();
            console.log('Products data:', result); // Para debug
            displayProducts(result.value);
            showAlert('Productos cargados correctamente', 'success');
        } else if (response.status === 401) {
            showAlert('Token expirado o inválido. Por favor, inicia sesión nuevamente.', 'error');
            handleLogout();
        } else {
            showAlert(`Error al cargar productos (${response.status})`, 'error');
        }
    } catch (error) {
        console.error('Error cargando productos:', error);
        showAlert('Error de conexión con el servidor. Verifica que la API esté ejecutándose.', 'error');
    } finally {
        setLoading(loadProductsBtn, false);
    }
}

function displayProducts(products) {
    productsContainer.innerHTML = '';
    
    if (!products || products.length === 0) {
        productsContainer.innerHTML = '<p>No hay productos disponibles en la base de datos.</p>';
        return;
    }

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <h4>${product.nombre || 'Sin nombre'}</h4>
            <p><strong>Marca:</strong> ${product.marca || 'Sin marca'}</p>
            <p class="product-price"><strong>Precio:</strong> $${product.precio || '0.00'}</p>
        `;
        productsContainer.appendChild(productCard);
    });
}

// Utilidades
function showAlert(message, type = 'error') {
    alertMessage.textContent = message;
    alertContainer.className = `alert ${type}`;
    alertContainer.classList.remove('hidden');
    
    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
        hideAlert();
    }, 5000);
}

function hideAlert() {
    alertContainer.classList.add('hidden');
}

function setLoading(element, loading) {
    if (loading) {
        element.classList.add('loading');
        const submitBtn = element.querySelector('button[type="submit"]') || element;
        submitBtn.disabled = true;
    } else {
        element.classList.remove('loading');
        const submitBtn = element.querySelector('button[type="submit"]') || element;
        submitBtn.disabled = false;
    }
}