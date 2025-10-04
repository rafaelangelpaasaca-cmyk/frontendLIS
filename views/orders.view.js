import { showLoading, showToast, showConfirm } from '../js/utils/notifications.js';
import { API_BASE_URL } from '../js/config.js';

export class OrdersView {
    constructor() {
        this.orders = [];
        this.patients = [];
        this.tests = [];
        this.currentPage = 1;
        this.pageSize = 10;
        this.totalPages = 1;
        this.searchQuery = '';
    }

    async render() {
        return `
            <div class="container-fluid">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2>Órdenes de Laboratorio</h2>
                    <button id="new-order-btn" class="btn btn-primary">
                        <i class="fas fa-plus me-2"></i>Nueva Orden
                    </button>
                </div>
                
                <!-- Search and Filters -->
                <div class="card mb-4">
                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-md-4">
                                <div class="input-group">
                                    <span class="input-group-text">
                                        <i class="fas fa-search"></i>
                                    </span>
                                    <input type="text" id="search-orders" class="form-control" placeholder="Buscar órdenes...">
                                    <button id="clear-search" class="btn btn-outline-secondary" type="button">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="col-md-2">
                                <select id="filter-status" class="form-select">
                                    <option value="">Todos los estados</option>
                                    <option value="pending">Pendiente</option>
                                    <option value="in-progress">En Progreso</option>
                                    <option value="completed">Completado</option>
                                    <option value="cancelled">Cancelado</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <select id="filter-patient" class="form-select">
                                    <option value="">Todos los pacientes</option>
                                    <!-- Patient options will be populated by JavaScript -->
                                </select>
                            </div>
                            <div class="col-md-3">
                                <div class="input-group">
                                    <input type="date" id="filter-date" class="form-control">
                                    <button id="clear-date" class="btn btn-outline-secondary" type="button">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Orders Table -->
                <div class="card">
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th># Orden</th>
                                        <th>Paciente</th>
                                        <th>Fecha</th>
                                        <th>Exámenes</th>
                                        <th>Médico</th>
                                        <th>Estado</th>
                                        <th class="text-end">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="orders-table-body">
                                    <tr>
                                        <td colspan="7" class="text-center py-5">
                                            <div class="spinner-border text-primary" role="status">
                                                <span class="visually-hidden">Cargando...</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Pagination -->
                        <div class="d-flex justify-content-between align-items-center p-3 border-top">
                            <div class="text-muted" id="pagination-info">
                                Mostrando <span id="start-item">0</span> a <span id="end-item">0</span> de <span id="total-items">0</span> órdenes
                            </div>
                            <nav aria-label="Page navigation">
                                <ul class="pagination mb-0" id="pagination">
                                    <!-- Pagination will be generated by JavaScript -->
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Order Modal -->
            <div class="modal fade" id="orderModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="orderModalLabel">Nueva Orden</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form id="order-form">
                            <div class="modal-body">
                                <input type="hidden" id="order-id">
                                
                                <div class="row mb-4">
                                    <div class="col-md-6">
                                        <div class="card h-100">
                                            <div class="card-header bg-light">
                                                <h6 class="mb-0">Información del Paciente</h6>
                                            </div>
                                            <div class="card-body">
                                                <div class="mb-3">
                                                    <label for="patient-search" class="form-label">Buscar Paciente <span class="text-danger">*</span></label>
                                                    <div class="input-group">
                                                        <input type="text" class="form-control" id="patient-search" placeholder="Nombre, documento o ID de paciente" required>
                                                        <button class="btn btn-outline-secondary" type="button" id="search-patient-btn">
                                                            <i class="fas fa-search"></i>
                                                        </button>
                                                    </div>
                                                    <div id="patient-search-results" class="mt-2 d-none">
                                                        <!-- Patient search results will be displayed here -->
                                                    </div>
                                                </div>
                                                
                                                <div id="patient-info" class="d-none">
                                                    <div class="d-flex align-items-center mb-3">
                                                        <div class="patient-avatar me-3">
                                                            <span id="patient-initials">JD</span>
                                                        </div>
                                                        <div>
                                                            <h6 class="mb-0" id="patient-name">Juan David Pérez</h6>
                                                            <div class="text-muted small">
                                                                <span id="patient-document">CC 10.123.456</span> • 
                                                                <span id="patient-age">35 años</span> • 
                                                                <span id="patient-gender">Masculino</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="row g-2 small">
                                                        <div class="col-6">
                                                            <div><i class="fas fa-phone-alt me-2"></i> <span id="patient-phone">+57 300 123 4567</span></div>
                                                        </div>
                                                        <div class="col-6">
                                                            <div><i class="fas fa-envelope me-2"></i> <span id="patient-email">juan.perez@example.com</span></div>
                                                        </div>
                                                        <div class="col-12">
                                                            <div><i class="fas fa-map-marker-alt me-2"></i> <span id="patient-address">Calle 123 #45-67, Bogotá</span></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div id="no-patient-selected" class="text-center py-4">
                                                    <i class="fas fa-user-circle fa-3x text-muted mb-2"></i>
                                                    <p class="text-muted mb-0">Busque y seleccione un paciente</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="card h-100">
                                            <div class="card-header bg-light">
                                                <h6 class="mb-0">Información de la Orden</h6>
                                            </div>
                                            <div class="card-body">
                                                <div class="row g-3">
                                                    <div class="col-md-6">
                                                        <label for="order-date" class="form-label">Fecha de la Orden <span class="text-danger">*</span></label>
                                                        <input type="datetime-local" class="form-control" id="order-date" required>
                                                    </div>
                                                    <div class="col-md-6">
                                                        <label for="priority" class="form-label">Prioridad <span class="text-danger">*</span></label>
                                                        <select class="form-select" id="priority" required>
                                                            <option value="routine">Rutinaria</option>
                                                            <option value="urgent">Urgente</option>
                                                            <option value="emergency">Emergencia</option>
                                                        </select>
                                                    </div>
                                                    <div class="col-12">
                                                        <label for="ordering-physician" class="form-label">Médico Ordenante <span class="text-danger">*</span></label>
                                                        <input type="text" class="form-control" id="ordering-physician" required>
                                                    </div>
                                                    <div class="col-12">
                                                        <label for="clinical-notes" class="form-label">Notas Clínicas</label>
                                                        <textarea class="form-control" id="clinical-notes" rows="3" placeholder="Síntomas, diagnóstico presuntivo, etc."></textarea>
                                                    </div>
                                                    <div class="col-12">
                                                        <label for="diagnosis-code" class="form-label">Código de Diagnóstico (CIE-10)</label>
                                                        <input type="text" class="form-control" id="diagnosis-code" placeholder="Ej: E11.9">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Tests Selection -->
                                <div class="card mb-4">
                                    <div class="card-header bg-light d-flex justify-content-between align-items-center">
                                        <h6 class="mb-0">Exámenes Solicitados</h6>
                                        <button type="button" class="btn btn-sm btn-outline-primary" id="add-test-btn">
                                            <i class="fas fa-plus me-1"></i> Agregar Examen
                                        </button>
                                    </div>
                                    <div class="card-body">
                                        <div class="table-responsive">
                                            <table class="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th width="5%">#</th>
                                                        <th width="45%">Examen</th>
                                                        <th width="30%">Instrucciones Especiales</th>
                                                        <th width="15%" class="text-center">Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="selected-tests">
                                                    <tr>
                                                        <td colspan="4" class="text-center py-3 text-muted">
                                                            No se han agregado exámenes
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Billing Information -->
                                <div class="card mb-0">
                                    <div class="card-header bg-light">
                                        <h6 class="mb-0">Información de Facturación</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="row g-3">
                                            <div class="col-md-4">
                                                <label for="billing-type" class="form-label">Tipo de Facturación <span class="text-danger">*</span></label>
                                                <select class="form-select" id="billing-type" required>
                                                    <option value="">Seleccionar...</option>
                                                    <option value="cash">Pago en Efectivo</option>
                                                    <option value="insurance">Seguro Médico</option>
                                                    <option value="credit">Crédito</option>
                                                    <option value="agreement">Convenio</option>
                                                </select>
                                            </div>
                                            <div class="col-md-4 insurance-fields d-none">
                                                <label for="insurance-company" class="form-label">Aseguradora</label>
                                                <select class="form-select" id="insurance-company">
                                                    <option value="">Seleccionar...</option>
                                                    <option value="sura">SURA</option>
                                                    <option value="nueva-eps">Nueva EPS</option>
                                                    <option value="sanitas">Sanitas</option>
                                                    <option value="savia-salud">Savia Salud</option>
                                                    <option value="coomeva">Coomeva</option>
                                                    <option value="otros">Otra</option>
                                                </select>
                                            </div>
                                            <div class="col-md-4 insurance-fields d-none">
                                                <label for="policy-number" class="form-label">Número de Póliza</label>
                                                <input type="text" class="form-control" id="policy-number">
                                            </div>
                                            <div class="col-md-4">
                                                <label for="total-amount" class="form-label">Valor Total</label>
                                                <div class="input-group">
                                                    <span class="input-group-text">$</span>
                                                    <input type="number" class="form-control text-end" id="total-amount" value="0" readonly>
                                                </div>
                                            </div>
                                            <div class="col-md-8">
                                                <label for="billing-notes" class="form-label">Notas de Facturación</label>
                                                <input type="text" class="form-control" id="billing-notes" placeholder="Información adicional para facturación">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" class="btn btn-primary" id="save-order">Guardar Orden</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            
            <!-- Add Test Modal -->
            <div class="modal fade" id="addTestModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Agregar Examen</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label for="test-category" class="form-label">Categoría</label>
                                <select class="form-select" id="test-category">
                                    <option value="">Todas las categorías</option>
                                    <option value="hematology">Hematología</option>
                                    <option value="chemistry">Química Clínica</option>
                                    <option value="microbiology">Microbiología</option>
                                    <option value="immunology">Inmunología</option>
                                    <option value="urinalysis">Uroanálisis</option>
                                    <option value="coagulation">Coagulación</option>
                                    <option value="hormones">Hormonas</option>
                                    <option value="tumor-markers">Marcadores Tumorales</option>
                                </select>
                            </div>
                            
                            <div class="mb-3">
                                <label for="test-search" class="form-label">Buscar Examen</label>
                                <input type="text" class="form-control" id="test-search" placeholder="Nombre del examen o código">
                            </div>
                            
                            <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
                                <table class="table table-sm table-hover">
                                    <thead class="sticky-top bg-white">
                                        <tr>
                                            <th width="10%">Código</th>
                                            <th width="60%">Nombre</th>
                                            <th width="20%">Categoría</th>
                                            <th width="10%" class="text-center">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody id="available-tests">
                                        <!-- Available tests will be listed here -->
                                    </tbody>
                                </table>
                            </div>
                            
                            <div id="selected-test-details" class="mt-4 d-none">
                                <h6>Detalles del Examen</h6>
                                <div class="card">
                                    <div class="card-body">
                                        <h6 id="selected-test-name"></h6>
                                        <p class="text-muted mb-2" id="selected-test-description"></p>
                                        <div class="row">
                                            <div class="col-md-6">
                                                <small class="d-block"><strong>Categoría:</strong> <span id="selected-test-category"></span></small>
                                                <small class="d-block"><strong>Método:</strong> <span id="selected-test-method"></span></small>
                                            </div>
                                            <div class="col-md-6">
                                                <small class="d-block"><strong>Tiempo de Entrega:</strong> <span id="selected-test-delivery"></span></small>
                                                <small class="d-block"><strong>Precio:</strong> $<span id="selected-test-price">0</span></small>
                                            </div>
                                        </div>
                                        
                                        <div class="mt-3">
                                            <label for="test-instructions" class="form-label small">Instrucciones Especiales</label>
                                            <textarea class="form-control form-control-sm" id="test-instructions" rows="2" placeholder="Instrucciones adicionales para este examen"></textarea>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="d-flex justify-content-end mt-3">
                                    <button type="button" class="btn btn-sm btn-outline-secondary me-2" id="cancel-test-selection">
                                        Cancelar
                                    </button>
                                    <button type="button" class="btn btn-sm btn-primary" id="add-selected-test">
                                        <i class="fas fa-plus me-1"></i> Agregar Examen
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                .patient-avatar {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background-color: #e9ecef;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    color: #6c757d;
                    font-size: 1.25rem;
                }
                .status-badge {
                    padding: 0.35em 0.65em;
                    font-size: 0.75em;
                    font-weight: 600;
                    border-radius: 0.25rem;
                }
                .status-pending { background-color: #fff3cd; color: #664d03; }
                .status-in-progress { background-color: #cfe2ff; color: #084298; }
                .status-completed { background-color: #d1e7dd; color: #0f5132; }
                .status-cancelled { background-color: #f8d7da; color: #842029; }
                .action-btn {
                    width: 32px;
                    height: 32px;
                    padding: 0;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 2px;
                }
                .test-item {
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .test-item:hover {
                    background-color: #f8f9fa;
                }
                .test-item.active {
                    background-color: #e7f1ff;
                }
                .test-category-badge {
                    font-size: 0.7rem;
                    padding: 0.25em 0.5em;
                    border-radius: 0.25rem;
                    background-color: #e9ecef;
                    color: #495057;
                }
                .test-category-hematology { background-color: #e7f5ff; color: #1864ab; }
                .test-category-chemistry { background-color: #e3fafc; color: #0b7285; }
                .test-category-microbiology { background-color: #fff0f6; color: #a61e4d; }
                .test-category-immunology { background-color: #f3f0ff; color: #5f3dc4; }
                .test-category-urinalysis { background-color: #fff9db; color: #e67700; }
                .test-category-coagulation { background-color: #fff5f5; color: #c92a2a; }
                .test-category-hormones { background-color: #f8f0fc; color: #862e9c; }
                .test-category-tumor-markers { background-color: #e6fcf5; color: #087f5b; }
            </style>
        `;
    }

