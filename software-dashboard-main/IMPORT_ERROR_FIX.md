# 🔧 Solución Error de Importación - formatDateTime

## 📋 **Problema Identificado**

### **Error:**
```
Uncaught SyntaxError: The requested module '/src/shared/utils/utils.ts?t=1754298944955' does not provide an export named 'formatDateTime' (at StatusChangeModal.tsx:31:10)
```

### **Causa Raíz:**
El archivo `StatusChangeModal.tsx` estaba intentando importar `formatDateTime` directamente desde `@/shared/utils/utils`, pero esta función está dentro del hook `useFormatters()` y no está siendo exportada como una función independiente.

## 🛠️ **Solución Implementada**

### **1. Archivo Problemático (`src/features/incidents/components/StatusChangeModal.tsx`)**

#### **Antes:**
```typescript
import { formatDateTime } from '@/shared/utils/utils';

// Uso incorrecto
<p className="text-xs text-gray-400">{formatDateTime(new Date())}</p>
```

#### **Después:**
```typescript
import { useFormatters } from '@/shared/utils/utils';

export const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  // ... props
}) => {
  const { user } = useAuthStore();
  const { formatDateTime } = useFormatters(); // Hook correcto
  
  // Uso correcto
  <p className="text-xs text-gray-400">{formatDateTime(new Date())}</p>
}
```

### **2. Estructura Correcta en `utils.ts`**

#### **Hook useFormatters:**
```typescript
export function useFormatters() {
  const { config } = useSettingsStore();
  const locale = config.general.language === 'es' ? 'es-PE' : 'en-US';
  const tz = config.general.timezone || 'America/Lima';
  const dateFormat = config.general.dateFormat || 'dd/MM/yyyy';
  const currencyCode = config.general.currency || 'PEN';

  function formatDateTime(date: Date | string) {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    let options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit', 
      timeZone: tz 
    };
    return new Intl.DateTimeFormat(locale, options).format(d);
  }

  return { formatDate, formatDateTime, formatMoney, locale, tz, dateFormat, currencyCode };
}
```

## 🎯 **Patrón de Uso Correcto**

### **Para usar funciones de formateo:**

#### **1. Importar el hook:**
```typescript
import { useFormatters } from '@/shared/utils/utils';
```

#### **2. Usar dentro del componente:**
```typescript
const MyComponent = () => {
  const { formatDateTime, formatDate, formatMoney } = useFormatters();
  
  return (
    <div>
      <p>Fecha: {formatDate(new Date())}</p>
      <p>Fecha y hora: {formatDateTime(new Date())}</p>
      <p>Moneda: {formatMoney(1000)}</p>
    </div>
  );
};
```

## 🔧 **Funciones Disponibles en useFormatters**

### **formatDate(date: Date | string):**
- Formatea solo la fecha
- Respeta la configuración de zona horaria y formato
- Ejemplo: "25/12/2024"

### **formatDateTime(date: Date | string):**
- Formatea fecha y hora
- Respeta la configuración de zona horaria
- Ejemplo: "25/12/2024 14:30"

### **formatMoney(amount: number):**
- Formatea cantidades monetarias
- Respeta la configuración de moneda
- Ejemplo: "S/ 1,000.00"

### **Configuración disponible:**
- `locale`: Configuración de idioma
- `tz`: Zona horaria
- `dateFormat`: Formato de fecha
- `currencyCode`: Código de moneda

## 🚀 **Beneficios de la Solución**

1. **Consistencia:** Todas las funciones de formateo están centralizadas
2. **Configuración:** Respeta la configuración del usuario
3. **Mantenibilidad:** Un solo lugar para cambiar formatos
4. **Reutilización:** Hook reutilizable en toda la aplicación
5. **TypeScript:** Tipado completo y seguro

## 🔍 **Verificación de Otros Archivos**

### **Archivos que exportan formatDateTime:**
1. **`src/shared/utils/utils.ts`** - Hook `useFormatters()`
2. **`src/shared/utils/dateUtils.ts`** - Función independiente

### **Recomendación:**
- Usar `useFormatters()` para funciones que necesiten configuración del usuario
- Usar `dateUtils.ts` para funciones de utilidad general

## 🎯 **Próximos Pasos**

Si se encuentran otros archivos con el mismo problema:

1. **Identificar:** Buscar importaciones directas de `formatDateTime`
2. **Reemplazar:** Cambiar por `useFormatters()`
3. **Verificar:** Asegurar que el hook se use correctamente
4. **Probar:** Confirmar que funciona sin errores

## 📊 **Archivos Modificados**

1. **`src/features/incidents/components/StatusChangeModal.tsx`**
   - ✅ Importación corregida
   - ✅ Hook `useFormatters()` implementado
   - ✅ Uso correcto de `formatDateTime`

## 🎯 **Conclusión**

El error se resolvió correctamente implementando el patrón de hook `useFormatters()` en lugar de importar directamente la función. Esto asegura que las funciones de formateo respeten la configuración del usuario y mantengan consistencia en toda la aplicación. 