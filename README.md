# Sistema de Gestión de Incidencias y Requerimientos

Una aplicación web moderna para la gestión de incidencias y requerimientos, construida con React 19, TypeScript y Tailwind CSS.

## 🚀 Características

### Funcionalidades Implementadas (RF01-RF12)

- **RF01**: Registro de incidencias en tiempo real con tipo, prioridad, área y descripción
- **RF02**: Asignación de responsables y fechas estimadas de solución
- **RF03**: Actualización de estados de incidencias con observaciones y evidencia
- **RF04**: Generación automática de reportes exportables
- **RF05**: Registro de requerimientos de documentos físicos y digitales
- **RF06**: Marcado de requerimientos como atendidos con evidencia
- **RF07**: Dashboard con métricas clave y visualizaciones
- **RF08**: Sistema de búsqueda y filtros avanzados
- **RF09**: Alertas automáticas por correo electrónico
- **RF10**: Exportación de datos en CSV/Excel
- **RF11**: Sistema de permisos por perfiles (admin, técnico, solicitante)
- **RF12**: Registro de tiempos de solución para análisis

## 🏗️ Arquitectura

### Patrones de Diseño Implementados

1. **Clean Architecture**: Separación clara de responsabilidades
2. **Feature-Based Structure**: Organización por características
3. **Component Composition Pattern**: Componentes reutilizables
4. **Custom Hooks Pattern**: Lógica de negocio reutilizable
5. **Context API Pattern**: Gestión de estado global
6. **Service Layer Pattern**: Separación de lógica de negocio
7. **Repository Pattern**: Abstracción de acceso a datos

### Estructura de Carpetas

```
src/
├── components/           # Componentes reutilizables
│   ├── ui/              # Componentes de interfaz base
│   ├── layout/          # Componentes de layout
│   ├── incidents/       # Componentes específicos de incidencias
│   ├── requirements/    # Componentes específicos de requerimientos
│   └── forms/           # Formularios
├── features/            # Características organizadas por dominio
│   ├── incidents/       # Feature de incidencias
│   │   ├── hooks/       # Hooks específicos
│   │   ├── components/  # Componentes específicos
│   │   └── services/    # Servicios específicos
│   └── requirements/    # Feature de requerimientos
├── hooks/               # Hooks globales
├── services/            # Servicios de API
├── types/               # Definiciones de tipos TypeScript
├── schemas/             # Esquemas de validación Zod
├── lib/                 # Utilidades y configuraciones
└── pages/               # Páginas de la aplicación
```

## 🛠️ Tecnologías

- **Frontend**: React 19 con TypeScript
- **Styling**: Tailwind CSS 4
- **Routing**: React Router DOM v6
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: React Hot Toast
- **Build Tool**: Vite

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/CiaphasC/software-dashboard.git
cd software-dashboard

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

## 🔐 Credenciales de Prueba

### Administrador
- **Email**: admin@empresa.com
- **Contraseña**: admin123
- **Rol**: Administrador completo

### Técnico
- **Email**: tecnico@empresa.com
- **Contraseña**: tecnico123
- **Rol**: Gestión de incidencias y requerimientos

### Solicitante
- **Email**: solicitante@empresa.com
- **Contraseña**: solicitante123
- **Rol**: Creación de solicitudes

## 🎯 Principios SOLID Aplicados

### Single Responsibility Principle (SRP)
- Cada componente tiene una responsabilidad única
- Los hooks manejan lógica específica de dominio
- Los servicios se encargan únicamente de la comunicación con APIs

### Open/Closed Principle (OCP)
- Los componentes UI son extensibles mediante props
- Los hooks permiten composición sin modificación
- Los servicios pueden extenderse sin cambiar el código existente

### Liskov Substitution Principle (LSP)
- Los componentes pueden ser reemplazados por variantes
- Los hooks mantienen contratos consistentes
- Los tipos TypeScript garantizan compatibilidad

### Interface Segregation Principle (ISP)
- Interfaces específicas para cada tipo de componente
- Props opcionales para funcionalidades adicionales
- Hooks especializados para casos de uso específicos

### Dependency Inversion Principle (DIP)
- Dependencias inyectadas mediante props
- Abstracción de servicios mediante interfaces
- Uso de Context API para inyección de dependencias

## 📊 Métricas y Reportes

### Dashboard
- Total de incidencias y requerimientos
- Tiempo promedio de resolución
- Gráficos de tendencias mensuales
- Departamentos con más actividad

### Reportes
- Exportación en PDF y Excel
- Filtros por fecha, tipo y estado
- Métricas de rendimiento
- Análisis de patrones

## 🔔 Sistema de Notificaciones

- Alertas automáticas por tiempo de atención
- Notificaciones en tiempo real
- Emails automáticos a responsables
- Recordatorios de fechas límite

## 🚀 Roadmap

### Próximas Características
- [ ] Modo oscuro
- [ ] Notificaciones push
- [ ] Integración con sistemas externos
- [ ] API REST completa
- [ ] Tests automatizados
- [ ] PWA (Progressive Web App)
- [ ] Multiidioma
- [ ] Auditoría de cambios

### Mejoras Técnicas
- [ ] Implementación de React Query
- [ ] Optimización de rendimiento
- [ ] Lazy loading de componentes
- [ ] Code splitting
- [ ] Service Workers
- [ ] Offline support

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas, contacta al equipo de desarrollo.