    async init() {
        // Load initial data
        await this.loadOrders();
        await this.loadPatientsForFilter();
        this.setupEventListeners();
    }
    
    async loadOrders(page = 1, search = '') {
        showLoading(true, 'Cargando órdenes...');
        
        try {
            // In a real app, this would be an API call
            // const response = await fetch(`${API_BASE_URL}/orders?page=${page}&search=${encodeURIComponent(search)}`);
            // const data = await response.json();
            
            // Simulate API call with timeout
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Mock data
            const mockOrders = this.generateMockOrders(35);
            this.orders = mockOrders;
            this.currentPage = page;
            this.pageSize = 10;
            this.totalPages = Math.ceil(this.orders.length / this.pageSize);
            
            this.renderOrdersTable();
            this.renderPagination();
        } catch (error) {
            console.error('Error loading orders:', error);
            showToast('Error al cargar las órdenes', 'error');
        } finally {
            showLoading(false);
        }
    }
    
    async loadPatientsForFilter() {
        try {
            // In a real app, this would be an API call to get patients
            // For now, we'll use the first 10 patients from our mock data
            const mockPatients = this.generateMockPatients(10);
            this.patients = mockPatients;
            
            // Populate patient filter dropdown
            const patientSelect = document.getElementById('filter-patient');
            if (patientSelect) {
                // Keep the first option ("Todos los pacientes")
                patientSelect.innerHTML = '<option value="">Todos los pacientes</option>';
                
                // Add patient options
                mockPatients.forEach(patient => {
                    const option = document.createElement('option');
                    option.value = patient.id;
                    option.textContent = `${patient.firstName} ${patient.lastName} (${patient.documentNumber})`;
                    patientSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading patients for filter:', error);
        }
    }
    
    generateMockOrders(count) {
        const statuses = ['pending', 'in-progress', 'completed', 'cancelled'];
        const priorities = ['routine', 'urgent', 'emergency'];
        const tests = [
            { id: 'HEMO', name: 'Hemograma Completo', category: 'Hematología', price: 25000 },
            { id: 'GLUC', name: 'Glucosa en Ayunas', category: 'Química Clínica', price: 15000 },
            { id: 'CREA', name: 'Creatinina', category: 'Química Clínica', price: 18000 },
            { id: 'URIN', name: 'Uroanálisis Completo', category: 'Uroanálisis', price: 22000 },
            { id: 'TGO', name: 'TGO (AST)', category: 'Química Clínica', price: 15000 },
            { id: 'TGP', name: 'TGP (ALT)', category: 'Química Clínica', price: 15000 },
            { id: 'TSH', name: 'Hormona Estimulante de Tiroides', category: 'Hormonas', price: 35000 },
            { id: 'PSA', name: 'Antígeno Prostático Específico', category: 'Marcadores Tumorales', price: 45000 },
            { id: 'HEPB', name: 'Prueba de Hepatitis B', category: 'Inmunología', price: 55000 },
            { id: 'HEPC', name: 'Prueba de Hepatitis C', category: 'Inmunología', price: 55000 },
            { id: 'HEMO', name: 'Hemoglobina Glicosilada', category: 'Hematología', price: 28000 },
            { id: 'LIPI', name: 'Perfil Lipídico', category: 'Química Clínica', price: 32000 },
            { id: 'COAG', name: 'Tiempo de Protrombina', category: 'Coagulación', price: 25000 },
            { id: 'CULT', name: 'Urocultivo', category: 'Microbiología', price: 40000 },
            { id: 'VITD', name: 'Vitamina D', category: 'Hormonas', price: 60000 }
        ];
        
        const orders = [];
        const mockPatients = this.generateMockPatients(count);
        
        for (let i = 1; i <= count; i++) {
            const orderDate = new Date();
            orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));
            
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const priority = priorities[Math.floor(Math.random() * priorities.length)];
            
            // Select random patient
            const patient = mockPatients[i - 1];
            
            // Select 1-4 random tests
            const selectedTests = [];
            const numTests = Math.min(Math.ceil(Math.random() * 4), tests.length);
            const testIndices = [];
            
            while (testIndices.length < numTests) {
                const randomIndex = Math.floor(Math.random() * tests.length);
                if (!testIndices.includes(randomIndex)) {
                    testIndices.push(randomIndex);
                    selectedTests.push({
                        ...tests[randomIndex],
                        instructions: Math.random() > 0.7 ? 'Muestra en ayunas' : ''
                    });
                }
            }
            
            // Calculate total amount
            const totalAmount = selectedTests.reduce((sum, test) => sum + test.price, 0);
            
            orders.push({
                id: `ORD-${1000 + i}`,
                patientId: patient.id,
                patientName: `${patient.firstName} ${patient.lastName}`,
                patientDocument: patient.documentNumber,
                orderDate: orderDate.toISOString(),
                status,
                priority,
                physician: `Dr. ${['García', 'Martínez', 'Rodríguez', 'López', 'González'][Math.floor(Math.random() * 5)]}`,
                tests: selectedTests,
                totalAmount,
                billingType: ['cash', 'insurance', 'credit', 'agreement'][Math.floor(Math.random() * 4)],
                insuranceCompany: ['sura', 'nueva-eps', 'sanitas', 'savia-salud', 'coomeva'][Math.floor(Math.random() * 5)],
                policyNumber: Math.random() > 0.3 ? `POL-${Math.floor(100000 + Math.random() * 900000)}` : '',
                clinicalNotes: Math.random() > 0.5 ? 'Paciente con dolor abdominal y fiebre' : '',
                diagnosisCode: Math.random() > 0.5 ? 'R10.9' : 'E11.9',
                createdAt: orderDate.toISOString(),
                updatedAt: orderDate.toISOString()
            });
        }
        
        // Sort by date (newest first)
        return orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    }
    
    generateMockPatients(count) {
        const firstNames = ['Juan', 'María', 'Carlos', 'Ana', 'Pedro', 'Laura', 'Jorge', 'Sofía', 'Andrés', 'Camila'];
        const lastNames = ['González', 'Rodríguez', 'Gómez', 'López', 'Martínez', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores'];
        const cities = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Pereira', 'Manizales', 'Armenia', 'Pasto'];
        
        const patients = [];
        
        for (let i = 1; i <= count; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = `${lastNames[Math.floor(Math.random() * lastNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
            const documentNumber = Math.floor(10000000 + Math.random() * 90000000);
            const city = cities[Math.floor(Math.random() * cities.length)];
            const phone = `+57 3${Math.floor(1000000 + Math.random() * 9000000)}`;
            const email = `${firstName.toLowerCase()}.${lastName.split(' ')[0].toLowerCase()}@example.com`;
            
            // Generate a random date of birth between 18 and 90 years ago
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - Math.floor(18 + Math.random() * 72));
            birthDate.setMonth(Math.floor(Math.random() * 12));
            birthDate.setDate(Math.floor(Math.random() * 28) + 1);
            
            patients.push({
                id: `PAT-${1000 + i}`,
                firstName,
                lastName,
                documentType: 'CC',
                documentNumber: documentNumber.toString(),
                birthDate: birthDate.toISOString().split('T')[0],
                gender: Math.random() > 0.5 ? 'M' : 'F',
                bloodType: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'][Math.floor(Math.random() * 8)],
                email,
                phone,
                address: `Calle ${Math.floor(Math.random() * 100) + 1} #${Math.floor(Math.random() * 100) + 1}-${Math.floor(Math.random() * 100)}`,
                city,
                status: 'active'
            });
        }
        
        return patients;
    }
    
