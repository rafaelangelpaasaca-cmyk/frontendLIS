// Toast notification system
export function showToast(message, type = 'info', duration = 5000) {
    // Create toast container if it doesn't exist
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast show align-items-center text-white bg-${getBootstrapColor(type)} border-0`;
    toast.role = 'alert';
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    // Create toast content
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="${getIcon(type)} me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    // Add to container
    container.appendChild(toast);

    // Auto remove after duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
            // Remove container if no more toasts
            if (container.children.length === 0) {
                container.remove();
            }
        }, 300);
    }, duration);

    // Handle manual close
    const closeBtn = toast.querySelector('[data-bs-dismiss="toast"]');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
                if (container && container.children.length === 0) {
                    container.remove();
                }
            }, 300);
        });
    }

    return toast;
}

// Get appropriate Bootstrap color class
function getBootstrapColor(type) {
    const colors = {
        success: 'success',
        error: 'danger',
        warning: 'warning',
        info: 'info',
        primary: 'primary',
        secondary: 'secondary',
        dark: 'dark',
        light: 'light'
    };
    return colors[type] || 'primary';
}

// Get appropriate icon
function getIcon(type) {
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle',
        primary: 'fas fa-bell',
        secondary: 'fas fa-bell',
        dark: 'fas fa-bell',
        light: 'fas fa-bell'
    };
    return icons[type] || 'fas fa-info-circle';
}

// Confirm dialog
export async function showConfirm(message, title = 'Confirmar acción') {
    return new Promise((resolve) => {
        // Create modal container
        const modalId = 'confirmModal' + Date.now();
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = modalId;
        modal.tabIndex = '-1';
        modal.setAttribute('aria-hidden', 'true');

        // Modal content
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${message}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="confirmButton">Aceptar</button>
                    </div>
                </div>
            </div>
        `;

        // Add to body
        document.body.appendChild(modal);

        // Initialize Bootstrap modal
        const modalInstance = new bootstrap.Modal(modal);
        
        // Show modal
        modalInstance.show();

        // Handle confirm button click
        const confirmButton = modal.querySelector('#confirmButton');
        confirmButton.addEventListener('click', () => {
            modalInstance.hide();
            resolve(true);
            // Remove modal from DOM after hiding
            modal.addEventListener('hidden.bs.modal', () => {
                document.body.removeChild(modal);
            }, { once: true });
        });

        // Handle cancel/close
        modal.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modal);
            resolve(false);
        }, { once: true });
    });
}

// Loading spinner
export function showLoading(show = true, message = 'Cargando...') {
    let spinner = document.getElementById('loadingSpinner');
    
    if (show) {
        if (!spinner) {
            spinner = document.createElement('div');
            spinner.id = 'loadingSpinner';
            spinner.className = 'loading-overlay';
            spinner.innerHTML = `
                <div class="spinner-container">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    ${message ? `<p class="mt-2">${message}</p>` : ''}
                </div>
            `;
            document.body.appendChild(spinner);
        }
    } else if (spinner) {
        spinner.remove();
    }
}

// Add loading overlay styles if they don't exist
if (!document.getElementById('loadingStyles')) {
    const style = document.createElement('style');
    style.id = 'loadingStyles';
    style.textContent = `
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(255, 255, 255, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            backdrop-filter: blur(2px);
        }
        .spinner-container {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 10px;
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        }
    `;
    document.head.appendChild(style);
}
