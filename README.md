# Sistema LIS (Laboratory Information System) - Frontend

Aplicación web para la gestión de un Laboratorio Clínico, que permite administrar pacientes, órdenes de laboratorio y resultados de exámenes.

## Características Principales

- **Gestión de Pacientes**: Registro y administración de información de pacientes.
- **Órdenes de Laboratorio**: Creación y seguimiento de órdenes de exámenes.
- **Resultados de Exámenes**: Registro y consulta de resultados de laboratorio.
- **Panel de Control**: Visualización de estadísticas y métricas importantes.
- **Autenticación**: Sistema de inicio de sesión seguro.

## Tecnologías Utilizadas

- **Frontend**:
  - HTML5, CSS3, JavaScript (ES6+)
  - [Bootstrap 5](https://getbootstrap.com/) - Framework CSS
  - [Font Awesome](https://fontawesome.com/) - Iconos
  - Módulos JavaScript nativos (ES Modules)

## Estructura del Proyecto

```
frontendLIS/
├── assets/
│   └── css/
│       └── styles.css
├── js/
│   ├── app.js          # Punto de entrada de la aplicación
│   ├── router.js       # Enrutador de la aplicación
│   ├── config.js       # Configuración global
│   ├── services/       # Servicios (API, autenticación, etc.)
│   │   └── auth.service.js
│   └── utils/          # Utilidades
│       └── notifications.js
└── views/              # Vistas de la aplicación
    ├── dashboard.view.js
    ├── patients.view.js
    ├── orders.view.js
    └── results.view.js
```

## Requisitos del Sistema

- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Node.js (opcional, solo si se desea usar el servidor de desarrollo)

## Instalación y Ejecución

### Opción 1: Servidor Web Local (Recomendado)

1. Clona el repositorio o descarga los archivos
2. Abre una terminal en la carpeta del proyecto
3. Ejecuta uno de los siguientes comandos:

   **Con Python 3:**
   ```bash
   python3 -m http.server 8000
   ```

   **Con Node.js:**
   ```bash
   npx http-server -p 8000
   ```

4. Abre tu navegador y ve a `http://localhost:8000`

### Opción 2: Extensión de VS Code

1. Instala la extensión "Live Server" en VS Code
2. Haz clic derecho en `index.html`
3. Selecciona "Open with Live Server"

## Uso

1. Inicia sesión con tus credenciales
2. Navega por las diferentes secciones usando el menú superior:
   - **Inicio**: Panel de control con estadísticas
   - **Pacientes**: Gestión de pacientes
   - **Órdenes**: Administración de órdenes de laboratorio
   - **Resultados**: Registro y consulta de resultados

## Desarrollo

### Estructura de Vistas

Cada vista sigue el siguiente patrón:

```javascript
export class NombreVista {
    constructor() {
        // Inicialización de propiedades
    }

    async render() {
        // Retorna el HTML de la vista
        return `
            <div>Contenido de la vista</div>
        `;
    }

    async init() {
        // Inicialización de eventos y lógica
    }
}
```

### Convenciones de Código

- Usar clases para organizar el código
- Seguir el patrón de módulos ES6
- Usar async/await para operaciones asíncronas
- Documentar funciones y clases con JSDoc

## Licencia

Este proyecto está bajo la licencia MIT.
