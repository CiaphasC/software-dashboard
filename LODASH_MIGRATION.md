# Migración de lodash.isequal a node:util.isDeepStrictEqual

## Problema

El paquete `lodash.isequal` está deprecado y el autor recomienda usar `node:util.isDeepStrictEqual` en su lugar.

## Solución

### Antes (Deprecado):
```javascript
import { isEqual } from 'lodash';
// o
const isEqual = require('lodash.isequal');

const result = isEqual(obj1, obj2);
```

### Después (Recomendado):
```javascript
import { isDeepStrictEqual } from 'node:util';
// o
const { isDeepStrictEqual } = require('node:util');

const result = isDeepStrictEqual(obj1, obj2);
```

## Diferencias Importantes

### `lodash.isequal`:
- Comparación "suave" (coercion de tipos)
- `null` y `undefined` se consideran iguales
- `0` y `false` se consideran iguales en algunos casos

### `node:util.isDeepStrictEqual`:
- Comparación estricta (sin coercion de tipos)
- `null` y `undefined` son diferentes
- `0` y `false` son diferentes
- Más predecible y consistente

## Ejemplos de Migración

### Ejemplo 1: Comparación de objetos
```javascript
// Antes
import { isEqual } from 'lodash';
const obj1 = { a: 1, b: 2 };
const obj2 = { a: 1, b: 2 };
console.log(isEqual(obj1, obj2)); // true

// Después
import { isDeepStrictEqual } from 'node:util';
const obj1 = { a: 1, b: 2 };
const obj2 = { a: 1, b: 2 };
console.log(isDeepStrictEqual(obj1, obj2)); // true
```

### Ejemplo 2: Comparación con valores falsy
```javascript
// Antes (lodash.isequal)
import { isEqual } from 'lodash';
console.log(isEqual(null, undefined)); // true
console.log(isEqual(0, false)); // true

// Después (node:util.isDeepStrictEqual)
import { isDeepStrictEqual } from 'node:util';
console.log(isDeepStrictEqual(null, undefined)); // false
console.log(isDeepStrictEqual(0, false)); // false
```

## Ventajas de node:util.isDeepStrictEqual

1. **Nativo de Node.js**: No requiere dependencias externas
2. **Mejor rendimiento**: Implementación optimizada en C++
3. **Comportamiento predecible**: Comparación estricta sin sorpresas
4. **Mantenido activamente**: Parte del core de Node.js
5. **TypeScript-friendly**: Tipos incluidos en @types/node

## Compatibilidad

- **Node.js**: 9.0.0+
- **TypeScript**: Compatible con @types/node
- **Browsers**: No disponible (solo Node.js)

## Nota sobre Overrides

Los overrides de npm no soportan el protocolo `node:` para módulos nativos. Por lo tanto, la migración debe hacerse manualmente en el código donde se use `lodash.isequal`.

## Verificación

Para verificar que la migración funciona correctamente:

```javascript
import { isDeepStrictEqual } from 'node:util';

// Pruebas básicas
console.log(isDeepStrictEqual({ a: 1 }, { a: 1 })); // true
console.log(isDeepStrictEqual({ a: 1 }, { a: 2 })); // false
console.log(isDeepStrictEqual([1, 2, 3], [1, 2, 3])); // true
console.log(isDeepStrictEqual(null, undefined)); // false
```

## Referencias

- [Node.js util.isDeepStrictEqual](https://nodejs.org/api/util.html#utilisdeepstrictequalval1-val2)
- [Lodash isEqual deprecation](https://www.npmjs.com/package/lodash.isequal) 