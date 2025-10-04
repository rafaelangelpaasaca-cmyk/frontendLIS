import { showLoading } from '../js/utils/notifications.js';
import { API_BASE_URL, APP_CONFIG } from '../js/config.js';

export class DashboardView {
    async render() {
        return `
            <div class="container-fluid">
                <h2 class="mb-4">Panel de Control</h2>
                
                <!-- Stats Cards -->
                <div class="row mb-4">
                    <div class="col-md-3 mb-3">
                        <div class="card stat-card">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="text-muted mb-1">Pacientes Hoy</h6>
                                        <h3 class="mb-0" id="patients-today">0</h3>
                                    </div>
                                    <div class="icon-circle bg-primary-light">
                                        <i class="fas fa-users text-primary"></i>
                                    </div>
                                </div>
                                <div class="small mt-2">
                                    <span class="text-success"><i class="fas fa-arrow-up"></i> 12%</span> desde ayer
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-3 mb-3">
                        <div class="card stat-card">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="text-muted mb-1">Órdenes Pendientes</h6>
                                        <h3 class="mb-0" id="pending-orders">0</h3>
                                    </div>
                                    <div class="icon-circle bg-warning-light">
                                        <i class="fas fa-clipboard-list text-warning"></i>
                                    </div>
                                </div>
                                <div class="small mt-2">
                                    <span class="text-danger"><i class="fas fa-arrow-down"></i> 5%</span> desde ayer
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-3 mb-3">
                        <div class="card stat-card">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="text-muted mb-1">Exámenes Completados</h6>
                                        <h3 class="mb-0" id="completed-tests">0</h3>
                                    </div>
                                    <div class="icon-circle bg-success-light">
                                        <i class="fas fa-vial text-success"></i>
                                    </div>
                                </div>
                                <div class="small mt-2">
                                    <span class="text-success"><i class="fas fa-arrow-up"></i> 8%</span> desde ayer
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-3 mb-3">
                        <div class="card stat-card">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="text-muted mb-1">Ingresos Hoy</h6>
                                        <h3 class="mb-0">$<span id="today-income">0</span></h3>
                                    </div>
                                    <div class="icon-circle bg-info-light">
                                        <i class="fas fa-dollar-sign text-info"></i>
                                    </div>
                                </div>
                                <div class="small mt-2">
                                    <span class="text-success"><i class="fas fa-arrow-up"></i> 15%</span> desde ayer
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Activity and Quick Actions -->
                <div class="row">
                    <!-- Recent Activity -->
                    <div class="col-lg-8 mb-4">
                        <div class="card h-100">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">Actividad Reciente</h5>
                                <a href="#" class="btn btn-sm btn-outline-primary">Ver Todo</a>
                            </div>
                            <div class="card-body p-0">
                                <div class="list-group list-group-flush" id="recent-activity">
                                    <!-- Activity items will be added here by JavaScript -->
                                    <div class="text-center py-5">
                                        <div class="spinner-border text-primary" role="status">
                                            <span class="visually-hidden">Cargando...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Quick Actions -->
                    <div class="col-lg-4">
                        <div class="card mb-4">
                            <div class="card-header">
                                <h5 class="mb-0">Acciones Rápidas</h5>
                            </div>
                            <div class="card-body">
                                <div class="d-grid gap-2">
                                    <a href="#patients" data-route="patients" class="btn btn-outline-primary text-start mb-2">
                                        <i class="fas fa-user-plus me-2"></i> Nuevo Paciente
                                    </a>
                                    <a href="#orders" data-route="orders" class="btn btn-outline-primary text-start mb-2">
                                        <i class="fas fa-clipboard-list me-2"></i> Crear Orden
                                    </a>
                                    <a href="#results" data-route="results" class="btn btn-outline-primary text-start mb-2">
                                        <i class="fas fa-vial me-2"></i> Registrar Resultados
                                    </a>
                                    <a href="#" class="btn btn-outline-secondary text-start mb-2">
                                        <i class="fas fa-file-export me-2"></i> Generar Reporte
                                    </a>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Upcoming Appointments -->
                        <div class="card">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">Próximas Citas</h5>
                                <a href="#" class="btn btn-sm btn-outline-primary">Ver Calendario</a>
                            </div>
                            <div class="card-body p-0">
                                <div class="list-group list-group-flush" id="upcoming-appointments">
                                    <!-- Appointments will be added here by JavaScript -->
                                    <div class="text-center py-4">
                                        <div class="spinner-border spinner-border-sm text-primary" role="status">
                                            <span class="visually-hidden">Cargando...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                .icon-circle {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                }
                .bg-primary-light { background-color: rgba(13, 110, 253, 0.1); }
                .bg-success-light { background-color: rgba(25, 135, 84, 0.1); }
                .bg-warning-light { background-color: rgba(255, 193, 7, 0.1); }
                .bg-info-light { background-color: rgba(13, 202, 240, 0.1); }
                .bg-danger-light { background-color: rgba(220, 53, 69, 0.1); }
                .activity-item {
                    padding: 1rem;
                    border-left: 3px solid transparent;
                    transition: all 0.3s ease;
                }
                .activity-item:hover {
                    background-color: #f8f9fa;
                    border-left-color: #0d6efd;
                }
                .activity-time {
                    font-size: 0.75rem;
                    color: #6c757d;
                }
                .appointment-item {
                    padding: 0.75rem 1rem;
                    border-left: 3px solid transparent;
                    transition: all 0.3s ease;
                }
                .appointment-item:hover {
                    background-color: #f8f9fa;
                }
                .appointment-time {
                    font-weight: 600;
                    color: #0d6efd;
                }
            </style>
        `;
    }

