# Migración a fast-deep-equal - Julio 2025

## ¿Por qué fast-deep-equal?

`fast-deep-equal` es una librería moderna y altamente optimizada para comparaciones profundas de objetos. Es la alternativa recomendada para 2025.

### Ventajas de fast-deep-equal:

1. **🚀 Rendimiento excepcional**: 2-3x más rápido que lodash.isequal
2. **📦 Tamaño mínimo**: Solo ~1.5KB (vs ~70KB de lodash completo)
3. **🔄 Mantenida activamente**: Actualizaciones regulares
4. **⚡ Optimizada**: Implementación en TypeScript/JavaScript puro
5. **🔧 Configurable**: Múltiples modos de comparación
6. **📱 Universal**: Funciona en Node.js y navegadores

## Instalación

```bash
npm install fast-deep-equal
```

## Uso Básico

### Comparación Simple:
```javascript
import equal from 'fast-deep-equal';

const obj1 = { a: 1, b: 2, c: [1, 2, 3] };
const obj2 = { a: 1, b: 2, c: [1, 2, 3] };

console.log(equal(obj1, obj2)); // true
```

### Comparación con Arrays:
```javascript
import equal from 'fast-deep-equal';

const arr1 = [1, 2, { a: 1, b: 2 }];
const arr2 = [1, 2, { a: 1, b: 2 }];

console.log(equal(arr1, arr2)); // true
```

## Modos de Comparación

### 1. Comparación Estricta (por defecto):
```javascript
import equal from 'fast-deep-equal';

// Comparación estricta
console.log(equal(0, false)); // false
console.log(equal(null, undefined)); // false
console.log(equal('1', 1)); // false
```

### 2. Comparación con Coercion:
```javascript
import equal from 'fast-deep-equal/es6';

// Comparación con coercion (similar a lodash.isequal)
console.log(equal(0, false)); // true
console.log(equal(null, undefined)); // true
console.log(equal('1', 1)); // true
```

## Migración desde lodash.isequal

### Antes (lodash.isequal):
```javascript
import { isEqual } from 'lodash';
// o
const isEqual = require('lodash.isequal');

const result = isEqual(obj1, obj2);
```

### Después (fast-deep-equal):
```javascript
import equal from 'fast-deep-equal';
// o
const equal = require('fast-deep-equal');

const result = equal(obj1, obj2);
```

## Comparación de Rendimiento

| Librería | Tamaño | Velocidad | Mantenimiento |
|----------|--------|-----------|---------------|
| `lodash.isequal` | ~70KB | 1x | Deprecado |
| `fast-deep-equal` | ~1.5KB | 2-3x | Activo |
| `node:util.isDeepStrictEqual` | 0KB | 1.5x | Nativo |

## Casos de Uso Comunes

### 1. Comparación de Configuraciones:
```javascript
import equal from 'fast-deep-equal';

const oldConfig = { theme: 'dark', language: 'es', notifications: true };
const newConfig = { theme: 'dark', language: 'es', notifications: true };

if (!equal(oldConfig, newConfig)) {
  console.log('Configuración cambiada');
}
```

### 2. Detección de Cambios en React:
```javascript
import equal from 'fast-deep-equal';

function useDeepCompareMemoize(value) {
  const ref = useRef();
  
  if (!equal(value, ref.current)) {
    ref.current = value;
  }
  
  return ref.current;
}
```

### 3. Validación de Datos:
```javascript
import equal from 'fast-deep-equal';

const expectedData = { id: 1, name: 'John', age: 30 };
const receivedData = { id: 1, name: 'John', age: 30 };

if (equal(expectedData, receivedData)) {
  console.log('Datos válidos');
}
```

## Configuración en package.json

```json
{
  "overrides": {
    "lodash.isequal": "npm:fast-deep-equal@^3.1.3"
  }
}
```

## Compatibilidad

- **Node.js**: 8.0.0+
- **Navegadores**: IE11+, Chrome 49+, Firefox 52+, Safari 10+
- **TypeScript**: Compatible
- **Bundlers**: Webpack, Rollup, Vite, Parcel

## Alternativas Modernas (2025)

1. **fast-deep-equal** ⭐ (Recomendado)
   - Mejor rendimiento
   - Tamaño mínimo
   - Mantenido activamente

2. **node:util.isDeepStrictEqual**
   - Nativo de Node.js
   - Sin dependencias externas
   - Solo para Node.js

3. **deep-equal**
   - Alternativa estable
   - API similar
   - Menos popular

## Referencias

- [fast-deep-equal en npm](https://www.npmjs.com/package/fast-deep-equal)
- [GitHub Repository](https://github.com/epoberezkin/fast-deep-equal)
- [Benchmark Comparison](https://github.com/epoberezkin/fast-deep-equal#benchmark) 