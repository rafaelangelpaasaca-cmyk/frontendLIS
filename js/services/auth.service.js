import { API_BASE_URL } from '../config.js';

export class AuthService {
    constructor() {
        this.tokenKey = 'lis_auth_token';
        this.userKey = 'lis_user';
    }

    async login(email, password) {
        try {
            // In a real app, this would be an API call to your backend
            // const response = await fetch(`${API_BASE_URL}/auth/login`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ email, password })
            // });
            // const data = await response.json();
            
            // Mock response for demo purposes
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Simulate successful login
            const mockUser = {
                id: 'user-123',
                email: email,
                name: email.split('@')[0],
                role: 'lab_technician'
            };
            
            const mockToken = 'mock-jwt-token';
            
            this.setToken(mockToken);
            this.setCurrentUser(mockUser);
            
            return mockUser;
        } catch (error) {
            console.error('Login failed:', error);
            throw new Error('Error de autenticación. Por favor, intente nuevamente.');
        }
    }

    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        window.location.href = '#';
    }

    isAuthenticated() {
        return !!this.getToken();
    }

    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    setToken(token) {
        if (token) {
            localStorage.setItem(this.tokenKey, token);
        }
    }

    getCurrentUser() {
        const userJson = localStorage.getItem(this.userKey);
        return userJson ? JSON.parse(userJson) : null;
    }

    setCurrentUser(user) {
        if (user) {
            localStorage.setItem(this.userKey, JSON.stringify(user));
        }
    }

    // In a real app, this would validate the token with the backend
    async validateSession() {
        const token = this.getToken();
        if (!token) return false;
        
        // Mock validation
        return new Promise(resolve => {
            setTimeout(() => resolve(true), 500);
        });
    }
}