    async init() {
        // In a real app, these would be API calls
        this.simulateDataLoading();
    }

    simulateDataLoading() {
        // Simulate API calls with timeouts
        setTimeout(() => {
            // Update stats
            document.getElementById('patients-today').textContent = '24';
            document.getElementById('pending-orders').textContent = '18';
            document.getElementById('completed-tests').textContent = '42';
            document.getElementById('today-income').textContent = '1,845';
            
            // Add recent activity
            const activities = [
                { 
                    icon: 'fa-user-plus text-primary',
                    text: 'Nuevo paciente registrado: Juan Pérez',
                    time: 'Hace 5 minutos'
                },
                { 
                    icon: 'fa-vial text-success',
                    text: 'Resultados completados para la orden #ORD-2023-0042',
                    time: 'Hace 15 minutos'
                },
                { 
                    icon: 'fa-clipboard-check text-info',
                    text: 'Orden #ORD-2023-0041 ha sido aprobada',
                    time: 'Hace 30 minutos'
                },
                { 
                    icon: 'fa-file-export text-warning',
                    text: 'Reporte mensual generado por el sistema',
                    time: 'Hace 1 hora'
                },
                { 
                    icon: 'fa-user-md text-danger',
                    text: 'Cita agendada con el Dr. García para mañana',
                    time: 'Hace 2 horas'
                }
            ];
            
            const activityHtml = activities.map(activity => `
                <div class="activity-item">
                    <div class="d-flex">
                        <div class="flex-shrink-0 me-3">
                            <i class="fas ${activity.icon} fa-lg"></i>
                        </div>
                        <div class="flex-grow-1">
                            <div>${activity.text}</div>
                            <div class="activity-time">${activity.time}</div>
                        </div>
                    </div>
                </div>
            `).join('');
            
            document.getElementById('recent-activity').innerHTML = activityHtml;
            
            // Add upcoming appointments
            const appointments = [
                { time: '09:00 AM', patient: 'María González', type: 'Perfil Lipídico' },
                { time: '10:30 AM', patient: 'Carlos Rodríguez', type: 'Hemograma Completo' },
                { time: '11:15 AM', patient: 'Ana Martínez', type: 'Prueba de Glucosa' },
                { time: '02:00 PM', patient: 'Luis Sánchez', type: 'Prueba de Tiroides' },
                { time: '03:30 PM', patient: 'Elena Ramírez', type: 'Perfil Hepático' }
            ];
            
            const appointmentsHtml = appointments.map(apt => `
                <div class="appointment-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="appointment-time">${apt.time}</span>
                        <span class="badge bg-light text-dark">${apt.type}</span>
                    </div>
                    <div class="fw-medium">${apt.patient}</div>
                </div>
            `).join('');
            
            document.getElementById('upcoming-appointments').innerHTML = appointmentsHtml;
            
        }, 1000);
    }
}
