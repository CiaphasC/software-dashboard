# 🪟 Sistema de Modales - Arquitectura Modular

## 📋 Índice
- [Visión General](#visión-general)
- [Arquitectura](#arquitectura)
- [Componentes](#componentes)
- [Uso](#uso)
- [Ejemplos](#ejemplos)
- [Principios de Diseño](#principios-de-diseño)
- [Mejores Prácticas](#mejores-prácticas)

## 🎯 Visión General

El sistema de modales está diseñado siguiendo principios de **ingeniería de software profesional**, **arquitectura modular** y **patrones de diseño modernos**. Proporciona una base sólida y reutilizable para todos los modales de la aplicación.

### 🏗️ Características Principales

- ✅ **Modularidad**: Componentes independientes y reutilizables
- ✅ **Accesibilidad**: Soporte completo para lectores de pantalla
- ✅ **Animaciones**: Transiciones suaves y profesionales
- ✅ **Responsive**: Adaptable a todos los tamaños de pantalla
- ✅ **TypeScript**: Tipado completo y seguro
- ✅ **Customizable**: Altamente configurable para diferentes casos de uso

## 🏛️ Arquitectura

### Estructura de Componentes

```
Modal System
├── Modal (Core Component)
│   ├── ModalHeader
│   ├── ModalContent
│   ├── ModalFooter
│   └── ModalContainer
├── Examples
│   ├── ConfirmationModal
│   ├── InfoModal
│   ├── SimpleFormModal
│   └── SettingsModal
└── Utilities
    ├── Types & Interfaces
    ├── Constants
    └── Animations
```

### Principios Arquitectónicos

1. **Single Responsibility Principle**: Cada componente tiene una responsabilidad específica
2. **Open/Closed Principle**: Extensible sin modificar código existente
3. **Dependency Inversion**: Dependencias a través de interfaces
4. **Composition over Inheritance**: Uso de composición para flexibilidad

## 🧩 Componentes

### Modal (Core)

Componente base que maneja la lógica de presentación, animaciones y accesibilidad.

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  animation?: 'fade' | 'slide' | 'scale' | 'none';
  zIndex?: number;
}
```

### ModalHeader

Encabezado del modal con título, subtítulo, icono y botón de cerrar.

```typescript
interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
}
```

### ModalContent

Contenedor para el contenido principal del modal.

```typescript
interface ModalContentProps {
  children: ReactNode;
  className?: string;
}
```

### ModalFooter

Pie del modal para botones de acción.

```typescript
interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}
```

### ModalContainer

Contenedor visual que proporciona el estilo base y efectos.

```typescript
interface ModalContainerProps {
  children: ReactNode;
  showGlowEffect?: boolean;
  glowColor?: 'emerald' | 'blue' | 'purple' | 'orange' | 'red';
}
```

## 🚀 Uso

### Uso Básico

```tsx
import { Modal, ModalHeader, ModalContent, ModalFooter, ModalContainer } from '@/shared/components/ui';

const MyModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="lg">
      <ModalContainer showGlowEffect glowColor="emerald">
        <ModalHeader
          title="Mi Modal"
          subtitle="Descripción del modal"
          icon={<Plus className="h-6 w-6 text-white" />}
          onClose={() => setIsOpen(false)}
        />
        
        <ModalContent>
          <p>Contenido del modal</p>
        </ModalContent>

        <ModalFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={() => setIsOpen(false)}>
            Confirmar
          </Button>
        </ModalFooter>
      </ModalContainer>
    </Modal>
  );
};
```

### Uso Avanzado

```tsx
<Modal 
  isOpen={isOpen} 
  onClose={handleClose}
  size="2xl"
  animation="slide"
  closeOnOverlayClick={false}
  zIndex={100}
>
  <ModalContainer 
    showGlowEffect 
    glowColor="purple"
    className="custom-modal-class"
  >
    {/* Contenido personalizado */}
  </ModalContainer>
</Modal>
```

## 📚 Ejemplos

### Modal de Confirmación

```tsx
<ConfirmationModal
  isOpen={isOpen}
  onClose={handleClose}
  onConfirm={handleConfirm}
  title="Eliminar Elemento"
  message="¿Estás seguro de que quieres eliminar este elemento?"
  type="danger"
  confirmText="Eliminar"
/>
```

### Modal de Información

```tsx
<InfoModal
  isOpen={isOpen}
  onClose={handleClose}
  title="Información Importante"
>
  <div>
    <p>Contenido informativo...</p>
    <div className="bg-blue-50 p-4 rounded-lg">
      <p>Información adicional...</p>
    </div>
  </div>
</InfoModal>
```

### Modal de Formulario

```tsx
<SimpleFormModal
  isOpen={isOpen}
  onClose={handleClose}
  onSubmit={handleSubmit}
  title="Nuevo Usuario"
  fields={[
    { name: 'name', label: 'Nombre', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'notes', label: 'Notas', type: 'textarea' }
  ]}
/>
```

## 🎨 Principios de Diseño

### 1. Consistencia Visual
- Paleta de colores unificada
- Espaciado consistente
- Tipografía coherente
- Animaciones uniformes

### 2. Accesibilidad
- Soporte para navegación por teclado
- Roles ARIA apropiados
- Focus management
- Contraste adecuado

### 3. UX Moderna
- Animaciones suaves
- Feedback visual inmediato
- Estados de carga
- Manejo de errores

### 4. Performance
- Lazy loading de componentes
- Optimización de re-renders
- Memoización cuando es necesario
- Bundle splitting

## ✅ Mejores Prácticas

### 1. Nomenclatura
```typescript
// ✅ Correcto
const UserSettingsModal = () => { ... }
const ConfirmationModal = () => { ... }

// ❌ Incorrecto
const Modal = () => { ... }
const Popup = () => { ... }
```

### 2. Gestión de Estado
```typescript
// ✅ Correcto
const [isModalOpen, setIsModalOpen] = useState(false);

// ❌ Incorrecto
const [open, setOpen] = useState(false);
```

### 3. Manejo de Eventos
```typescript
// ✅ Correcto
const handleModalClose = () => {
  setIsModalOpen(false);
  // Limpiar estado si es necesario
};

// ❌ Incorrecto
const closeModal = () => setIsModalOpen(false);
```

### 4. Composición
```typescript
// ✅ Correcto - Usar composición
<Modal isOpen={isOpen} onClose={handleClose}>
  <ModalContainer>
    <ModalHeader title="Título" />
    <ModalContent>Contenido</ModalContent>
    <ModalFooter>Botones</ModalFooter>
  </ModalContainer>
</Modal>

// ❌ Incorrecto - Evitar props drilling
<Modal 
  isOpen={isOpen} 
  onClose={handleClose}
  title="Título"
  content="Contenido"
  buttons={[...]}
/>
```

## 🔧 Configuración

### Tamaños Disponibles
- `sm`: 384px (max-w-sm)
- `md`: 448px (max-w-md)
- `lg`: 512px (max-w-lg)
- `xl`: 576px (max-w-xl)
- `2xl`: 672px (max-w-2xl)
- `full`: 100% (max-w-full)

### Animaciones Disponibles
- `fade`: Fade in/out
- `slide`: Slide from bottom
- `scale`: Scale in/out
- `none`: Sin animación

### Colores de Glow
- `emerald`: Verde esmeralda
- `blue`: Azul
- `purple`: Púrpura
- `orange`: Naranja
- `red`: Rojo

## 🧪 Testing

### Unit Tests
```typescript
describe('Modal Component', () => {
  it('should render when isOpen is true', () => {
    render(<Modal isOpen={true} onClose={jest.fn()}>Content</Modal>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(<Modal isOpen={false} onClose={jest.fn()}>Content</Modal>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
```

### Integration Tests
```typescript
describe('Modal Integration', () => {
  it('should close on overlay click', () => {
    const onClose = jest.fn();
    render(<Modal isOpen={true} onClose={onClose}>Content</Modal>);
    
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalled();
  });
});
```

## 📈 Roadmap

### Fase 1 - Core Features ✅
- [x] Modal base component
- [x] Header, Content, Footer components
- [x] Container component
- [x] Basic animations
- [x] Accessibility support

### Fase 2 - Advanced Features 🚧
- [ ] Modal stacking (múltiples modales)
- [ ] Custom animations
- [ ] Drag & drop support
- [ ] Keyboard shortcuts
- [ ] Focus trap

### Fase 3 - Enterprise Features 📋
- [ ] Modal templates
- [ ] Form builders
- [ ] Wizard modals
- [ ] Multi-step forms
- [ ] Advanced validation

## 🤝 Contribución

### Guías de Contribución
1. Sigue los principios de diseño establecidos
2. Mantén la consistencia con el sistema existente
3. Escribe tests para nuevas funcionalidades
4. Documenta cambios y nuevas APIs
5. Revisa el código antes de hacer PR

### Estructura de Commits
```
feat(modal): add new confirmation modal type
fix(modal): resolve accessibility issue with keyboard navigation
docs(modal): update usage examples
test(modal): add unit tests for modal animations
```

---

**Desarrollado con ❤️ siguiendo estándares de ingeniería de software profesional** 