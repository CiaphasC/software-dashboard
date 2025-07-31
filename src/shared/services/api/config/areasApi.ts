// Servicio para obtener áreas/departamentos del sistema
export interface Area {
  value: string;
  label: string;
}

// Áreas predefinidas del sistema
const SYSTEM_AREAS: Area[] = [
  { value: 'TI', label: 'Tecnología de la Información' },
  { value: 'RRHH', label: 'Recursos Humanos' },
  { value: 'CONTABILIDAD', label: 'Contabilidad' },
  { value: 'FINANZAS', label: 'Finanzas' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'VENTAS', label: 'Ventas' },
  { value: 'OPERACIONES', label: 'Operaciones' },
  { value: 'LEGAL', label: 'Legal' },
  { value: 'ADMINISTRACION', label: 'Administración' },
  { value: 'LOGISTICA', label: 'Logística' },
  { value: 'PRODUCCION', label: 'Producción' },
  { value: 'CALIDAD', label: 'Calidad' },
  { value: 'MANTENIMIENTO', label: 'Mantenimiento' },
  { value: 'SEGURIDAD', label: 'Seguridad' },
  { value: 'GERENCIA', label: 'Gerencia' },
  { value: 'OTRO', label: 'Otro' },
];

export const areasApi = {
  // Obtener todas las áreas del sistema
  async getAreas(): Promise<Area[]> {
    await new Promise(resolve => setTimeout(resolve, 200)); // Simular delay de red
    return [...SYSTEM_AREAS];
  },

  // Obtener área por valor
  async getAreaByValue(value: string): Promise<Area | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return SYSTEM_AREAS.find(area => area.value === value) || null;
  },

  // Buscar áreas por término
  async searchAreas(searchTerm: string): Promise<Area[]> {
    await new Promise(resolve => setTimeout(resolve, 150));
    const term = searchTerm.toLowerCase();
    return SYSTEM_AREAS.filter(area => 
      area.label.toLowerCase().includes(term) || 
      area.value.toLowerCase().includes(term)
    );
  }
}; 