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

// Inicialización con animaciones
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
    setupEventListeners();
    createParticleAnimation();
});

function initializeApp() {
    setTimeout(() => {
        if (currentToken && currentUser) {
            showUserPanel();
        } else {
            showAuthContainer();
        }
    }, 100);
}

function setupEventListeners() {
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchToRegisterForm();
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchToLoginForm();
    });

    loginFormElement.addEventListener('submit', handleLogin);
    registerFormElement.addEventListener('submit', handleRegister);

    logoutBtn.addEventListener('click', handleLogout);
    loadProductsBtn.addEventListener('click', loadProducts);

    alertClose.addEventListener('click', hideAlert);

    setupInputAnimations();

    document.addEventListener('click', (e) => {
        if (!alertContainer.contains(e.target) && !alertContainer.classList.contains('hidden')) {
            hideAlert();
        }
    });
}

function setupInputAnimations() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.closest('.input-wrapper').classList.add('focused');
        });

        input.addEventListener('blur', function () {
            if (!this.value) {
                this.closest('.input-wrapper').classList.remove('focused');
            }
        });

        input.addEventListener('input', function () {
            if (this.value) {
                this.closest('.input-wrapper').classList.add('has-value');
            } else {
                this.closest('.input-wrapper').classList.remove('has-value');
            }
        });
    });
}

// Cambio de formularios
function switchToRegisterForm() {
    loginForm.classList.remove('active');
    setTimeout(() => {
        registerForm.classList.add('active', 'fade-in-up');
    }, 300);
}

function switchToLoginForm() {
    registerForm.classList.remove('active');
    setTimeout(() => {
        loginForm.classList.add('active', 'fade-in-up');
    }, 300);
}

// Mostrar/Ocultar paneles
function showUserPanel() {
    authContainer.style.display = 'none';
    userPanel.classList.add('show');
    userName.textContent = currentUser?.nombre || '';
    tokenDisplay.textContent = currentToken || '';
}

function showAuthContainer() {
    userPanel.classList.remove('show');
    authContainer.style.display = 'block';
    loginForm.classList.add('active');
}

// Manejo de Login
async function handleLogin(e) {
    e.preventDefault();
    const btn = loginFormElement.querySelector('button');
    toggleLoading(btn, true);

    const data = {
        correo: document.getElementById('loginCorreo').value,
        clave: document.getElementById('loginClave').value
    };

    try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error('Credenciales incorrectas');
        const result = await res.json();

        currentToken = result.token;
        currentUser = result.user;

        localStorage.setItem('jwtToken', currentToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        showAlert('Inicio de sesión exitoso', 'success');
        showUserPanel();
    } catch (err) {
        showAlert(err.message, 'error');
    } finally {
        toggleLoading(btn, false);
    }
}

// Manejo de Registro
async function handleRegister(e) {
    e.preventDefault();
    const btn = registerFormElement.querySelector('button');
    toggleLoading(btn, true);

    const data = {
        nombre: document.getElementById('registerNombre').value,
        correo: document.getElementById('registerCorreo').value,
        clave: document.getElementById('registerClave').value
    };

    try {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error('Error al registrarse');
        await res.json();

        showAlert('Registro exitoso, ahora puedes iniciar sesión', 'success');
        switchToLoginForm();
    } catch (err) {
        showAlert(err.message, 'error');
    } finally {
        toggleLoading(btn, false);
    }
}

// Logout
function handleLogout() {
    currentToken = null;
    currentUser = null;
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('currentUser');
    showAuthContainer();
    showAlert('Sesión cerrada', 'success');
}

// Cargar productos
async function loadProducts() {
    try {
        const res = await fetch(`${API_BASE_URL}/productos`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });

        if (!res.ok) throw new Error('Error al cargar productos');
        const productos = await res.json();

        productsContainer.innerHTML = '';
        productos.forEach(p => {
            const card = document.createElement('div');
            card.className = 'product-card fade-in-up';
            card.innerHTML = `
                <h4>${p.nombre}</h4>
                <p>${p.descripcion}</p>
                <p class="product-price">$${p.precio}</p>
            `;
            productsContainer.appendChild(card);
        });
    } catch (err) {
        showAlert(err.message, 'error');
    }
}

// Alertas
function showAlert(message, type = 'success') {
    alertMessage.textContent = message;
    alertContainer.classList.remove('hidden', 'success', 'error');
    alertContainer.classList.add('show', type);

    setTimeout(() => {
        hideAlert();
    }, 4000);
}

function hideAlert() {
    alertContainer.classList.remove('show');
    setTimeout(() => alertContainer.classList.add('hidden'), 300);
}

// Loader botones
function toggleLoading(button, loading) {
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// Animación partículas extra (opcional)
function createParticleAnimation() {
    // Partículas ya están en el HTML, esto es placeholder si querés expandir
}
