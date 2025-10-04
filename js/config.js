// API Configuration
export const API_BASE_URL = 'http://localhost:8080/api';

// Application configuration
export const APP_CONFIG = {
    appName: 'Sistema LIS',
    version: '1.0.0',
    defaultPageSize: 10,
    dateFormat: 'DD/MM/YYYY',
    dateTimeFormat: 'DD/MM/YYYY HH:mm',
    
    // API Endpoints (example)
    endpoints: {
        auth: {
            login: '/auth/login',
            logout: '/auth/logout',
            refresh: '/auth/refresh'
        },
        patients: {
            list: '/patients',
            create: '/patients',
            get: (id) => `/patients/${id}`,
            update: (id) => `/patients/${id}`,
            delete: (id) => `/patients/${id}`,
            search: '/patients/search'
        },
        orders: {
            list: '/orders',
            create: '/orders',
            get: (id) => `/orders/${id}`,
            update: (id) => `/orders/${id}`,
            delete: (id) => `/orders/${id}`,
            byPatient: (patientId) => `/patients/${patientId}/orders`
        },
        results: {
            list: '/results',
            create: '/results',
            get: (id) => `/results/${id}`,
            update: (id) => `/results/${id}`,
            delete: (id) => `/results/${id}`,
            byOrder: (orderId) => `/orders/${orderId}/results`
        }
    },
    
    // UI Configuration
    ui: {
        theme: {
            primaryColor: '#0d6efd',
            secondaryColor: '#6c757d',
            successColor: '#198754',
            dangerColor: '#dc3545',
            warningColor: '#ffc107',
            infoColor: '#0dcaf0'
        },
        pagination: {
            defaultPageSize: 10,
            pageSizes: [5, 10, 25, 50, 100]
        },
        dateFormats: {
            short: 'DD/MM/YYYY',
            medium: 'DD MMM YYYY',
            long: 'dddd, D MMMM YYYY',
            time: 'HH:mm',
            dateTime: 'DD/MM/YYYY HH:mm'
        }
    },
    
    // Feature flags
    features: {
        advancedSearch: true,
        exportToPdf: true,
        exportToExcel: true,
        notifications: true,
        auditLog: true
    },
    
    // Local storage keys
    storageKeys: {
        authToken: 'lis_auth_token',
        userData: 'lis_user_data',
        preferences: 'lis_user_prefs',
        recentPatients: 'lis_recent_patients'
    }
};

// Export default for backward compatibility
export default {
    API_BASE_URL,
    APP_CONFIG
};
