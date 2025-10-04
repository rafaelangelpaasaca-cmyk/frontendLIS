import { showLoading, showToast, showConfirm } from '../js/utils/notifications.js';
import { API_BASE_URL } from '../js/config.js';

const GENDERS = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'O', label: 'Otro' }
];

export class PatientsView {
    constructor() {
        this.patients = [];
        this.currentPage = 1;
        this.pageSize = 10;
        this.totalPages = 1;
        this.searchQuery = '';
    }

    async render() {
        return `
            <div class="patients-container">
                <div class="section-header">
                    <h3 class="section-title">
                        <i class="fas fa-user-injured"></i>
                        Gestión de Pacientes
                    </h3>
                    <div class="section-controls">
                        <button class="secondary-btn" id="refresh-patients">
                            <i class="fas fa-sync-alt"></i> Actualizar
                        </button>
                    </div>
                </div>
                
                <div class="patients-dual-panel">
                    <!-- Left Panel - Form -->
                    <div class="patients-left-panel">
                        <div class="panel-header">
                            <h4><i class="fas fa-user-edit"></i> Registrar Nuevo Paciente</h4>
                        </div>
                        
                        <form id="patient-form" class="patients-form">
                            <input type="hidden" id="patient-id">
                            
                            <div class="form-section">
                                <div class="section-title-tiny">
                                    <i class="fas fa-user"></i> Información del Paciente
                                </div>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label for="patient-code">ID Paciente</label>
                                        <div style="display: flex; gap: 4px;">
                                            <input type="text" class="form-input" id="patient-code" readonly>
                                            <button type="button" class="secondary-btn" id="generate-id" style="padding: 8px;">
                                                <i class="fas fa-sync-alt"></i>
                                            </button>
                                            <button type="button" class="secondary-btn" id="scan-id" style="padding: 8px;">
                                                <i class="fas fa-barcode"></i>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="patient-dni">DNI <span class="text-danger">*</span></label>
                                        <input type="text" class="form-input" id="patient-dni" required 
                                               pattern="[0-9]{8}" title="Ingrese un DNI válido (8 dígitos)" 
                                               placeholder="Ej: 12345678">
                                    </div>
                                    
                                    <div class="form-group" style="grid-column: span 2;">
                                        <label for="patient-fullname">Nombres Completos <span class="text-danger">*</span></label>
                                        <input type="text" class="form-input" id="patient-fullname" required
                                               placeholder="Nombres y apellidos">
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="patient-gender">Sexo <span class="text-danger">*</span></label>
                                        <select class="form-input" id="patient-gender" required>
                                            <option value="">Seleccionar...</option>
                                            ${GENDERS.map(gender => 
                                                `<option value="${gender.value}">${gender.label}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="patient-phone">Teléfono</label>
                                        <input type="tel" class="form-input" id="patient-phone"
                                               placeholder="Ej: 999888777">
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="patient-email">Correo Electrónico</label>
                                        <input type="email" class="form-input" id="patient-email"
                                               placeholder="ejemplo@email.com">
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="patient-age">Edad</label>
                                        <input type="number" class="form-input" id="patient-age" 
                                               min="0" max="150" placeholder="Ej: 25">
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="patient-birthdate">Fecha de Nacimiento</label>
                                        <input type="date" class="form-input" id="patient-birthdate">
                                    </div>
                                </div>
                                
                                <div class="form-group" style="margin-top: 8px;">
                                    <label for="patient-address">Dirección</label>
                                    <input type="text" class="form-input" id="patient-address"
                                           placeholder="Dirección completa">
                                </div>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="secondary-btn" id="clear-form">
                                    <i class="fas fa-broom"></i> Limpiar
                                </button>
                                <button type="submit" class="primary-btn" id="save-patient">
                                    <i class="fas fa-save"></i> Registrar Paciente
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    <!-- Right Panel - Patients List -->
                    <div class="patients-right-panel">
                        <div class="panel-header">
                            <h4><i class="fas fa-list"></i> Lista de Pacientes</h4>
                            <div class="panel-search">
                                <input type="text" id="search-patients" class="search-input" 
                                       placeholder="Buscar pacientes...">
                            </div>
                        </div>
                        
                        <div class="patients-list-container">
                            <table class="patients-list-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>DNI</th>
                                        <th>Nombre</th>
                                        <th>Sexo</th>
                                        <th>Teléfono</th>
                                        <th>Edad</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="patients-table-body">
                                    <tr>
                                        <td colspan="7" class="empty-state">
                                            <div class="spinner-border text-primary" role="status">
                                                <span class="visually-hidden">Cargando...</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            
                            <div id="no-patients" class="empty-state" style="display: none;">
                                <div class="empty-icon">👥</div>
                                <h4>No hay pacientes registrados</h4>
                                <p>Comienza agregando un nuevo paciente</p>
                            </div>
                        </div>
                        
                        <!-- Pagination -->
                        <div class="form-actions" style="justify-content: space-between;">
                            <div class="text-muted small">
                                Mostrando <span id="showing-from">0</span> a <span id="showing-to">0</span> de 
                                <span id="total-items">0</span> pacientes
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button class="secondary-btn" id="prev-page" disabled>
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <span class="page-info" style="display: flex; align-items: center; padding: 0 12px;">
                                    Página <span id="current-page">1</span> de <span id="total-pages">1</span>
                                </span>
                                <button class="secondary-btn" id="next-page" disabled>
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async init() {
        // Generate initial patient ID
        this.generatePatientId();
        
        // Set today's date as default for exam date
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('patient-birthdate').max = today;
        
        // Load initial data
        await this.loadPatients();
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    async loadPatients() {
        try {
            // Show loading state
            document.getElementById('patients-table-body').innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                    </td>
                </tr>`;
            
            // In a real app, this would be an API call
            // const response = await fetch(`${API_BASE_URL}/patients?page=${this.currentPage}&limit=${this.pageSize}&search=${encodeURIComponent(this.searchQuery)}`);
            // const data = await response.json();
            
            // Mock data for demonstration
            await new Promise(resolve => setTimeout(resolve, 500));
            const data = {
                items: Array(15).fill().map((_, i) => ({
                    id: `PAT-${1000 + i}`,
                    dni: `7${Math.floor(1000000 + Math.random() * 9000000)}`,
                    fullName: ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Luis Rodríguez', 'Lucía Sánchez', 'Jorge Ramírez', 'Sofía Torres', 'Miguel Díaz', 'Elena Ruiz'][i % 10],
                    gender: ['M', 'F', 'M', 'F', 'M', 'F', 'M', 'F', 'M', 'F'][i % 10],
                    phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
                    email: `paciente${i+1}@example.com`,
                    age: 20 + Math.floor(Math.random() * 50),
                    birthdate: new Date(1980 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
                    address: `Calle ${i + 1} #${Math.floor(Math.random() * 1000)} - ${['Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Piura', 'Cusco', 'Iquitos', 'Tacna', 'Ica', 'Huancayo'][i % 10]}`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                })),
                total: 15,
                page: 1,
                totalPages: 2
            };
            
            this.patients = data.items;
            this.totalPages = data.totalPages;
            this.currentPage = data.page;
            
            this.renderPatientsTable();
            this.updatePagination();
            
        } catch (error) {
            console.error('Error loading patients:', error);
            showToast('Error al cargar los pacientes', 'error');
        }
    }
    
    renderPatientsTable() {
        const tbody = document.getElementById('patients-table-body');
        const noPatients = document.getElementById('no-patients');
        
        if (!this.patients.length) {
            tbody.innerHTML = '';
            if (noPatients) {
                noPatients.style.display = 'flex';
            }
            return;
        }
        
        // Hide no patients message if it's visible
        if (noPatients) {
            noPatients.style.display = 'none';
        }
        
        tbody.innerHTML = this.patients.map(patient => `
            <tr data-id="${patient.id}" class="patient-row">
                <td class="patient-id">${patient.id}</td>
                <td class="patient-dni">${patient.dni || '-'}</td>
                <td class="patient-name">
                    <div class="patient-name-container">
                        <div class="patient-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="patient-info">
                            <div class="patient-fullname">${patient.fullName}</div>
                            ${patient.email ? `<div class="patient-email">${patient.email}</div>` : ''}
                        </div>
                    </div>
                </td>
                <td class="patient-gender">
                    <span class="gender-badge ${patient.gender === 'M' ? 'male' : patient.gender === 'F' ? 'female' : 'other'}">
                        ${GENDERS.find(g => g.value === patient.gender)?.label || patient.gender}
                    </span>
                </td>
                <td class="patient-phone">${patient.phone || '-'}</td>
                <td class="patient-age">${patient.age ? `${patient.age} años` : '-'}</td>
                <td class="patient-actions">
                    <button class="btn-action btn-edit" data-id="${patient.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" data-id="${patient.id}" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        // Add event listeners to action buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleEditPatient(e));
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleDeletePatient(e));
        });
    }
    
    updatePagination() {
        document.getElementById('current-page').textContent = this.currentPage;
        document.getElementById('total-pages').textContent = this.totalPages;
        
        const from = (this.currentPage - 1) * this.pageSize + 1;
        const to = Math.min(from + this.pageSize - 1, this.patients.length);
        
        document.getElementById('showing-from').textContent = from;
        document.getElementById('showing-to').textContent = to;
        document.getElementById('total-items').textContent = this.patients.length;
        
        // Update button states
        document.getElementById('prev-page').disabled = this.currentPage <= 1;
        document.getElementById('next-page').disabled = this.currentPage >= this.totalPages;
    }
    
    generatePatientId() {
        // Generate a simple ID for demo purposes
        const id = 'PAT-' + Math.random().toString(36).substr(2, 6).toUpperCase();
        document.getElementById('patient-code').value = id;
        document.getElementById('patient-id').value = id;
        return id;
    }
    
    setupEventListeners() {
        // Generate ID button
        document.getElementById('generate-id')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.generatePatientId();
            showToast('Nuevo ID generado', 'info');
        });
        
        // Scan ID button (simulated)
        document.getElementById('scan-id')?.addEventListener('click', (e) => {
            e.preventDefault();
            // In a real app, this would trigger a barcode scanner
            showToast('Escaneando ID...', 'info');
            setTimeout(() => {
                const scannedId = 'SCAN-' + Math.random().toString(36).substr(2, 4).toUpperCase();
                document.getElementById('patient-code').value = scannedId;
                document.getElementById('patient-id').value = scannedId;
                showToast('ID escaneado correctamente', 'success');
            }, 1000);
        });
        
        // Clear Form Button
        document.getElementById('clear-form')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.resetForm();
            showToast('Formulario reiniciado', 'info');
        });
        
        // Form Submission
        document.getElementById('patient-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSavePatient();
        });
        
        // Search Input
        const searchInput = document.getElementById('search-patients');
        if (searchInput) {
            let searchTimeout;
            
            // Handle input event
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchQuery = e.target.value.trim();
                    this.currentPage = 1;
                    this.loadPatients();
                }, 500);
            });
            
            // Add clear button functionality (click on the 'x' in the search input)
            searchInput.addEventListener('search', () => {
                this.searchQuery = '';
                this.currentPage = 1;
                this.loadPatients();
            });
            
            // Add keyboard shortcuts for better UX
            searchInput.addEventListener('keydown', (e) => {
                // Clear search on Escape key
                if (e.key === 'Escape' && searchInput.value) {
                    searchInput.value = '';
                    this.searchQuery = '';
                    this.currentPage = 1;
                    this.loadPatients();
                }
            });
        }
        
        // Refresh button
        document.getElementById('refresh-patients')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.currentPage = 1;
            if (searchInput) searchInput.value = '';
            this.searchQuery = '';
            this.loadPatients();
            showToast('Lista de pacientes actualizada', 'info');
        });
        
        // Pagination
        document.getElementById('prev-page')?.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.loadPatients();
                // Scroll to top of the list
                document.querySelector('.patients-list-container').scrollTop = 0;
            }
        });
        
        document.getElementById('next-page')?.addEventListener('click', () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.loadPatients();
                // Scroll to top of the list
                document.querySelector('.patients-list-container').scrollTop = 0;
            }
        });
        
        // Auto-calculate age when birthdate changes
        document.getElementById('patient-birthdate')?.addEventListener('change', (e) => {
            if (e.target.value) {
                const birthDate = new Date(e.target.value);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                
                document.getElementById('patient-age').value = age;
            }
        });
        
        // Auto-fill form when editing
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-edit')) {
                const patientId = e.target.closest('.btn-edit').dataset.id;
                const patient = this.patients.find(p => p.id === patientId);
                if (patient) {
                    this.fillFormForEdit(patient);
                    // Scroll to form
                    document.getElementById('patient-form').scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }
    
    fillFormForEdit(patient) {
        // Fill form for editing
        document.getElementById('patient-id').value = patient.id || '';
        document.getElementById('patient-code').value = patient.id || '';
        document.getElementById('patient-dni').value = patient.dni || '';
        document.getElementById('patient-fullname').value = patient.fullName || '';
        document.getElementById('patient-gender').value = patient.gender || '';
        document.getElementById('patient-phone').value = patient.phone || '';
        document.getElementById('patient-email').value = patient.email || '';
        document.getElementById('patient-age').value = patient.age || '';
        document.getElementById('patient-birthdate').value = patient.birthdate || '';
        document.getElementById('patient-address').value = patient.address || '';
        
        // Update button text and scroll to form
        const saveBtn = document.getElementById('save-patient');
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Paciente';
        
        // Scroll to form
        document.getElementById('patient-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Focus on the first field for better UX
        document.getElementById('patient-dni').focus();
    }
    
    hidePatientForm() {
        document.getElementById('patient-form-container').classList.add('d-none');
        this.resetForm();
    }
    
    resetForm() {
        const form = document.getElementById('patient-form');
        if (form) {
            form.reset();
            this.generatePatientId();
            document.getElementById('save-patient').innerHTML = '<i class="fas fa-save"></i> Registrar Paciente';
            
            // Set focus to DNI field for better UX
            setTimeout(() => {
                document.getElementById('patient-dni').focus();
            }, 100);
        }
    }
    
    getFormData() {
        return {
            id: document.getElementById('patient-id').value || null,
            dni: document.getElementById('patient-dni').value.trim(),
            fullName: document.getElementById('patient-fullname').value.trim(),
            gender: document.getElementById('patient-gender').value,
            phone: document.getElementById('patient-phone').value.trim(),
            email: document.getElementById('patient-email').value.trim(),
            age: parseInt(document.getElementById('patient-age').value) || null,
            birthdate: document.getElementById('patient-birthdate').value,
            address: document.getElementById('patient-address').value.trim(),
            updatedAt: new Date().toISOString()
        };
    }
    
    validateForm(data) {
        // Validate DNI (if provided, it must be 8 digits)
        if (data.dni && (data.dni.length !== 8 || !/^\d+$/.test(data.dni))) {
            showToast('El DNI debe tener 8 dígitos numéricos', 'error');
            document.getElementById('patient-dni').focus();
            return false;
        }
        
        // Full name is required and must be at least 3 characters
        if (!data.fullName || data.fullName.trim().length < 3) {
            showToast('El nombre completo debe tener al menos 3 caracteres', 'error');
            document.getElementById('patient-fullname').focus();
            return false;
        }
        
        // Gender is required
        if (!data.gender) {
            showToast('Por favor seleccione el sexo del paciente', 'error');
            document.getElementById('patient-gender').focus();
            return false;
        }
        
        // Validate email format if provided
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            showToast('Por favor ingrese un correo electrónico válido', 'error');
            document.getElementById('patient-email').focus();
            return false;
        }
        
        // Validate phone number if provided
        if (data.phone && !/^[0-9+\-\s()]{6,20}$/.test(data.phone)) {
            showToast('Por favor ingrese un número de teléfono válido', 'error');
            document.getElementById('patient-phone').focus();
            return false;
        }
        
        // Validate age if provided
        if (data.age && (isNaN(data.age) || data.age < 0 || data.age > 120)) {
            showToast('La edad debe estar entre 0 y 120 años', 'error');
            document.getElementById('patient-age').focus();
            return false;
        }
        
        return true;
    }
    
    async handleSavePatient() {
        const formData = this.getFormData();
        
        if (!this.validateForm(formData)) {
            return;
        }
        
        try {
            showLoading(true, 'Guardando paciente...');
            
            // Simulate API call with delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const isNew = !formData.id;
            let message = '';
            
            if (isNew) {
                // Add creation date for new patients
                formData.createdAt = new Date().toISOString();
                this.patients.unshift(formData);
                message = 'Paciente registrado exitosamente';
            } else {
                // Update existing patient
                const index = this.patients.findIndex(p => p.id === formData.id);
                if (index !== -1) {
                    // Preserve creation date when updating
                    formData.createdAt = this.patients[index].createdAt;
                    this.patients[index] = formData;
                    message = 'Paciente actualizado exitosamente';
                } else {
                    throw new Error('Paciente no encontrado');
                }
            }
            
            // Show success message
            showToast(message, 'success');
            
            // Update UI and reset form
            await this.loadPatients();
            this.resetForm();
            
            // If this was an update, scroll back to the top of the list
            if (!isNew) {
                document.querySelector('.patients-list-container').scrollTop = 0;
            }
            
        } catch (error) {
            console.error('Error saving patient:', error);
            showToast(error.message || 'Error al guardar el paciente', 'error');
        } finally {
            showLoading(false);
        }
    }
    
    async handleEditPatient(event) {
        const patientId = event.currentTarget.getAttribute('data-id');
        const patient = this.patients.find(p => p.id === patientId);
        
        if (patient) {
            this.showPatientForm(patient);
        }
    }
    
    async handleDeletePatient(event) {
        const patientId = event.currentTarget.getAttribute('data-id');
        const patient = this.patients.find(p => p.id === patientId);
        
        if (!patient) {
            showToast('Paciente no encontrado', 'error');
            return;
        }
        
        try {
            const confirmed = await showConfirm(
                'Eliminar Paciente',
                `¿Está seguro de eliminar al paciente <strong>${patient.fullName}</strong>?<br>Esta acción no se puede deshacer.`,
                'Eliminar',
                'Cancelar',
                'error'
            );
            
            if (!confirmed) return;
            
            showLoading(true, 'Eliminando paciente...');
            
            // Simulate API call with delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Store the current page before deletion
            const currentPageBeforeDeletion = this.currentPage;
            
            // Remove patient from the array
            const initialLength = this.patients.length;
            this.patients = this.patients.filter(p => p.id !== patientId);
            
            if (this.patients.length === initialLength) {
                throw new Error('No se pudo eliminar el paciente');
            }
            
            // If we're on a page that would now be empty, go back one page
            const startIndex = (this.currentPage - 1) * this.pageSize;
            if (startIndex >= this.patients.length && this.currentPage > 1) {
                this.currentPage--;
            }
            
            // If we were on the first page and deleted the last item, stay on the first page
            if (this.patients.length === 0) {
                this.currentPage = 1;
            }
            
            // Update UI
            await this.loadPatients();
            
            // If we were on the first page and deleted the last item, reset the form
            if (this.patients.length === 0) {
                this.resetForm();
            }
            
            showToast('Paciente eliminado exitosamente', 'success');
            
        } catch (error) {
            console.error('Error deleting patient:', error);
            showToast(error.message || 'Error al eliminar el paciente', 'error');
        } finally {
            showLoading(false);
        }
    }
}
