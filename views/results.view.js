import { showLoading, showToast, showConfirm } from '../js/utils/notifications.js';
import { API_BASE_URL } from '../js/config.js';

export class ResultsView {
    constructor() {
        this.results = [];
        this.orders = [];
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
                    <h2>Resultados de Exámenes</h2>
                    <div>
                        <button id="new-result-btn" class="btn btn-primary me-2">
                            <i class="fas fa-plus me-2"></i>Nuevo Resultado
                        </button>
                        <div class="btn-group">
                            <button type="button" class="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="fas fa-download me-1"></i> Exportar
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#" id="export-pdf"><i class="fas fa-file-pdf me-2 text-danger"></i>PDF</a></li>
                                <li><a class="dropdown-item" href="#" id="export-excel"><i class="fas fa-file-excel me-2 text-success"></i>Excel</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item" href="#" id="export-print"><i class="fas fa-print me-2"></i>Imprimir</a></li>
                            </ul>
                        </div>
                    </div>
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
                                    <input type="text" id="search-results" class="form-control" placeholder="Buscar resultados...">
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
                                    <option value="validated">Validado</option>
                                    <option value="rejected">Rechazado</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <select id="filter-test" class="form-select">
                                    <option value="">Todos los exámenes</option>
                                    <!-- Test options will be populated by JavaScript -->
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
                
                <!-- Results Table -->
                <div class="card">
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th># Orden</th>
                                        <th>Paciente</th>
                                        <th>Examen</th>
                                        <th>Fecha Muestra</th>
                                        <th>Resultado</th>
                                        <th>Estado</th>
                                        <th class="text-end">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="results-table-body">
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
                                Mostrando <span id="start-item">0</span> a <span id="end-item">0</span> de <span id="total-items">0</span> resultados
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
            
            <!-- Result Modal -->
            <div class="modal fade" id="resultModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="resultModalLabel">Registrar Resultado</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form id="result-form">
                            <div class="modal-body">
                                <input type="hidden" id="result-id">
                                
                                <div class="row mb-4">
                                    <div class="col-md-6">
                                        <div class="card h-100">
                                            <div class="card-header bg-light">
                                                <h6 class="mb-0">Información del Paciente</h6>
                                            </div>
                                            <div class="card-body">
                                                <div class="mb-3">
                                                    <label for="order-search" class="form-label">Buscar Orden <span class="text-danger">*</span></label>
                                                    <div class="input-group">
                                                        <input type="text" class="form-control" id="order-search" placeholder="Número de orden o documento del paciente" required>
                                                        <button class="btn btn-outline-secondary" type="button" id="search-order-btn">
                                                            <i class="fas fa-search"></i>
                                                        </button>
                                                    </div>
                                                    <div id="order-search-results" class="mt-2 d-none">
                                                        <!-- Order search results will be displayed here -->
                                                    </div>
                                                </div>
                                                
                                                <div id="order-info" class="d-none">
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
                                                    
                                                    <hr class="my-3">
                                                    
                                                    <div class="mb-2">
                                                        <strong>Orden:</strong> <span id="order-number">ORD-1001</span>
                                                        <span class="badge bg-primary ms-2">Rutinaria</span>
                                                    </div>
                                                    <div class="mb-2">
                                                        <strong>Médico:</strong> <span id="ordering-physician">Dr. Carlos Martínez</span>
                                                    </div>
                                                    <div class="mb-2">
                                                        <strong>Fecha de orden:</strong> <span id="order-date">15/03/2023 10:30</span>
                                                    </div>
                                                    <div>
                                                        <strong>Notas clínicas:</strong> 
                                                        <div id="clinical-notes" class="text-muted">Paciente con dolor abdominal y fiebre</div>
                                                    </div>
                                                </div>
                                                
                                                <div id="no-order-selected" class="text-center py-4">
                                                    <i class="fas fa-file-medical fa-3x text-muted mb-2"></i>
                                                    <p class="text-muted mb-0">Busque y seleccione una orden</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="card h-100">
                                            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                                                <h6 class="mb-0">Exámenes de la Orden</h6>
                                                <div class="form-check form-switch mb-0">
                                                    <input class="form-check-input" type="checkbox" id="show-all-tests" checked>
                                                    <label class="form-check-label small" for="show-all-tests">Mostrar todos</label>
                                                </div>
                                            </div>
                                            <div class="card-body p-0">
                                                <div class="list-group list-group-flush" id="order-tests">
                                                    <!-- Order tests will be listed here -->
                                                    <div class="text-center py-5 text-muted">
                                                        <i class="fas fa-vial fa-2x mb-2"></i>
                                                        <p class="mb-0">Seleccione una orden para ver los exámenes</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Test Results -->
                                <div class="card mb-4" id="test-results-container" style="display: none;">
                                    <div class="card-header bg-light">
                                        <h6 class="mb-0">Resultados del Examen</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-center mb-3">
                                            <h5 id="test-name">Hemograma Completo</h5>
                                            <div>
                                                <span class="badge bg-primary" id="test-code">HEMO</span>
                                                <span class="badge bg-secondary" id="test-category">Hematología</span>
                                            </div>
                                        </div>
                                        
                                        <div class="alert alert-info" id="test-instructions">
                                            <i class="fas fa-info-circle me-2"></i>
                                            <span id="test-instructions-text">Instrucciones especiales para el procesamiento de la muestra.</span>
                                        </div>
                                        
                                        <div class="table-responsive">
                                            <table class="table table-bordered" id="test-parameters">
                                                <thead class="table-light">
                                                    <tr>
                                                        <th>Parámetro</th>
                                                        <th>Resultado</th>
                                                        <th>Unidades</th>
                                                        <th>Valores de Referencia</th>
                                                        <th>Estado</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <!-- Test parameters will be added here by JavaScript -->
                                                </tbody>
                                            </table>
                                        </div>
                                        
                                        <div class="mt-3">
                                            <label for="test-notes" class="form-label">Observaciones</label>
                                            <textarea class="form-control" id="test-notes" rows="2" placeholder="Observaciones adicionales sobre los resultados"></textarea>
                                        </div>
                                        
                                        <div class="mt-3">
                                            <label for="test-conclusion" class="form-label">Conclusión</label>
                                            <textarea class="form-control" id="test-conclusion" rows="2" placeholder="Conclusión del profesional"></textarea>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Result Validation -->
                                <div class="card" id="validation-container" style="display: none;">
                                    <div class="card-header bg-light">
                                        <h6 class="mb-0">Validación del Resultado</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="row g-3">
                                            <div class="col-md-6">
                                                <label for="result-status" class="form-label">Estado del Resultado <span class="text-danger">*</span></label>
                                                <select class="form-select" id="result-status" required>
                                                    <option value="pending">Pendiente</option>
                                                    <option value="in-progress">En Progreso</option>
                                                    <option value="completed">Completado</option>
                                                    <option value="validated">Validado</option>
                                                    <option value="rejected">Rechazado</option>
                                                </select>
                                            </div>
                                            <div class="col-md-6">
                                                <label for="validated-by" class="form-label">Validado por</label>
                                                <input type="text" class="form-control" id="validated-by" readonly>
                                            </div>
                                            <div class="col-12">
                                                <label for="validation-notes" class="form-label">Notas de Validación</label>
                                                <textarea class="form-control" id="validation-notes" rows="2" placeholder="Notas adicionales del validador"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="button" class="btn btn-outline-primary" id="save-draft">
                                    <i class="far fa-save me-1"></i> Guardar Borrador
                                </button>
                                <button type="submit" class="btn btn-primary" id="save-result">
                                    <i class="fas fa-check-circle me-1"></i> Guardar Resultado
                                </button>
                            </div>
                        </form>
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
                .status-validated { background-color: #d1e7dd; color: #0f5132; }
                .status-rejected { background-color: #f8d7da; color: #842029; }
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
                    transition: all 0.2s;
                    border-left: 3px solid transparent;
                }
                .test-item:hover {
                    background-color: #f8f9fa;
                }
                .test-item.active {
                    background-color: #e7f1ff;
                    border-left-color: #0d6efd;
                }
                .test-item.completed {
                    border-left-color: #198754;
                }
                .test-item.pending {
                    border-left-color: #ffc107;
                }
                .parameter-normal {}
                .parameter-high { color: #dc3545; font-weight: 500; }
                .parameter-low { color: #0d6efd; font-weight: 500; }
                .parameter-critical { background-color: #fff5f5; font-weight: 600; }
            </style>
        `;
    }

    async init() {
        // Load initial data
        await this.loadResults();
        await this.loadTestsForFilter();
        this.setupEventListeners();
    }
    
    async loadResults(page = 1, search = '') {
        showLoading(true, 'Cargando resultados...');
        
        try {
            // In a real app, this would be an API call
            // const response = await fetch(`${API_BASE_URL}/results?page=${page}&search=${encodeURIComponent(search)}`);
            // const data = await response.json();
            
            // Simulate API call with timeout
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Mock data
            const mockResults = this.generateMockResults(35);
            this.results = mockResults;
            this.currentPage = page;
            this.pageSize = 10;
            this.totalPages = Math.ceil(this.results.length / this.pageSize);
            
            this.renderResultsTable();
            this.renderPagination();
        } catch (error) {
            console.error('Error loading results:', error);
            showToast('Error al cargar los resultados', 'error');
        } finally {
            showLoading(false);
        }
    }
    
    async loadTestsForFilter() {
        try {
            // In a real app, this would be an API call to get test types
            // For now, we'll use a static list
            const testTypes = [
                { id: 'HEMO', name: 'Hemograma Completo' },
                { id: 'GLUC', name: 'Glucosa en Ayunas' },
                { id: 'CREA', name: 'Creatinina' },
                { id: 'URIN', name: 'Uroanálisis Completo' },
                { id: 'TGO', name: 'TGO (AST)' },
                { id: 'TGP', name: 'TGP (ALT)' },
                { id: 'TSH', name: 'Hormona Estimulante de Tiroides' },
                { id: 'PSA', name: 'Antígeno Prostático Específico' },
                { id: 'HEPB', name: 'Prueba de Hepatitis B' },
                { id: 'HEPC', name: 'Prueba de Hepatitis C' },
                { id: 'HEMO', name: 'Hemoglobina Glicosilada' },
                { id: 'LIPI', name: 'Perfil Lipídico' },
                { id: 'COAG', name: 'Tiempo de Protrombina' },
                { id: 'CULT', name: 'Urocultivo' },
                { id: 'VITD', name: 'Vitamina D' }
            ];
            
            // Populate test filter dropdown
            const testSelect = document.getElementById('filter-test');
            if (testSelect) {
                // Keep the first option ("Todos los exámenes")
                testSelect.innerHTML = '<option value="">Todos los exámenes</option>';
                
                // Add test options
                testTypes.forEach(test => {
                    const option = document.createElement('option');
                    option.value = test.id;
                    option.textContent = test.name;
                    testSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading tests for filter:', error);
        }
    }
    
    generateMockResults(count) {
        const statuses = ['pending', 'in-progress', 'completed', 'validated', 'rejected'];
        const tests = [
            { id: 'HEMO', name: 'Hemograma Completo', category: 'Hematología' },
            { id: 'GLUC', name: 'Glucosa en Ayunas', category: 'Química Clínica' },
            { id: 'CREA', name: 'Creatinina', category: 'Química Clínica' },
            { id: 'URIN', name: 'Uroanálisis Completo', category: 'Uroanálisis' },
            { id: 'TGO', name: 'TGO (AST)', category: 'Química Clínica' },
            { id: 'TGP', name: 'TGP (ALT)', category: 'Química Clínica' },
            { id: 'TSH', name: 'Hormona Estimulante de Tiroides', category: 'Hormonas' },
            { id: 'PSA', name: 'Antígeno Prostático Específico', category: 'Marcadores Tumorales' },
            { id: 'HEPB', name: 'Prueba de Hepatitis B', category: 'Inmunología' },
            { id: 'HEPC', name: 'Prueba de Hepatitis C', category: 'Inmunología' }
        ];
        
        const results = [];
        const mockPatients = this.generateMockPatients(count);
        
        for (let i = 1; i <= count; i++) {
            const resultDate = new Date();
            resultDate.setDate(resultDate.getDate() - Math.floor(Math.random() * 30));
            
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const test = tests[Math.floor(Math.random() * tests.length)];
            const patient = mockPatients[i - 1];
            
            // Generate a sample ID
            const sampleId = `M${Math.floor(10000 + Math.random() * 90000)}`;
            
            // Generate a random result value based on test type
            let resultValue = '';
            let unit = '';
            let referenceRange = '';
            
            switch(test.id) {
                case 'HEMO':
                    resultValue = (12.5 + (Math.random() * 2.5)).toFixed(1);
                    unit = 'g/dL';
                    referenceRange = '13.5-17.5';
                    break;
                case 'GLUC':
                    resultValue = Math.floor(70 + Math.random() * 60).toString();
                    unit = 'mg/dL';
                    referenceRange = '70-99';
                    break;
                case 'CREA':
                    resultValue = (0.7 + Math.random() * 1.3).toFixed(2);
                    unit = 'mg/dL';
                    referenceRange = '0.7-1.3';
                    break;
                case 'URIN':
                    resultValue = 'Negativo';
                    unit = '';
                    referenceRange = 'Negativo';
                    break;
                case 'TGO':
                    resultValue = Math.floor(10 + Math.random() * 30).toString();
                    unit = 'U/L';
                    referenceRange = '0-40';
                    break;
                case 'TGP':
                    resultValue = Math.floor(10 + Math.random() * 30).toString();
                    unit = 'U/L';
                    referenceRange = '0-41';
                    break;
                case 'TSH':
                    resultValue = (1.5 + Math.random() * 3.5).toFixed(2);
                    unit = 'µIU/mL';
                    referenceRange = '0.4-4.0';
                    break;
                case 'PSA':
                    resultValue = (1.0 + Math.random() * 3.0).toFixed(2);
                    unit = 'ng/mL';
                    referenceRange = '0.0-4.0';
                    break;
                case 'HEPB':
                    resultValue = 'No reactivo';
                    unit = '';
                    referenceRange = 'No reactivo';
                    break;
                case 'HEPC':
                    resultValue = 'No reactivo';
                    unit = '';
                    referenceRange = 'No reactivo';
                    break;
                default:
                    resultValue = 'N/A';
                    unit = '';
                    referenceRange = 'N/A';
            }
            
            // Determine if the result is normal, high, or low
            let resultStatus = 'normal';
            if (typeof resultValue === 'number' || !isNaN(parseFloat(resultValue))) {
                const numValue = parseFloat(resultValue);
                if (referenceRange.includes('-')) {
                    const [min, max] = referenceRange.split('-').map(Number);
                    if (numValue < min) resultStatus = 'low';
                    else if (numValue > max) resultStatus = 'high';
                }
            }
            
            results.push({
                id: `RES-${1000 + i}`,
                orderId: `ORD-${1000 + i}`,
                testId: test.id,
                testName: test.name,
                testCategory: test.category,
                patientId: patient.id,
                patientName: `${patient.firstName} ${patient.lastName}`,
                patientDocument: patient.documentNumber,
                sampleId: sampleId,
                result: resultValue,
                unit: unit,
                referenceRange: referenceRange,
                resultStatus: resultStatus,
                notes: '',
                conclusion: '',
                status: status,
                validatedBy: status === 'validated' ? 'Dra. Ana Gómez' : '',
                validationNotes: status === 'validated' ? 'Resultado validado por el laboratorio' : '',
                sampleDate: new Date(resultDate.getTime() - 3600000).toISOString(),
                resultDate: resultDate.toISOString(),
                createdAt: resultDate.toISOString(),
                updatedAt: resultDate.toISOString()
            });
        }
        
        // Sort by date (newest first)
        return results.sort((a, b) => new Date(b.resultDate) - new Date(a.resultDate));
    }
    
    generateMockPatients(count) {
        const firstNames = ['Juan', 'María', 'Carlos', 'Ana', 'Pedro', 'Laura', 'Jorge', 'Sofía', 'Andrés', 'Camila'];
        const lastNames = ['González', 'Rodríguez', 'Gómez', 'López', 'Martínez', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores'];
        const documentTypes = ['CC', 'TI', 'CE', 'PAS'];
        
        const patients = [];
        
        for (let i = 1; i <= count; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const documentType = documentTypes[Math.floor(Math.random() * documentTypes.length)];
            const documentNumber = Math.floor(10000000 + Math.random() * 90000000).toString();
            
            // Generate a random date of birth between 18 and 90 years ago
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - Math.floor(18 + Math.random() * 72));
            birthDate.setMonth(Math.floor(Math.random() * 12));
            birthDate.setDate(Math.floor(Math.random() * 28) + 1);
            
            patients.push({
                id: `PAT-${1000 + i}`,
                firstName,
                lastName,
                documentType,
                documentNumber,
                birthDate: birthDate.toISOString().split('T')[0],
                gender: Math.random() > 0.5 ? 'M' : 'F',
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
                phone: `+57 3${Math.floor(1000000 + Math.random() * 9000000)}`,
                address: `Calle ${Math.floor(Math.random() * 100) + 1} #${Math.floor(Math.random() * 100) + 1}-${Math.floor(Math.random() * 100)}`,
                city: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Pereira', 'Manizales', 'Armenia', 'Pasto'][Math.floor(Math.random() * 10)],
                status: 'active'
            });
        }
        
        return patients;
    }
    
    renderResultsTable() {
        const tbody = document.getElementById('results-table-body');
        if (!tbody) return;
        
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const paginatedResults = this.results.slice(start, end);
        
        if (paginatedResults.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-5">
                        <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                        <p class="mb-0">No se encontraron resultados</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = paginatedResults.map(result => {
            const statusClass = {
                'pending': 'status-pending',
                'in-progress': 'status-in-progress',
                'completed': 'status-completed',
                'validated': 'status-validated',
                'rejected': 'status-rejected'
            }[result.status] || '';
            
            const statusText = {
                'pending': 'Pendiente',
                'in-progress': 'En Progreso',
                'completed': 'Completado',
                'validated': 'Validado',
                'rejected': 'Rechazado'
            }[result.status] || result.status;
            
            // Format result with unit
            let resultDisplay = result.result;
            if (result.unit) {
                resultDisplay += ` ${result.unit}`;
            }
            
            // Add color based on result status
            let resultClass = '';
            if (result.status === 'validated' || result.status === 'completed') {
                if (result.resultStatus === 'high') {
                    resultClass = 'text-danger fw-bold';
                    resultDisplay += ' ↑';
                } else if (result.resultStatus === 'low') {
                    resultClass = 'text-primary fw-bold';
                    resultDisplay += ' ↓';
                } else if (result.resultStatus === 'critical') {
                    resultClass = 'text-danger fw-bold';
                    resultDisplay += ' !';
                }
            }
            
            return `
                <tr>
                    <td>
                        <div class="fw-medium">${result.orderId}</div>
                        <small class="text-muted">Muestra: ${result.sampleId}</small>
                    </td>
                    <td>
                        <div class="fw-medium">${result.patientName}</div>
                        <small class="text-muted">${result.patientDocument}</small>
                    </td>
                    <td>
                        <div>${result.testName}</div>
                        <small class="text-muted">${result.testCategory}</small>
                    </td>
                    <td>${this.formatDate(result.sampleDate, true)}</td>
                    <td class="${resultClass}">${resultDisplay}</td>
                    <td>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary action-btn view-result" data-id="${result.id}" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary action-btn edit-result" data-id="${result.id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success action-btn validate-result" data-id="${result.id}" title="Validar">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger action-btn reject-result" data-id="${result.id}" title="Rechazar">
                            <i class="fas fa-times"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Update pagination info
        document.getElementById('start-item').textContent = Math.min(start + 1, this.results.length);
        document.getElementById('end-item').textContent = Math.min(end, this.results.length);
        document.getElementById('total-items').textContent = this.results.length;
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
        // New result button
        document.getElementById('new-result-btn')?.addEventListener('click', () => {
            this.showResultModal();
        });
        
        // Search input
        const searchInput = document.getElementById('search-results');
        let searchTimeout;
        
        searchInput?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchQuery = e.target.value;
                this.loadResults(1, this.searchQuery);
            }, 500);
        });
        
        // Clear search button
        document.getElementById('clear-search')?.addEventListener('click', () => {
            searchInput.value = '';
            this.searchQuery = '';
            this.loadResults(1, '');
        });
        
        // Filter by status
        document.getElementById('filter-status')?.addEventListener('change', (e) => {
            // In a real app, this would filter the results
            console.log('Filter by status:', e.target.value);
        });
        
        // Filter by test
        document.getElementById('filter-test')?.addEventListener('change', (e) => {
            // In a real app, this would filter the results by test
            console.log('Filter by test:', e.target.value);
        });
        
        // Filter by date
        document.getElementById('filter-date')?.addEventListener('change', (e) => {
            // In a real app, this would filter the results by date
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
        
        // Export buttons
        document.getElementById('export-pdf')?.addEventListener('click', (e) => {
            e.preventDefault();
            showToast('Exportando a PDF...', 'info');
            // In a real app, this would export the results to PDF
        });
        
        document.getElementById('export-excel')?.addEventListener('click', (e) => {
            e.preventDefault();
            showToast('Exportando a Excel...', 'info');
            // In a real app, this would export the results to Excel
        });
        
        document.getElementById('export-print')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.print();
        });
        
        // Pagination click handler
        document.getElementById('pagination')?.addEventListener('click', (e) => {
            e.preventDefault();
            const pageLink = e.target.closest('.page-link');
            if (!pageLink) return;
            
            const page = parseInt(pageLink.getAttribute('data-page'));
            if (!isNaN(page) && page >= 1 && page <= this.totalPages && page !== this.currentPage) {
                this.loadResults(page, this.searchQuery);
            }
        });
        
        // Delegate events for action buttons
        document.getElementById('results-table-body')?.addEventListener('click', (e) => {
            const target = e.target.closest('.view-result, .edit-result, .validate-result, .reject-result');
            if (!target) return;
            
            const resultId = target.getAttribute('data-id');
            
            if (target.classList.contains('view-result')) {
                this.viewResult(resultId);
            } else if (target.classList.contains('edit-result')) {
                this.editResult(resultId);
            } else if (target.classList.contains('validate-result')) {
                this.validateResult(resultId);
            } else if (target.classList.contains('reject-result')) {
                this.rejectResult(resultId);
            }
        });
    }
    
    showResultModal(result = null) {
        const modal = new bootstrap.Modal(document.getElementById('resultModal'));
        const modalTitle = document.getElementById('resultModalLabel');
        
        // Reset form
        document.getElementById('result-form')?.reset();
        
        // Reset patient and order info
        document.getElementById('order-info').classList.add('d-none');
        document.getElementById('no-order-selected').classList.remove('d-none');
        
        // Reset test results
        document.getElementById('test-results-container').style.display = 'none';
        document.getElementById('validation-container').style.display = 'none';
        
        // Reset order tests list
        document.getElementById('order-tests').innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="fas fa-vial fa-2x mb-2"></i>
                <p class="mb-0">Seleccione una orden para ver los exámenes</p>
            </div>
        `;
        
        if (result) {
            // Edit mode
            modalTitle.textContent = 'Editar Resultado';
            document.getElementById('result-id').value = result.id;
            
            // In a real app, we would load the result data and populate the form
            console.log('Loading result data for editing:', result);
            
            // For now, we'll just show a message
            showToast('Cargando datos del resultado...', 'info');
            
        } else {
            // New result mode
            modalTitle.textContent = 'Registrar Resultado';
            document.getElementById('result-id').value = '';
        }
        
        modal.show();
    }
    
    async searchOrder() {
        const searchTerm = document.getElementById('order-search')?.value.trim();
        if (!searchTerm) {
            showToast('Por favor ingrese un número de orden o documento de paciente', 'warning');
            return;
        }
        
        try {
            showLoading(true, 'Buscando orden...');
            
            // In a real app, this would be an API call to search for orders
            // const response = await fetch(`${API_BASE_URL}/orders/search?q=${encodeURIComponent(searchTerm)}`);
            // const orders = await response.json();
            
            // For now, we'll simulate a search in our mock data
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Generate some mock orders for demonstration
            const mockOrders = [
                {
                    id: 'ORD-1001',
                    patientId: 'PAT-1001',
                    patientName: 'Juan David Pérez',
                    patientDocument: 'CC 1012345678',
                    physician: 'Dr. Carlos Martínez',
                    orderDate: '2023-03-15T10:30:00Z',
                    priority: 'routine',
                    clinicalNotes: 'Paciente con dolor abdominal y fiebre',
                    tests: [
                        { id: 'HEMO', name: 'Hemograma Completo', category: 'Hematología', status: 'pending' },
                        { id: 'GLUC', name: 'Glucosa en Ayunas', category: 'Química Clínica', status: 'pending' },
                        { id: 'URIN', name: 'Uroanálisis Completo', category: 'Uroanálisis', status: 'pending' }
                    ]
                },
                {
                    id: 'ORD-1002',
                    patientId: 'PAT-1002',
                    patientName: 'María González',
                    patientDocument: 'CC 52123456',
                    physician: 'Dra. Ana Gómez',
                    orderDate: '2023-03-16T14:15:00Z',
                    priority: 'urgent',
                    clinicalNotes: 'Control de embarazo',
                    tests: [
                        { id: 'HEMO', name: 'Hemograma Completo', category: 'Hematología', status: 'pending' },
                        { id: 'GLUC', name: 'Prueba de Tolerancia a la Glucosa', category: 'Química Clínica', status: 'pending' },
                        { id: 'TSH', name: 'Hormona Estimulante de Tiroides', category: 'Hormonas', status: 'pending' }
                    ]
                }
            ];
            
            this.displayOrderSearchResults(mockOrders);
            
        } catch (error) {
            console.error('Error searching for orders:', error);
            showToast('Error al buscar órdenes', 'error');
        } finally {
            showLoading(false);
        }
    }
    
    displayOrderSearchResults(orders) {
        const resultsContainer = document.getElementById('order-search-results');
        const noOrderSelected = document.getElementById('no-order-selected');
        const orderInfo = document.getElementById('order-info');
        
        if (!resultsContainer || !noOrderSelected || !orderInfo) return;
        
        if (orders.length === 0) {
            resultsContainer.innerHTML = `
                <div class="alert alert-warning mb-0">
                    No se encontraron órdenes que coincidan con la búsqueda.
                </div>
            `;
            resultsContainer.classList.remove('d-none');
            return;
        }
        
        // Show search results
        resultsContainer.innerHTML = `
            <div class="list-group">
                ${orders.map(order => `
                    <button type="button" class="list-group-item list-group-item-action order-result" 
                            data-order-id="${order.id}">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">Orden #${order.id}</h6>
                            <small>${this.formatDate(order.orderDate, true)}</small>
                        </div>
                        <div class="d-flex w-100 justify-content-between">
                            <div>
                                <span class="me-2">${order.patientName}</span>
                                <small class="text-muted">${order.patientDocument}</small>
                            </div>
                            <div>
                                <span class="badge ${order.priority === 'urgent' ? 'bg-danger' : 'bg-primary'}">
                                    ${order.priority === 'urgent' ? 'Urgente' : 'Rutinaria'}
                                </span>
                            </div>
                        </div>
                        <div class="mt-1">
                            <small class="text-muted">Médico: ${order.physician}</small>
                        </div>
                    </button>
                `).join('')}
            </div>
        `;
        
        resultsContainer.classList.remove('d-none');
        
        // Add event listeners to order results
        document.querySelectorAll('.order-result').forEach(button => {
            button.addEventListener('click', () => {
                const orderId = button.getAttribute('data-order-id');
                const order = orders.find(o => o.id === orderId);
                
                if (order) {
                    this.selectOrder(order);
                    resultsContainer.classList.add('d-none');
                }
            });
        });
    }
    
    selectOrder(order) {
        const noOrderSelected = document.getElementById('no-order-selected');
        const orderInfo = document.getElementById('order-info');
        
        if (!noOrderSelected || !orderInfo) return;
        
        // Hide "no order selected" message and show order info
        noOrderSelected.classList.add('d-none');
        orderInfo.classList.remove('d-none');
        
        // Update patient info (in a real app, this would come from the patient record)
        document.getElementById('patient-initials').textContent = 
            order.patientName.split(' ').map(n => n[0]).join('').substring(0, 2);
        document.getElementById('patient-name').textContent = order.patientName;
        document.getElementById('patient-document').textContent = order.patientDocument;
        document.getElementById('patient-age').textContent = '35 años'; // This would come from the patient record
        document.getElementById('patient-gender').textContent = 'Masculino'; // This would come from the patient record
        document.getElementById('patient-phone').textContent = '+57 300 123 4567'; // This would come from the patient record
        document.getElementById('patient-email').textContent = 'juan.perez@example.com'; // This would come from the patient record
        document.getElementById('patient-address').textContent = 'Calle 123 #45-67, Bogotá'; // This would come from the patient record
        
        // Update order info
        document.getElementById('order-number').textContent = order.id;
        document.getElementById('ordering-physician').textContent = order.physician;
        document.getElementById('order-date').textContent = this.formatDate(order.orderDate, true);
        document.getElementById('clinical-notes').textContent = order.clinicalNotes || 'Ninguna';
        
        // Update order tests list
        const orderTestsList = document.getElementById('order-tests');
        if (orderTestsList) {
            orderTestsList.innerHTML = order.tests.map(test => {
                const statusClass = {
                    'pending': 'text-warning',
                    'in-progress': 'text-info',
                    'completed': 'text-success',
                    'validated': 'text-success',
                    'rejected': 'text-danger'
                }[test.status] || '';
                
                const statusText = {
                    'pending': 'Pendiente',
                    'in-progress': 'En Progreso',
                    'completed': 'Completado',
                    'validated': 'Validado',
                    'rejected': 'Rechazado'
                }[test.status] || test.status;
                
                return `
                    <button type="button" class="list-group-item list-group-item-action test-item ${test.status !== 'pending' ? test.status : ''}" 
                            data-test-id="${test.id}" data-test-name="${test.name}" data-test-category="${test.category}">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1">${test.name}</h6>
                                <small class="text-muted">${test.category}</small>
                            </div>
                            <div>
                                <span class="badge bg-light text-dark">${test.id}</span>
                                <span class="badge ${statusClass}">${statusText}</span>
                            </div>
                        </div>
                    </button>
                `;
            }).join('');
            
            // Add event listeners to test items
            document.querySelectorAll('.test-item').forEach(item => {
                item.addEventListener('click', () => {
                    // Remove active class from all test items
                    document.querySelectorAll('.test-item').forEach(i => i.classList.remove('active'));
                    
                    // Add active class to clicked test item
                    item.classList.add('active');
                    
                    // Show test results container
                    this.showTestResults(
                        item.getAttribute('data-test-id'),
                        item.getAttribute('data-test-name'),
                        item.getAttribute('data-test-category')
                    );
                });
            });
        }
        
        // Store order ID in a hidden field for form submission
        const orderIdInput = document.createElement('input');
        orderIdInput.type = 'hidden';
        orderIdInput.id = 'order-id';
        orderIdInput.value = order.id;
        
        const existingOrderIdInput = document.getElementById('order-id');
        if (existingOrderIdInput) {
            existingOrderIdInput.value = order.id;
        } else {
            document.getElementById('result-form')?.appendChild(orderIdInput);
        }
    }
    
    showTestResults(testId, testName, testCategory) {
        const testResultsContainer = document.getElementById('test-results-container');
        const testParametersTbody = document.querySelector('#test-parameters tbody');
        
        if (!testResultsContainer || !testParametersTbody) return;
        
        // Update test info
        document.getElementById('test-name').textContent = testName;
        document.getElementById('test-code').textContent = testId;
        document.getElementById('test-category').textContent = testCategory;
        
        // In a real app, this would be an API call to get test parameters and reference ranges
        const testParameters = this.getTestParameters(testId);
        
        // Update test parameters table
        testParametersTbody.innerHTML = testParameters.map(param => {
            // Determine if the value is normal, high, or low
            let statusClass = '';
            let statusText = '';
            
            if (param.value !== undefined) {
                if (param.value < param.referenceMin) {
                    statusClass = 'parameter-low';
                    statusText = 'Bajo';
                } else if (param.value > param.referenceMax) {
                    statusClass = 'parameter-high';
                    statusText = 'Alto';
                    
                    // Check if critical
                    if (param.criticalHigh && param.value > param.criticalHigh) {
                        statusClass = 'parameter-critical';
                        statusText = 'Críticamente Alto';
                    }
                } else {
                    statusClass = 'parameter-normal';
                    statusText = 'Normal';
                }
            }
            
            return `
                <tr class="${statusClass}">
                    <td>${param.name}</td>
                    <td>
                        ${param.value !== undefined ? param.value : ''}
                        ${param.value !== undefined && param.unit ? ` ${param.unit}` : ''}
                    </td>
                    <td>${param.unit || ''}</td>
                    <td>
                        ${param.referenceMin !== undefined && param.referenceMax !== undefined 
                            ? `${param.referenceMin} - ${param.referenceMax} ${param.unit || ''}` 
                            : param.referenceText || 'N/A'}
                    </td>
                    <td>${statusText}</td>
                </tr>
            `;
        }).join('');
        
        // Show test instructions if available
        const testInstructions = this.getTestInstructions(testId);
        const testInstructionsElement = document.getElementById('test-instructions-text');
        if (testInstructions && testInstructionsElement) {
            testInstructionsElement.textContent = testInstructions;
            document.getElementById('test-instructions').classList.remove('d-none');
        } else {
            document.getElementById('test-instructions').classList.add('d-none');
        }
        
        // Show the test results container
        testResultsContainer.style.display = 'block';
        
        // Show validation container for staff with appropriate permissions
        document.getElementById('validation-container').style.display = 'block';
        
        // Set validated by to current user (in a real app, this would come from the authentication context)
        document.getElementById('validated-by').value = 'Dr. Ana Gómez';
        
        // Set default status to 'completed' for new results
        document.getElementById('result-status').value = 'completed';
        
        // Scroll to test results
        testResultsContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    getTestParameters(testId) {
        // In a real app, this would be an API call to get test parameters
        // For now, we'll return some mock data based on the test ID
        switch(testId) {
            case 'HEMO':
                return [
                    { 
                        name: 'Hemoglobina', 
                        value: 14.5, 
                        unit: 'g/dL', 
                        referenceMin: 13.5, 
                        referenceMax: 17.5,
                        criticalHigh: 20.0,
                        criticalLow: 7.0
                    },
                    { 
                        name: 'Hematocrito', 
                        value: 42.5, 
                        unit: '%', 
                        referenceMin: 38.0, 
                        referenceMax: 50.0,
                        criticalHigh: 60.0,
                        criticalLow: 20.0
                    },
                    { 
                        name: 'Leucocitos', 
                        value: 7800, 
                        unit: 'células/µL', 
                        referenceMin: 4500, 
                        referenceMax: 11000,
                        criticalHigh: 30000,
                        criticalLow: 2000
                    },
                    { 
                        name: 'Plaquetas', 
                        value: 250000, 
                        unit: 'células/µL', 
                        referenceMin: 150000, 
                        referenceMax: 450000,
                        criticalHigh: 1000000,
                        criticalLow: 50000
                    }
                ];
            case 'GLUC':
                return [
                    { 
                        name: 'Glucosa en Ayunas', 
                        value: 95, 
                        unit: 'mg/dL', 
                        referenceMin: 70, 
                        referenceMax: 99,
                        criticalHigh: 400,
                        criticalLow: 50,
                        referenceText: '70-99 mg/dL (Normal: < 100 mg/dL)'
                    }
                ];
            case 'URIN':
                return [
                    { name: 'Aspecto', value: 'Límpido', referenceText: 'Límpido' },
                    { name: 'Color', value: 'Amarillo', referenceText: 'Amarillo' },
                    { name: 'Densidad', value: 1.015, referenceMin: 1.005, referenceMax: 1.030 },
                    { name: 'pH', value: 6.0, referenceMin: 4.5, referenceMax: 8.0 },
                    { name: 'Proteínas', value: 'Negativo', referenceText: 'Negativo' },
                    { name: 'Glucosa', value: 'Negativo', referenceText: 'Negativo' },
                    { name: 'Cetonas', value: 'Negativo', referenceText: 'Negativo' },
                    { name: 'Sangre', value: 'Negativo', referenceText: 'Negativo' },
                    { name: 'Leucocitos', value: 'Negativo', referenceText: 'Negativo' },
                    { name: 'Nitritos', value: 'Negativo', referenceText: 'Negativo' }
                ];
            default:
                return [
                    { name: 'Parámetro 1', value: 10, unit: 'U/L', referenceMin: 5, referenceMax: 15 },
                    { name: 'Parámetro 2', value: 25, unit: 'mg/dL', referenceMin: 20, referenceMax: 40 },
                    { name: 'Parámetro 3', value: 100, unit: 'U/L', referenceMin: 80, referenceMax: 120 }
                ];
        }
    }
    
    getTestInstructions(testId) {
        // In a real app, this would come from the test definition
        switch(testId) {
            case 'HEMO':
                return 'La muestra debe ser procesada dentro de las 6 horas posteriores a la extracción.';
            case 'GLUC':
                return 'El paciente debe estar en ayunas de 8-12 horas antes de la extracción.';
            case 'URIN':
                return 'La muestra debe ser la primera orina de la mañana y recolectada en un recipiente estéril.';
            default:
                return 'Siga los procedimientos estándar para el procesamiento de esta muestra.';
        }
    }
    
    async saveResult() {
        const form = document.getElementById('result-form');
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        
        // Check if an order is selected
        const orderId = document.getElementById('order-id')?.value;
        if (!orderId) {
            showToast('Por favor seleccione una orden', 'warning');
            return;
        }
        
        // Check if a test is selected
        const activeTest = document.querySelector('.test-item.active');
        if (!activeTest) {
            showToast('Por favor seleccione un examen', 'warning');
            return;
        }
        
        // Get test ID and name
        const testId = activeTest.getAttribute('data-test-id');
        const testName = activeTest.getAttribute('data-test-name');
        
        // Get result status
        const status = document.getElementById('result-status').value;
        
        // Get notes and conclusion
        const notes = document.getElementById('test-notes').value.trim();
        const conclusion = document.getElementById('test-conclusion').value.trim();
        
        // Get validation notes if status is validated or rejected
        const validationNotes = ['validated', 'rejected'].includes(status) 
            ? document.getElementById('validation-notes').value.trim()
            : '';
        
        // In a real app, we would collect all parameter values from the form
        // For now, we'll just log them to the console
        const parameters = [];
        document.querySelectorAll('#test-parameters tbody tr').forEach(row => {
            const name = row.cells[0].textContent;
            const value = row.cells[1].textContent.trim();
            const unit = row.cells[2].textContent.trim();
            const referenceRange = row.cells[3].textContent.trim();
            const status = row.cells[4].textContent.trim();
            
            if (value) {
                parameters.push({
                    name,
                    value,
                    unit,
                    referenceRange,
                    status
                });
            }
        });
        
        // Prepare result data
        const resultData = {
            id: document.getElementById('result-id').value || `RES-${Date.now()}`,
            orderId,
            testId,
            testName,
            parameters,
            status,
            notes,
            conclusion,
            validationNotes,
            validatedBy: ['validated', 'rejected'].includes(status) 
                ? document.getElementById('validated-by').value 
                : '',
            sampleId: `M${Math.floor(10000 + Math.random() * 90000)}`,
            sampleDate: new Date().toISOString(),
            resultDate: new Date().toISOString()
        };
        
        try {
            showLoading(true, 'Guardando resultado...');
            
            // In a real app, this would be an API call
            // const method = resultData.id.startsWith('RES-') ? 'POST' : 'PUT';
            // const url = method === 'POST' 
            //     ? `${API_BASE_URL}/results` 
            //     : `${API_BASE_URL}/results/${resultData.id}`;
            // 
            // const response = await fetch(url, {
            //     method,
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            //     },
            //     body: JSON.stringify(resultData)
            // });
            // 
            // if (!response.ok) {
            //     throw new Error('Error al guardar el resultado');
            // }
            // 
            // const result = await response.json();
            
            // Simulate API call with timeout
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Show success message
            showToast(
                resultData.id.startsWith('RES-') 
                    ? 'Resultado guardado correctamente' 
                    : 'Resultado actualizado correctamente',
                'success'
            );
            
            // Close modal and refresh the list
            const modal = bootstrap.Modal.getInstance(document.getElementById('resultModal'));
            if (modal) modal.hide();
            
            await this.loadResults(this.currentPage, this.searchQuery);
            
        } catch (error) {
            console.error('Error saving result:', error);
            showToast('Error al guardar el resultado', 'error');
        } finally {
            showLoading(false);
        }
    }
    
    async viewResult(resultId) {
        try {
            showLoading(true, 'Cargando resultado...');
            
            // In a real app, this would be an API call
            // const response = await fetch(`${API_BASE_URL}/results/${resultId}`, {
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            //     }
            // });
            // 
            // if (!response.ok) {
            //     throw new Error('Error al cargar el resultado');
            // }
            // 
            // const result = await response.json();
            
            // Simulate API call with timeout
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Find result in the list (for demo purposes)
            const result = this.results.find(r => r.id === resultId);
            
            if (!result) {
                throw new Error('Resultado no encontrado');
            }
            
            // In a real app, we would show a detailed view or print a report
            // For now, we'll just show an alert with the result details
            const resultDetails = `
                <div class="mb-3">
                    <h5>Resultado #${result.id}</h5>
                    <p class="mb-1"><strong>Paciente:</strong> ${result.patientName}</p>
                    <p class="mb-1"><strong>Documento:</strong> ${result.patientDocument}</p>
                    <p class="mb-1"><strong>Examen:</strong> ${result.testName}</p>
                    <p class="mb-1"><strong>Muestra:</strong> ${result.sampleId}</p>
                    <p class="mb-1"><strong>Fecha de la muestra:</strong> ${this.formatDate(result.sampleDate, true)}</p>
                    <p class="mb-1"><strong>Fecha del resultado:</strong> ${this.formatDate(result.resultDate, true)}</p>
                    <p class="mb-1"><strong>Estado:</strong> ${this.getStatusText(result.status)}</p>
                    <p class="mb-1"><strong>Resultado:</strong> ${result.result} ${result.unit || ''}</p>
                    <p class="mb-1"><strong>Rango de referencia:</strong> ${result.referenceRange}</p>
                    ${result.notes ? `<p class="mb-1"><strong>Notas:</strong> ${result.notes}</p>` : ''}
                    ${result.validatedBy ? `<p class="mb-1"><strong>Validado por:</strong> ${result.validatedBy}</p>` : ''}
                    ${result.validationNotes ? `<p class="mb-1"><strong>Notas de validación:</strong> ${result.validationNotes}</p>` : ''}
                </div>
            `;
            
            // Show result details in a modal
            const modal = new bootstrap.Modal(document.createElement('div'));
            modal._element.classList.add('modal', 'fade');
            modal._element.innerHTML = `
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Detalles del Resultado</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            ${resultDetails}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            <button type="button" class="btn btn-primary" id="print-result">
                                <i class="fas fa-print me-1"></i> Imprimir
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal._element);
            modal.show();
            
            // Add event listener to print button
            document.getElementById('print-result')?.addEventListener('click', () => {
                window.print();
            });
            
            // Remove modal from DOM after hiding
            modal._element.addEventListener('hidden.bs.modal', () => {
                document.body.removeChild(modal._element);
            });
            
        } catch (error) {
            console.error('Error viewing result:', error);
            showToast(error.message || 'Error al cargar el resultado', 'error');
        } finally {
            showLoading(false);
        }
    }
    
    async editResult(resultId) {
        try {
            showLoading(true, 'Cargando resultado para edición...');
            
            // In a real app, this would be an API call
            // const response = await fetch(`${API_BASE_URL}/results/${resultId}`, {
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            //     }
            // });
            // 
            // if (!response.ok) {
            //     throw new Error('Error al cargar el resultado para edición');
            // }
            // 
            // const result = await response.json();
            
            // Simulate API call with timeout
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Find result in the list (for demo purposes)
            const result = this.results.find(r => r.id === resultId);
            
            if (!result) {
                throw new Error('Resultado no encontrado');
            }
            
            // Show edit modal with result data
            this.showResultModal(result);
            
            // In a real app, we would populate the form with the result data
            // For now, we'll just log it to the console
            console.log('Editing result:', result);
            
        } catch (error) {
            console.error('Error editing result:', error);
            showToast(error.message || 'Error al cargar el resultado para edición', 'error');
        } finally {
            showLoading(false);
        }
    }
    
    async validateResult(resultId) {
        try {
            const confirm = await showConfirm(
                '¿Está seguro de que desea validar este resultado? Esta acción no se puede deshacer.',
                'Confirmar validación'
            );
            
            if (!confirm) return;
            
            showLoading(true, 'Validando resultado...');
            
            // In a real app, this would be an API call
            // const response = await fetch(`${API_BASE_URL}/results/${resultId}/validate`, {
            //     method: 'POST',
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({
            //         validatedBy: 'Current User', // This would come from the authentication context
            //         validationNotes: 'Resultado validado por el laboratorio'
            //     })
            // });
            // 
            // if (!response.ok) {
            //     throw new Error('Error al validar el resultado');
            // }
            
            // Simulate API call with timeout
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Show success message
            showToast('Resultado validado correctamente', 'success');
            
            // Refresh the list
            await this.loadResults(this.currentPage, this.searchQuery);
            
        } catch (error) {
            console.error('Error validating result:', error);
            showToast(error.message || 'Error al validar el resultado', 'error');
        } finally {
            showLoading(false);
        }
    }
    
    async rejectResult(resultId) {
        try {
            // In a real app, this would show a modal to enter rejection reason
            const reason = prompt('Ingrese el motivo del rechazo:');
            
            if (!reason) {
                showToast('Debe ingresar un motivo para rechazar el resultado', 'warning');
                return;
            }
            
            showLoading(true, 'Rechazando resultado...');
            
            // In a real app, this would be an API call
            // const response = await fetch(`${API_BASE_URL}/results/${resultId}/reject`, {
            //     method: 'POST',
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({
            //         rejectedBy: 'Current User', // This would come from the authentication context
            //         rejectionReason: reason
            //     })
            // });
            // 
            // if (!response.ok) {
            //     throw new Error('Error al rechazar el resultado');
            // }
            
            // Simulate API call with timeout
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Show success message
            showToast('Resultado rechazado correctamente', 'success');
            
            // Refresh the list
            await this.loadResults(this.currentPage, this.searchQuery);
            
        } catch (error) {
            console.error('Error rejecting result:', error);
            showToast(error.message || 'Error al rechazar el resultado', 'error');
        } finally {
            showLoading(false);
        }
    }
    
    // Helper methods
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
            'validated': 'Validado',
            'rejected': 'Rechazado'
        };
        
        return statusMap[status] || status;
    }
}