    renderOrdersTable() {
        const tbody = document.getElementById('orders-table-body');
        if (!tbody) return;
        
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const paginatedOrders = this.orders.slice(start, end);
        
        if (paginatedOrders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-5">
                        <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                        <p class="mb-0">No se encontraron órdenes</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = paginatedOrders.map(order => {
            const statusClass = {
                'pending': 'status-pending',
                'in-progress': 'status-in-progress',
                'completed': 'status-completed',
                'cancelled': 'status-cancelled'
            }[order.status] || '';
            
            const statusText = {
                'pending': 'Pendiente',
                'in-progress': 'En Progreso',
                'completed': 'Completado',
                'cancelled': 'Cancelado'
            }[order.status] || order.status;
            
            const priorityIcon = {
                'routine': '<i class="fas fa-flag text-muted"></i>',
                'urgent': '<i class="fas fa-flag text-warning"></i>',
                'emergency': '<i class="fas fa-flag text-danger"></i>'
            }[order.priority] || '';
            
            return `
                <tr>
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="me-2">${priorityIcon}</div>
                            <div>
                                <div class="fw-medium">${order.id}</div>
                                <small class="text-muted">${this.formatDate(order.orderDate)}</small>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="fw-medium">${order.patientName}</div>
                        <small class="text-muted">${order.patientDocument}</small>
                    </td>
                    <td>${this.formatDate(order.orderDate, true)}</td>
                    <td>
                        <div class="d-flex flex-wrap gap-1">
                            ${order.tests.slice(0, 2).map(test => `
                                <span class="badge bg-light text-dark">${test.name}</span>
                            `).join('')}
                            ${order.tests.length > 2 ? `
                                <span class="badge bg-light text-dark">+${order.tests.length - 2} más</span>
                            ` : ''}
                        </div>
                    </td>
                    <td>${order.physician}</td>
                    <td>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary action-btn view-order" data-id="${order.id}" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary action-btn edit-order" data-id="${order.id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${order.status !== 'cancelled' ? `
                            <button class="btn btn-sm btn-outline-danger action-btn cancel-order" data-id="${order.id}" title="Cancelar">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join('');
        
        // Update pagination info
        document.getElementById('start-item').textContent = Math.min(start + 1, this.orders.length);
        document.getElementById('end-item').textContent = Math.min(end, this.orders.length);
        document.getElementById('total-items').textContent = this.orders.length;
    }
    
    renderPagination() {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;
        
        pagination.innerHTML = '';
        
        // Previous button
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${this.currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `
            <a class="page-link" href="#" aria-label="Anterior" data-page="${this.currentPage - 1}">
                <span aria-hidden="true">&laquo;</span>
            </a>
        `;
        pagination.appendChild(prevLi);
        
        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        if (startPage > 1) {
            const firstLi = document.createElement('li');
            firstLi.className = 'page-item';
            firstLi.innerHTML = '<a class="page-link" href="#" data-page="1">1</a>';
            pagination.appendChild(firstLi);
            
            if (startPage > 2) {
                const ellipsisLi = document.createElement('li');
                ellipsisLi.className = 'page-item disabled';
                ellipsisLi.innerHTML = '<span class="page-link">...</span>';
                pagination.appendChild(ellipsisLi);
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === this.currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
            pagination.appendChild(li);
        }
        
        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                const ellipsisLi = document.createElement('li');
                ellipsisLi.className = 'page-item disabled';
                ellipsisLi.innerHTML = '<span class="page-link">...</span>';
                pagination.appendChild(ellipsisLi);
            }
            
            const lastLi = document.createElement('li');
            lastLi.className = 'page-item';
            lastLi.innerHTML = `<a class="page-link" href="#" data-page="${this.totalPages}">${this.totalPages}</a>`;
            pagination.appendChild(lastLi);
        }
        
        // Next button
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${this.currentPage === this.totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `
            <a class="page-link" href="#" aria-label="Siguiente" data-page="${this.currentPage + 1}">
                <span aria-hidden="true">&raquo;</span>
            </a>
        `;
        pagination.appendChild(nextLi);
    }
    
    setupEventListeners() {
        // New order button
        document.getElementById('new-order-btn')?.addEventListener('click', () => {
            this.showOrderModal();
        });
        
        // Search input
        const searchInput = document.getElementById('search-orders');
        let searchTimeout;
        
        searchInput?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchQuery = e.target.value;
                this.loadOrders(1, this.searchQuery);
            }, 500);
        });
        
        // Clear search button
        document.getElementById('clear-search')?.addEventListener('click', () => {
            searchInput.value = '';
            this.searchQuery = '';
            this.loadOrders(1, '');
        });
        
        // Filter by status
        document.getElementById('filter-status')?.addEventListener('change', (e) => {
            // In a real app, this would filter the orders
            console.log('Filter by status:', e.target.value);
        });
        
        // Filter by patient
        document.getElementById('filter-patient')?.addEventListener('change', (e) => {
            // In a real app, this would filter the orders by patient
            console.log('Filter by patient:', e.target.value);
        });
        
        // Filter by date
        document.getElementById('filter-date')?.addEventListener('change', (e) => {
            // In a real app, this would filter the orders by date
            console.log('Filter by date:', e.target.value);
        });
        
        // Clear date filter
        document.getElementById('clear-date')?.addEventListener('click', () => {
            const dateInput = document.getElementById('filter-date');
            if (dateInput) {
                dateInput.value = '';
                // In a real app, this would clear the date filter
                console.log('Clear date filter');
            }
        });
        
        // Pagination click handler
        document.getElementById('pagination')?.addEventListener('click', (e) => {
            e.preventDefault();
            const pageLink = e.target.closest('.page-link');
            if (!pageLink) return;
            
            const page = parseInt(pageLink.getAttribute('data-page'));
            if (!isNaN(page) && page >= 1 && page <= this.totalPages && page !== this.currentPage) {
                this.loadOrders(page, this.searchQuery);
            }
        });
        
        // Order form submission
        document.getElementById('order-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveOrder();
        });
        
