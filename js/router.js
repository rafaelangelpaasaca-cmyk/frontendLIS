import { DashboardView } from '../views/dashboard.view.js';
import { PatientsView } from '../views/patients.view.js';
import { OrdersView } from '../views/orders.view.js';
import { ResultsView } from '../views/results.view.js';

export class Router {
    constructor(authService) {
        this.routes = {
            'dashboard': new DashboardView(),
            'patients': new PatientsView(),
            'orders': new OrdersView(),
            'results': new ResultsView()
        };
        this.authService = authService;
        this.contentElement = document.getElementById('content');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Handle browser back/forward
        window.addEventListener('popstate', () => this.handleRouteChange());
        
        // Handle route links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-route]');
            if (link) {
                e.preventDefault();
                const route = link.getAttribute('data-route');
                this.navigate(route);
            }
        });
    }

    async navigate(route, addToHistory = true) {
        if (!this.authService.isAuthenticated() && route !== 'login') {
            window.location.hash = '';
            return;
        }

        // Update URL
        const path = `#${route}`;
        if (addToHistory) {
            window.history.pushState({}, '', path);
        }

        await this.loadView(route);
    }

    async handleRouteChange() {
        const path = window.location.hash.replace('#', '') || 'dashboard';
        await this.loadView(path, false);
    }

    async loadView(route, showLoading = true) {
        const view = this.routes[route] || this.routes['dashboard'];
        
        try {
            if (showLoading) {
                this.contentElement.innerHTML = `
                    <div class="spinner-container">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                    </div>`;
            }
            
            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.toggle('active', link.getAttribute('data-route') === route);
            });

            // Load view content
            const content = await view.render();
            this.contentElement.innerHTML = content;
            
            // Initialize view if needed
            if (typeof view.init === 'function') {
                await view.init();
            }
        } catch (error) {
            console.error(`Error loading view ${route}:`, error);
            this.contentElement.innerHTML = `
                <div class="alert alert-danger">
                    <h4>Error al cargar la página</h4>
                    <p>${error.message || 'Ha ocurrido un error inesperado'}</p>
                    <button class="btn btn-primary" onclick="router.navigate('dashboard')">Volver al inicio</button>
                </div>`;
        }
    }
}
