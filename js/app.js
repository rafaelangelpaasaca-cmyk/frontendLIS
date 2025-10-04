// Main Application Module
import { Router } from './router.js';
import { AuthService } from './services/auth.service.js';
import { showToast } from './utils/notifications.js';

// Initialize services
const authService = new AuthService();
const router = new Router(authService);

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const appContainer = document.getElementById('app');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const userEmailSpan = document.getElementById('user-email');

// Check authentication state on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    setupEventListeners();
});

function checkAuthState() {
    const token = authService.getToken();
    if (token) {
        showApp();
        router.navigate('dashboard');
    } else {
        showLogin();
    }
}

function setupEventListeners() {
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                await authService.login(email, password);
                showApp();
                showToast('Inicio de sesión exitoso', 'success');
                router.navigate('dashboard');
            } catch (error) {
                showToast('Credenciales inválidas', 'error');
                console.error('Login error:', error);
            }
        });
    }

    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            authService.logout();
            showLogin();
            showToast('Sesión cerrada correctamente', 'info');
        });
    }
}

function showApp() {
    loginScreen.classList.add('d-none');
    appContainer.classList.remove('d-none');
    const user = authService.getCurrentUser();
    if (user && userEmailSpan) {
        userEmailSpan.textContent = user.email;
    }
}

function showLogin() {
    loginScreen.classList.remove('d-none');
    appContainer.classList.add('d-none');
    if (loginForm) {
        loginForm.reset();
    }
}

// Make router available globally for debugging
window.router = router;