        // Billing type change
        document.getElementById('billing-type')?.addEventListener('change', (e) => {
            const insuranceFields = document.querySelectorAll('.insurance-fields');
            if (e.target.value === 'insurance') {
                insuranceFields.forEach(field => field.classList.remove('d-none'));
            } else {
                insuranceFields.forEach(field => field.classList.add('d-none'));
            }
        });
        
        // Add test button
        document.getElementById('add-test-btn')?.addEventListener('click', () => {
            this.showAddTestModal();
        });
        
        // Search patient button
        document.getElementById('search-patient-btn')?.addEventListener('click', () => {
            this.searchPatient();
        });
        
        // Patient search input
        document.getElementById('patient-search')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.searchPatient();
            }
        });
        
        // Delegate events for action buttons
        document.getElementById('orders-table-body')?.addEventListener('click', (e) => {
            const target = e.target.closest('.view-order, .edit-order, .cancel-order');
            if (!target) return;
            
            const orderId = target.getAttribute('data-id');
            
            if (target.classList.contains('view-order')) {
                this.viewOrder(orderId);
            } else if (target.classList.contains('edit-order')) {
                this.editOrder(orderId);
            } else if (target.classList.contains('cancel-order')) {
                this.cancelOrder(orderId);
            }
        });
    }
    
    showOrderModal(order = null) {
        const modal = new bootstrap.Modal(document.getElementById('orderModal'));
        const form = document.getElementById('order-form');
        const modalTitle = document.getElementById('orderModalLabel');
        
        // Reset form
        form.reset();
        
        // Reset patient info
        document.getElementById('patient-info').classList.add('d-none');
        document.getElementById('no-patient-selected').classList.remove('d-none');
        
        // Reset tests list
        document.getElementById('selected-tests').innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-3 text-muted">
                    No se han agregado exámenes
                </td>
            </tr>
        `;
        
        // Reset total amount
        document.getElementById('total-amount').value = '0';
        
        // Hide insurance fields by default
        document.querySelectorAll('.insurance-fields').forEach(field => {
            field.classList.add('d-none');
        });
        
        if (order) {
            // Edit mode
            modalTitle.textContent = 'Editar Orden';
            document.getElementById('order-id').value = order.id;
            
            // Set order date to current date and time
            const now = new Date();
            const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            document.getElementById('order-date').value = localDateTime;
            
            // Set priority
            document.getElementById('priority').value = order.priority || 'routine';
            
            // Set physician
            if (order.physician) {
                document.getElementById('ordering-physician').value = order.physician;
            }
            
            // Set clinical notes
            if (order.clinicalNotes) {
                document.getElementById('clinical-notes').value = order.clinicalNotes;
            }
            
            // Set diagnosis code
            if (order.diagnosisCode) {
                document.getElementById('diagnosis-code').value = order.diagnosisCode;
            }
            
            // Set billing information
            if (order.billingType) {
                document.getElementById('billing-type').value = order.billingType;
                
                if (order.billingType === 'insurance') {
                    document.querySelectorAll('.insurance-fields').forEach(field => {
                        field.classList.remove('d-none');
                    });
                    
                    if (order.insuranceCompany) {
                        document.getElementById('insurance-company').value = order.insuranceCompany;
                    }
                    
                    if (order.policyNumber) {
                        document.getElementById('policy-number').value = order.policyNumber;
                    }
                }
            }
            
            // Set billing notes if any
            if (order.billingNotes) {
                document.getElementById('billing-notes').value = order.billingNotes;
            }
            
            // Update total amount
            if (order.totalAmount) {
                document.getElementById('total-amount').value = order.totalAmount.toLocaleString();
            }
            
            // In a real app, we would load the patient data and tests here
            // For now, we'll just show a message
            console.log('Loading order data for editing:', order);
        } else {
            // New order mode
            modalTitle.textContent = 'Nueva Orden';
            document.getElementById('order-id').value = '';
            
            // Set order date to current date and time
            const now = new Date();
            const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            document.getElementById('order-date').value = localDateTime;
            
            // Set default priority
            document.getElementById('priority').value = 'routine';
            
            // Clear other fields
            document.getElementById('ordering-physician').value = '';
            document.getElementById('clinical-notes').value = '';
            document.getElementById('diagnosis-code').value = '';
            document.getElementById('billing-type').value = 'cash';
            document.getElementById('insurance-company').value = '';
            document.getElementById('policy-number').value = '';
            document.getElementById('billing-notes').value = '';
            document.getElementById('total-amount').value = '0';
        }
        
        modal.show();
    }
    
    showAddTestModal() {
        const modal = new bootstrap.Modal(document.getElementById('addTestModal'));
        
        // Reset test search
        document.getElementById('test-search').value = '';
        document.getElementById('test-category').value = '';
        
        // Load available tests
        this.loadAvailableTests();
        
        // Hide test details initially
        document.getElementById('selected-test-details').classList.add('d-none');
        
        modal.show();
    }
    
    loadAvailableTests() {
        const availableTests = [
            { id: 'HEMO', name: 'Hemograma Completo', category: 'Hematología', method: 'Automático', delivery: '24 horas', price: 25000, description: 'Evaluación de células sanguíneas, incluyendo glóbulos rojos, blancos y plaquetas.' },
            { id: 'GLUC', name: 'Glucosa en Ayunas', category: 'Química Clínica', method: 'Enzimático', delivery: '4 horas', price: 15000, description: 'Nivel de glucosa en sangre después de un ayuno de 8-12 horas.' },
            { id: 'CREA', name: 'Creatinina', category: 'Química Clínica', method: 'Cinético', delivery: '4 horas', price: 18000, description: 'Evaluación de la función renal.' },
            { id: 'URIN', name: 'Uroanálisis Completo', category: 'Uroanálisis', method: 'Tira Reactiva/Microscopía', delivery: '24 horas', price: 22000, description: 'Análisis físico, químico y microscópico de la orina.' },
            { id: 'TGO', name: 'TGO (AST)', category: 'Química Clínica', method: 'Cinético UV', delivery: '24 horas', price: 15000, description: 'Aspartato aminotransferasa, enzima hepática.' },
            { id: 'TGP', name: 'TGP (ALT)', category: 'Química Clínica', method: 'Cinético UV', delivery: '24 horas', price: 15000, description: 'Alanina aminotransferasa, enzima hepática.' },
            { id: 'TSH', name: 'Hormona Estimulante de Tiroides', category: 'Hormonas', method: 'Quimioluminiscencia', delivery: '48 horas', price: 35000, description: 'Evaluación de la función tiroidea.' },
            { id: 'PSA', name: 'Antígeno Prostático Específico', category: 'Marcadores Tumorales', method: 'Quimioluminiscencia', delivery: '48 horas', price: 45000, description: 'Marcador para detección de cáncer de próstata.' },
            { id: 'HEPB', name: 'Prueba de Hepatitis B', category: 'Inmunología', method: 'ELISA', delivery: '72 horas', price: 55000, description: 'Detección de antígenos y anticuerpos del virus de la hepatitis B.' },
            { id: 'HEPC', name: 'Prueba de Hepatitis C', category: 'Inmunología', method: 'ELISA', delivery: '72 horas', price: 55000, description: 'Detección de anticuerpos contra el virus de la hepatitis C.' },
            { id: 'HEMO', name: 'Hemoglobina Glicosilada', category: 'Hematología', method: 'Cromatografía líquida', delivery: '48 horas', price: 28000, description: 'Nivel promedio de glucosa en sangre de los últimos 2-3 meses.' },
            { id: 'LIPI', name: 'Perfil Lipídico', category: 'Química Clínica', method: 'Enzimático colorimétrico', delivery: '24 horas', price: 32000, description: 'Colesterol total, HDL, LDL y triglicéridos.' },
            { id: 'COAG', name: 'Tiempo de Protrombina', category: 'Coagulación', method: 'Coagulometría', delivery: '24 horas', price: 25000, description: 'Evaluación de la vía extrínseca de la coagulación.' },
            { id: 'CULT', name: 'Urocultivo', category: 'Microbiología', method: 'Cultivo', delivery: '3-5 días', price: 40000, description: 'Cultivo de orina para detección de infecciones bacterianas.' },
            { id: 'VITD', name: 'Vitamina D', category: 'Hormonas', method: 'Quimioluminiscencia', delivery: '72 horas', price: 60000, description: 'Niveles de 25-hidroxivitamina D en suero.' }
        ];
        
        const tbody = document.getElementById('available-tests');
        if (!tbody) return;
        
        tbody.innerHTML = availableTests.map(test => {
            const categoryClass = `test-category-${test.category.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;
            
            return `
                <tr class="test-item" data-test-id="${test.id}">
                    <td><span class="badge bg-light text-dark">${test.id}</span></td>
                    <td>${test.name}</td>
                    <td><span class="test-category-badge ${categoryClass}">${test.category}</span></td>
                    <td class="text-center">
                        <button type="button" class="btn btn-sm btn-outline-primary select-test">
                            <i class="fas fa-plus"></i> Seleccionar
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Add event listeners to test items
        document.querySelectorAll('.test-item').forEach(row => {
            row.addEventListener('click', (e) => {
                if (!e.target.closest('.select-test')) {
                    // If not clicking the select button, just highlight the row
                    document.querySelectorAll('.test-item').forEach(r => r.classList.remove('active'));
                    row.classList.add('active');
                    
                    // Show test details
                    const testId = row.getAttribute('data-test-id');
                    const test = availableTests.find(t => t.id === testId);
                    
                    if (test) {
                        document.getElementById('selected-test-name').textContent = test.name;
                        document.getElementById('selected-test-description').textContent = test.description;
                        document.getElementById('selected-test-category').textContent = test.category;
                        document.getElementById('selected-test-method').textContent = test.method;
                        document.getElementById('selected-test-delivery').textContent = test.delivery;
                        document.getElementById('selected-test-price').textContent = test.price.toLocaleString();
                        
                        // Show the test details section
                        document.getElementById('selected-test-details').classList.remove('d-none');
                        
                        // Scroll to bottom to show details
                        document.getElementById('selected-test-details').scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });
        
        // Add event listeners to select buttons
        document.querySelectorAll('.select-test').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const row = button.closest('.test-item');
                const testId = row.getAttribute('data-test-id');
                const test = availableTests.find(t => t.id === testId);
                
                if (test) {
                    this.addTestToOrder(test);
                    
                    // Close the modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById('addTestModal'));
                    if (modal) modal.hide();
                }
            });
        });
        
        // Search test functionality
        const testSearch = document.getElementById('test-search');
        const testCategory = document.getElementById('test-category');
        
        const filterTests = () => {
            const searchTerm = testSearch.value.toLowerCase();
            const categoryFilter = testCategory.value;
            
            document.querySelectorAll('.test-item').forEach(row => {
                const testId = row.getAttribute('data-test-id');
                const test = availableTests.find(t => t.id === testId);
                
                const matchesSearch = test.name.toLowerCase().includes(searchTerm) || 
                                    test.id.toLowerCase().includes(searchTerm);
                
                const matchesCategory = !categoryFilter || test.category === categoryFilter;
                
                if (matchesSearch && matchesCategory) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        };
        
        testSearch?.addEventListener('input', filterTests);
        testCategory?.addEventListener('change', filterTests);
        
        // Cancel test selection
        document.getElementById('cancel-test-selection')?.addEventListener('click', () => {
            document.getElementById('selected-test-details').classList.add('d-none');
            document.querySelectorAll('.test-item').forEach(r => r.classList.remove('active'));
        });
    }
    
    addTestToOrder(test) {
        const tbody = document.getElementById('selected-tests');
        if (!tbody) return;
        
        // Check if test is already added
        const existingTest = tbody.querySelector(`tr[data-test-id="${test.id}"]`);
        if (existingTest) {
            showToast('Este examen ya ha sido agregado a la orden', 'warning');
            return;
        }
        
        // If this is the first test, remove the "no tests" message
        if (tbody.querySelector('td.text-muted')) {
            tbody.innerHTML = '';
        }
        
        // Add the test to the table
        const row = document.createElement('tr');
        row.setAttribute('data-test-id', test.id);
        
        const categoryClass = `test-category-${test.category.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;
        
        row.innerHTML = `
            <td>${test.id}</td>
            <td>
                <div class="fw-medium">${test.name}</div>
                <div class="small">
                    <span class="test-category-badge ${categoryClass}">${test.category}</span>
                </div>
            </td>
            <td>
                <input type="text" class="form-control form-control-sm test-instructions" 
                       placeholder="Instrucciones especiales" value="${test.instructions || ''}">
            </td>
            <td class="text-center">
                <button type="button" class="btn btn-sm btn-outline-danger remove-test" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
                <input type="hidden" name="test-id" value="${test.id}">
                <input type="hidden" name="test-price" value="${test.price}">
            </td>
        `;
        
        tbody.appendChild(row);
        
        // Add event listener to remove button
        const removeBtn = row.querySelector('.remove-test');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                row.remove();
                this.updateTotalAmount();
                
                // If no tests left, show the "no tests" message
                if (tbody.children.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="4" class="text-center py-3 text-muted">
                                No se han agregado exámenes
                            </td>
                        </tr>
                    `;
                }
            });
        }
        
        // Update total amount
        this.updateTotalAmount();
        
        // Show success message
        showToast(`Examen "${test.name}" agregado a la orden`, 'success');
    }
    
    updateTotalAmount() {
        const tbody = document.getElementById('selected-tests');
        if (!tbody) return;
        
        let total = 0;
        
        // Sum up all test prices
        const priceInputs = tbody.querySelectorAll('input[name="test-price"]');
        priceInputs.forEach(input => {
            total += parseFloat(input.value) || 0;
        });
        
        // Update the total amount field
        const totalAmountInput = document.getElementById('total-amount');
        if (totalAmountInput) {
            totalAmountInput.value = total.toLocaleString();
        }
    }
    
    async searchPatient() {
        const searchTerm = document.getElementById('patient-search')?.value.trim();
        if (!searchTerm) {
            showToast('Por favor ingrese un término de búsqueda', 'warning');
            return;
        }
        
        try {
            showLoading(true, 'Buscando paciente...');
            
            // In a real app, this would be an API call to search for patients
            // const response = await fetch(`${API_BASE_URL}/patients/search?q=${encodeURIComponent(searchTerm)}`);
            // const patients = await response.json();
            
            // For now, we'll simulate a search in our mock patients
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const searchResults = this.patients.filter(patient => {
                const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
                return fullName.includes(searchTerm.toLowerCase()) || 
                       patient.documentNumber.includes(searchTerm);
            });
            
            this.displayPatientSearchResults(searchResults);
            
        } catch (error) {
            console.error('Error searching for patients:', error);
            showToast('Error al buscar pacientes', 'error');
        } finally {
            showLoading(false);
        }
    }
    
    displayPatientSearchResults(patients) {
        const resultsContainer = document.getElementById('patient-search-results');
        const noPatientSelected = document.getElementById('no-patient-selected');
        const patientInfo = document.getElementById('patient-info');
        
        if (!resultsContainer || !noPatientSelected || !patientInfo) return;
        
        if (patients.length === 0) {
            resultsContainer.innerHTML = `
                <div class="alert alert-warning mb-0">
                    No se encontraron pacientes que coincidan con la búsqueda.
                </div>
            `;
            resultsContainer.classList.remove('d-none');
            return;
        }
        
        // Show search results
        resultsContainer.innerHTML = `
            <div class="list-group">
                ${patients.map(patient => `
                    <button type="button" class="list-group-item list-group-item-action patient-result" 
                            data-patient-id="${patient.id}">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">${patient.firstName} ${patient.lastName}</h6>
                            <small>${patient.documentType} ${patient.documentNumber}</small>
                        </div>
                        <div class="d-flex w-100 justify-content-between">
                            <small>${this.calculateAge(patient.birthDate)} años • ${patient.gender === 'M' ? 'Masculino' : 'Femenino'}</small>
                            <small><i class="fas fa-phone-alt me-1"></i>${patient.phone}</small>
                        </div>
                    </button>
                `).join('')}
            </div>
        `;
        
        resultsContainer.classList.remove('d-none');
        
        // Add event listeners to patient results
        document.querySelectorAll('.patient-result').forEach(button => {
            button.addEventListener('click', () => {
                const patientId = button.getAttribute('data-patient-id');
                const patient = this.patients.find(p => p.id === patientId);
                
                if (patient) {
                    this.selectPatient(patient);
                    resultsContainer.classList.add('d-none');
                }
            });
        });
    }
    
    selectPatient(patient) {
        const noPatientSelected = document.getElementById('no-patient-selected');
        const patientInfo = document.getElementById('patient-info');
        
        if (!noPatientSelected || !patientInfo) return;
        
        // Hide "no patient selected" message and show patient info
        noPatientSelected.classList.add('d-none');
        patientInfo.classList.remove('d-none');
        
        // Update patient info
        document.getElementById('patient-initials').textContent = 
            `${patient.firstName.charAt(0)}${patient.lastName.charAt(0)}`;
        document.getElementById('patient-name').textContent = 
            `${patient.firstName} ${patient.lastName}`;
        document.getElementById('patient-document').textContent = 
            `${patient.documentType} ${patient.documentNumber}`;
        document.getElementById('patient-age').textContent = 
            `${this.calculateAge(patient.birthDate)} años`;
        document.getElementById('patient-gender').textContent = 
            patient.gender === 'M' ? 'Masculino' : 'Femenino';
        document.getElementById('patient-phone').textContent = patient.phone || 'No especificado';
        document.getElementById('patient-email').textContent = patient.email || 'No especificado';
        document.getElementById('patient-address').textContent = 
            patient.address && patient.city 
                ? `${patient.address}, ${patient.city}` 
                : 'Dirección no especificada';
        
        // Store patient ID in a hidden field for form submission
        const patientIdInput = document.getElementById('patient-id');
        if (patientIdInput) {
            patientIdInput.value = patient.id;
        }
    }
    
    async saveOrder() {
        const form = document.getElementById('order-form');
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        
        // Check if a patient is selected
        const patientId = document.getElementById('patient-id').value;
        if (!patientId) {
            showToast('Por favor seleccione un paciente', 'warning');
            return;
        }
        
        // Check if at least one test is selected
        const selectedTests = Array.from(document.querySelectorAll('#selected-tests tr[data-test-id]'));
        if (selectedTests.length === 0) {
            showToast('Por favor agregue al menos un examen a la orden', 'warning');
            return;
        }
        
        // Prepare order data
        const orderData = {
            id: document.getElementById('order-id').value,
            patientId: patientId,
            orderDate: document.getElementById('order-date').value,
            priority: document.getElementById('priority').value,
            physician: document.getElementById('ordering-physician').value.trim(),
            clinicalNotes: document.getElementById('clinical-notes').value.trim(),
            diagnosisCode: document.getElementById('diagnosis-code').value.trim(),
            tests: selectedTests.map(row => ({
                testId: row.getAttribute('data-test-id'),
                instructions: row.querySelector('.test-instructions')?.value.trim() || ''
            })),
            billing: {
                type: document.getElementById('billing-type').value,
                insuranceCompany: document.getElementById('billing-type').value === 'insurance' 
                    ? document.getElementById('insurance-company').value 
                    : null,
                policyNumber: document.getElementById('billing-type').value === 'insurance'
                    ? document.getElementById('policy-number').value.trim()
                    : null,
                notes: document.getElementById('billing-notes').value.trim(),
                totalAmount: parseFloat(document.getElementById('total-amount').value.replace(/\./g, '').replace(',', '.'))
            },
            status: 'pending'
        };
        
        try {
            showLoading(true, 'Guardando orden...');
            
            // In a real app, this would be an API call
            // const method = orderData.id ? 'PUT' : 'POST';
            // const url = orderData.id 
            //     ? `${API_BASE_URL}/orders/${orderData.id}` 
            //     : `${API_BASE_URL}/orders`;
            // 
            // const response = await fetch(url, {
            //     method,
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            //     },
            //     body: JSON.stringify(orderData)
            // });
            // 
            // if (!response.ok) {
            //     throw new Error('Error al guardar la orden');
            // }
            // 
            // const result = await response.json();
            
            // Simulate API call with timeout
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Show success message
            showToast(
                orderData.id 
                    ? 'Orden actualizada correctamente' 
                    : 'Orden creada correctamente',
                'success'
            );
            
            // Close modal and refresh the list
            const modal = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
            if (modal) modal.hide();
            
            await this.loadOrders(this.currentPage, this.searchQuery);
            
        } catch (error) {
            console.error('Error saving order:', error);
            showToast('Error al guardar la orden', 'error');
        } finally {
            showLoading(false);
        }
    }
    
    async viewOrder(orderId) {
        try {
            showLoading(true, 'Cargando orden...');
            
            // In a real app, this would be an API call
            // const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            //     }
            // });
            // 
            // if (!response.ok) {
            //     throw new Error('Error al cargar la orden');
            // }
            // 
            // const order = await response.json();
            
            // Simulate API call with timeout
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Find order in the list (for demo purposes)
            const order = this.orders.find(o => o.id === orderId);
            
            if (!order) {
                throw new Error('Orden no encontrada');
            }
            
            // In a real app, we would show a detailed view or print a report
            // For now, we'll just show an alert with the order details
            const orderDetails = `
                <div class="mb-3">
                    <h5>Orden #${order.id}</h5>
                    <p class="mb-1"><strong>Paciente:</strong> ${order.patientName}</p>
                    <p class="mb-1"><strong>Documento:</strong> ${order.patientDocument}</p>
                    <p class="mb-1"><strong>Fecha:</strong> ${this.formatDate(order.orderDate, true)}</p>
                    <p class="mb-1"><strong>Médico:</strong> ${order.physician}</p>
                    <p class="mb-1"><strong>Estado:</strong> ${this.getStatusText(order.status)}</p>
                    <p class="mb-1"><strong>Exámenes:</strong></p>
                    <ul class="mb-2">
                        ${order.tests.map(test => `<li>${test.name}</li>`).join('')}
                    </ul>
                    <p class="mb-1"><strong>Total:</strong> $${order.totalAmount.toLocaleString()}</p>
                </div>
            `;
            
            // Show order details in a modal
            const modal = new bootstrap.Modal(document.createElement('div'));
            modal._element.classList.add('modal', 'fade');
            modal._element.innerHTML = `
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Detalles de la Orden</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            ${orderDetails}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            <button type="button" class="btn btn-primary" id="print-order">
                                <i class="fas fa-print me-1"></i> Imprimir
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal._element);
            modal.show();
            
            // Add event listener to print button
            document.getElementById('print-order')?.addEventListener('click', () => {
                window.print();
            });
            
            // Remove modal from DOM after hiding
            modal._element.addEventListener('hidden.bs.modal', () => {
                document.body.removeChild(modal._element);
            });
            
        } catch (error) {
            console.error('Error viewing order:', error);
            showToast(error.message || 'Error al cargar la orden', 'error');
        } finally {
            showLoading(false);
        }
    }
    
    async editOrder(orderId) {
        try {
            showLoading(true, 'Cargando orden para edición...');
            
            // In a real app, this would be an API call
            // const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            //     }
            // });
            // 
            // if (!response.ok) {
            //     throw new Error('Error al cargar la orden para edición');
            // }
            // 
            // const order = await response.json();
            
            // Simulate API call with timeout
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Find order in the list (for demo purposes)
            const order = this.orders.find(o => o.id === orderId);
            
            if (!order) {
                throw new Error('Orden no encontrada');
            }
            
            // Show edit modal with order data
            this.showOrderModal(order);
            
            // In a real app, we would populate the form with the order data
            // For now, we'll just log it to the console
            console.log('Editing order:', order);
            
        } catch (error) {
            console.error('Error editing order:', error);
            showToast(error.message || 'Error al cargar la orden para edición', 'error');
        } finally {
            showLoading(false);
        }
    }
    
    async cancelOrder(orderId) {
        try {
            const confirm = await showConfirm(
                '¿Está seguro de que desea cancelar esta orden? Esta acción no se puede deshacer.',
                'Confirmar cancelación'
            );
            
            if (!confirm) return;
            
            showLoading(true, 'Cancelando orden...');
            
            // In a real app, this would be an API call
            // const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
            //     method: 'POST',
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            //     }
            // });
            // 
            // if (!response.ok) {
            //     throw new Error('Error al cancelar la orden');
            // }
            
            // Simulate API call with timeout
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Show success message
            showToast('Orden cancelada correctamente', 'success');
            
            // Refresh the list
            await this.loadOrders(this.currentPage, this.searchQuery);
            
        } catch (error) {
            console.error('Error canceling order:', error);
            showToast(error.message || 'Error al cancelar la orden', 'error');
        } finally {
            showLoading(false);
        }
    }
    
    // Helper methods
    calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }
    
    formatDate(dateString, includeTime = false) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        
        if (includeTime) {
            return date.toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }
    }
    
    getStatusText(status) {
        const statusMap = {
            'pending': 'Pendiente',
            'in-progress': 'En Progreso',
            'completed': 'Completado',
            'cancelled': 'Cancelado'
        };
        
        return statusMap[status] || status;
    }
}
