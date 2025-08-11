// =============================================================================
// TRANSFORMERS COMPARTIDOS
// =============================================================================
// Funciones de transformación de filas de BD a DTOs estables para el API.
// =============================================================================

export function toUserDTO(row: any) {
  return {
    ...row,
    department: {
      id: row.department_id ?? null,
      name: row.department_name ?? null,
      short_name: row.department_short_name ?? null,
    },
  }
}