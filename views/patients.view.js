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
            <div class="container-fluid">
                <h2 class="mb-4"><i class="fas fa-user-injured me-2"></i>Gestión de Pacientes</h2>
                
                <!-- Patient Form -->
                <div class="card mb-4">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0"><i class="fas fa-user-edit me-2"></i>Registrar Nuevo Paciente</h5>
                    </div>
                    <div class="card-body">
                        <form id="patient-form">
                            <input type="hidden" id="patient-id">
                            
                            <div class="row g-3">
                                <div class="col-md-2">
                                    <div class="mb-3">
                                        <label for="patient-code" class="form-label">ID Paciente</label>
                                        <div class="input-group">
                                            <input type="text" class="form-control" id="patient-code" readonly>
                                            <button class="btn btn-outline-secondary" type="button" id="generate-id">
                                                <i class="fas fa-sync-alt"></i>
                                            </button>
                                            <button class="btn btn-outline-secondary" type="button" id="scan-id">
                                                <i class="fas fa-barcode"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="col-md-2">
                                    <div class="mb-3">
                                        <label for="patient-dni" class="form-label">DNI <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" id="patient-dni" required 
                                               pattern="[0-9]{8}" title="Ingrese un DNI válido (8 dígitos)">
                                    </div>
                                </div>
                                
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label for="patient-fullname" class="form-label">Nombres Completos <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" id="patient-fullname" required>
                                    </div>
                                </div>
                                
                                <div class="col-md-2">
                                    <div class="mb-3">
                                        <label for="patient-gender" class="form-label">Sexo <span class="text-danger">*</span></label>
                                        <select class="form-select" id="patient-gender" required>
                                            <option value="">Seleccione...</option>
                                            ${GENDERS.map(gender => 
                                                `<option value="${gender.value}">${gender.label}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="col-md-2">
                                    <div class="mb-3">
                                        <label for="patient-phone" class="form-label">Teléfono</label>
                                        <input type="tel" class="form-control" id="patient-phone">
                                    </div>
                                </div>
                                
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label for="patient-email" class="form-label">Correo Electrónico</label>
                                        <input type="email" class="form-control" id="patient-email">
                                    </div>
                                </div>
                                
                                <div class="col-md-2">
                                    <div class="mb-3">
                                        <label for="patient-age" class="form-label">Edad</label>
                                        <input type="number" class="form-control" id="patient-age" min="0" max="150">
                                    </div>
                                </div>
                                
                                <div class="col-md-3">
                                    <div class="mb-3">
                                        <label for="patient-birthdate" class="form-label">Fecha de Nacimiento</label>
                                        <input type="date" class="form-control" id="patient-birthdate">
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="patient-address" class="form-label">Dirección</label>
                                        <input type="text" class="form-control" id="patient-address">
                                    </div>
                                </div>
                                
                                <div class="col-12">
                                    <hr>
                                    <div class="d-flex justify-content-end gap-2">
                                        <button type="button" class="btn btn-danger" id="clear-form">
                                            <i class="fas fa-broom me-1"></i> Limpiar
                                        </button>
                                        <button type="submit" class="btn btn-primary" id="save-patient">
                                            <i class="fas fa-save me-1"></i> Registrar Paciente
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                
                <!-- Patients List -->
                <div class="card">
                    <div class="card-header bg-light d-flex justify-content-between align-items-center">
                        <h5 class="mb-0"><i class="fas fa-list me-2"></i>Lista de Pacientes</h5>
                        <div class="input-group" style="width: 300px;">
                            <span class="input-group-text">
                                <i class="fas fa-search"></i>
                            </span>
                            <input type="text" id="search-patients" class="form-control" placeholder="Buscar pacientes...">
                            <button id="clear-search" class="btn btn-outline-secondary" type="button">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>DNI</th>
                                        <th>Nombre Completo</th>
                                        <th>Sexo</th>
                                        <th>Teléfono</th>
                                        <th>Edad</th>
                                        <th class="text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="patients-table-body">
                                    <tr>
                                        <td colspan="7" class="text-center py-4">
                                            <div class="spinner-border text-primary" role="status">
                                                <span class="visually-hidden">Cargando...</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Pagination -->
                        <nav class="p-3 border-top" aria-label="Pagination">
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="text-muted small">
                                    Mostrando <span id="showing-from">0</span> a <span id="showing-to">0</span> de <span id="total-items">0</span> pacientes
                                </div>
                                <ul class="pagination mb-0">
                                    <li class="page-item">
                                        <button class="page-link" id="prev-page" disabled>
                                            <i class="fas fa-chevron-left"></i>
                                        </button>
                                    </li>
                                    <li class="page-item">
                                        <span class="page-link">
                                            Página <span id="current-page">1</span> de <span id="total-pages">1</span>
                                        </span>
                                    </li>
                                    <li class="page-item">
                                        <button class="page-link" id="next-page" disabled>
                                            <i class="fas fa-chevron-right"></i>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </nav>
                    </div>
                </div>
            </div>
        `;
    }

    async init() {
        // Generate initial patient ID
        this.generatePatientId();
        
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
        
        if (!this.patients.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <i class="fas fa-inbox me-2"></i> No se encontraron pacientes
                    </td>
                </tr>`;
            return;
        }
        
        tbody.innerHTML = this.patients.map(patient => `
            <tr data-id="${patient.id}">
                <td>${patient.id}</td>
                <td>${patient.dni}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="avatar-sm me-2">
                            <div class="avatar-title bg-soft-primary text-primary rounded-circle">
                                <i class="fas fa-user"></i>
                            </div>
                        </div>
                        <div>
                            <h6 class="mb-0">${patient.fullName}</h6>
                            <small class="text-muted">${patient.email}</small>
                        </div>
                    </div>
                </td>
                <td>${GENDERS.find(g => g.value === patient.gender)?.label || patient.gender}</td>
                <td>${patient.phone || '-'}</td>
                <td>${patient.age} años</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary btn-edit" data-id="${patient.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${patient.id}" title="Eliminar">
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
        document.getElementById('generate-id')?.addEventListener('click', () => {
            this.generatePatientId();
        });
        
        // Scan ID button (simulated)
        document.getElementById('scan-id')?.addEventListener('click', () => {
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
        document.getElementById('clear-form')?.addEventListener('click', () => {
            this.resetForm();
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
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchQuery = e.target.value.trim();
                    this.currentPage = 1;
                    this.loadPatients();
                }, 500);
            });
        }
        
        // Clear Search Button
        document.getElementById('clear-search')?.addEventListener('click', () => {
            searchInput.value = '';
            this.searchQuery = '';
            this.currentPage = 1;
            this.loadPatients();
        });
        
        // Pagination
        document.getElementById('prev-page')?.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.loadPatients();
            }
        });
        
        document.getElementById('next-page')?.addEventListener('click', () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.loadPatients();
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
        
        // Update button text
        document.getElementById('save-patient').innerHTML = '<i class="fas fa-save me-1"></i> Actualizar Paciente';
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
            document.getElementById('save-patient').innerHTML = '<i class="fas fa-save me-1"></i> Registrar Paciente';
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
        if (!data.dni || data.dni.length !== 8) {
            showToast('El DNI debe tener 8 dígitos', 'error');
            return false;
        }
        
        if (!data.fullName) {
            showToast('El nombre completo es requerido', 'error');
            return false;
        }
        
        if (!data.gender) {
            showToast('Por favor seleccione el sexo', 'error');
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
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const isNew = !formData.id;
            
            if (isNew) {
                // Add new patient
                formData.id = document.getElementById('patient-id').value;
                formData.createdAt = new Date().toISOString();
                this.patients.unshift(formData);
                showToast('Paciente registrado exitosamente', 'success');
            } else {
                // Update existing patient
                const index = this.patients.findIndex(p => p.id === formData.id);
                if (index !== -1) {
                    this.patients[index] = { ...this.patients[index], ...formData };
                    showToast('Paciente actualizado exitosamente', 'success');
                }
            }
            
            // Update UI
            this.renderPatientsTable();
            this.resetForm();
            
        } catch (error) {
            console.error('Error saving patient:', error);
            showToast('Error al guardar el paciente', 'error');
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
        
        if (!patient) return;
        
        const confirmed = await showConfirm(
            `¿Está seguro de eliminar al paciente ${patient.fullName}?`,
            'Eliminar Paciente'
        );
        
        if (!confirmed) return;
        
        try {
            showLoading(true, 'Eliminando paciente...');
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Remove from local array
            this.patients = this.patients.filter(p => p.id !== patientId);
            
            // Update UI
            this.renderPatientsTable();
            showToast('Paciente eliminado exitosamente', 'success');
            
        } catch (error) {
            console.error('Error deleting patient:', error);
            showToast('Error al eliminar el paciente', 'error');
        } finally {
            showLoading(false);
        }
    }
}
