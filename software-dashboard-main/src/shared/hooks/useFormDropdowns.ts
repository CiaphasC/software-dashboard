import { useState, useEffect, useCallback } from 'react';

// =============================================================================
// USE FORM DROPDOWNS HOOK - Hook reutilizable para dropdowns personalizados
// Arquitectura de Software Profesional - Gestión de Dropdowns
// =============================================================================

interface DropdownOption {
  id: string;
  label: string;
  value: string;
  [key: string]: any;
}

interface UseFormDropdownsProps {
  options: DropdownOption[];
  initialValue?: string;
  onSelect?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const useFormDropdowns = ({
  options,
  initialValue = '',
  onSelect,
  placeholder = 'Selecciona una opción',
  disabled = false
}: UseFormDropdownsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(initialValue);

  // Manejar selección
  const handleSelect = useCallback((value: string) => {
    setSelectedValue(value);
    setIsOpen(false);
    onSelect?.(value);
  }, [onSelect]);

  // Obtener label del valor seleccionado
  const getSelectedLabel = useCallback(() => {
    if (!selectedValue) return '';
    const option = options.find(opt => opt.value === selectedValue);
    return option?.label || '';
  }, [selectedValue, options]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Actualizar valor cuando cambie initialValue
  useEffect(() => {
    setSelectedValue(initialValue);
  }, [initialValue]);

  return {
    isOpen,
    setIsOpen,
    selectedValue,
    selectedLabel: getSelectedLabel(),
    handleSelect,
    placeholder,
    disabled
  };
};

// =============================================================================
// HOOK ESPECÍFICO PARA DROPDOWNS DE ÁREAS
// =============================================================================

interface Area {
  id: number;
  name: string;
  description?: string;
}

interface UseAreasDropdownProps {
  areas: Area[];
  initialValue?: string;
  onSelect?: (area: Area) => void;
  disabled?: boolean;
}

export const useAreasDropdown = ({
  areas,
  initialValue = '',
  onSelect,
  disabled = false
}: UseAreasDropdownProps) => {
  const dropdownOptions = areas.map(area => ({
    id: area.id.toString(),
    label: area.name,
    value: area.id.toString(),
    area
  }));

  const { isOpen, setIsOpen, selectedValue, selectedLabel, handleSelect } = useFormDropdowns({
    options: dropdownOptions,
    initialValue,
    placeholder: 'Selecciona un área',
    disabled,
    onSelect: (value) => {
      const area = areas.find(a => a.id.toString() === value);
      if (area) onSelect?.(area);
    }
  });

  return {
    isOpen,
    setIsOpen,
    selectedValue,
    selectedLabel,
    handleSelect,
    disabled
  };
};

// =============================================================================
// HOOK ESPECÍFICO PARA DROPDOWNS DE USUARIOS
// =============================================================================

interface User {
  id: string;
  name: string;
  email: string;
  role_name: string;
  department_id?: number;
}

interface UseUsersDropdownProps {
  users: User[];
  initialValue?: string;
  onSelect?: (userId: string) => void;
  disabled?: boolean;
}

export const useUsersDropdown = ({
  users,
  initialValue = '',
  onSelect,
  disabled = false
}: UseUsersDropdownProps) => {
  const dropdownOptions = users.map(user => ({
    id: user.id,
    label: `${user.name} (${user.role_name})`,
    value: user.id,
    user
  }));

  const { isOpen, setIsOpen, selectedValue, selectedLabel, handleSelect } = useFormDropdowns({
    options: dropdownOptions,
    initialValue,
    placeholder: 'Selecciona un usuario',
    disabled,
    onSelect
  });

  return {
    isOpen,
    setIsOpen,
    selectedValue,
    selectedLabel,
    handleSelect,
    disabled
  };
};

// =============================================================================
// HOOK ESPECÍFICO PARA DROPDOWNS DE TIPOS
// =============================================================================

interface TypeOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface UseTypeDropdownProps {
  types: TypeOption[];
  initialValue?: string;
  onSelect?: (type: string) => void;
  disabled?: boolean;
}

export const useTypeDropdown = ({
  types,
  initialValue = '',
  onSelect,
  disabled = false
}: UseTypeDropdownProps) => {
  const dropdownOptions = types.map(type => ({
    id: type.value,
    label: type.label,
    value: type.value,
    icon: type.icon
  }));

  const { isOpen, setIsOpen, selectedValue, selectedLabel, handleSelect } = useFormDropdowns({
    options: dropdownOptions,
    initialValue,
    placeholder: 'Selecciona un tipo',
    disabled,
    onSelect
  });

  return {
    isOpen,
    setIsOpen,
    selectedValue,
    selectedLabel,
    handleSelect,
    disabled
  };
};

// =============================================================================
// HOOK ESPECÍFICO PARA DROPDOWNS DE PRIORIDAD
// =============================================================================

interface PriorityOption {
  value: string;
  label: string;
  color: string;
  icon?: React.ReactNode;
}

interface UsePriorityDropdownProps {
  priorities: PriorityOption[];
  initialValue?: string;
  onSelect?: (priority: string) => void;
  disabled?: boolean;
}

export const usePriorityDropdown = ({
  priorities,
  initialValue = '',
  onSelect,
  disabled = false
}: UsePriorityDropdownProps) => {
  const dropdownOptions = priorities.map(priority => ({
    id: priority.value,
    label: priority.label,
    value: priority.value,
    color: priority.color,
    icon: priority.icon
  }));

  const { isOpen, setIsOpen, selectedValue, selectedLabel, handleSelect } = useFormDropdowns({
    options: dropdownOptions,
    initialValue,
    placeholder: 'Selecciona una prioridad',
    disabled,
    onSelect
  });

  return {
    isOpen,
    setIsOpen,
    selectedValue,
    selectedLabel,
    handleSelect,
    disabled
  };
}; 