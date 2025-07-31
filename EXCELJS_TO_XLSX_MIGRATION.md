# Migración de exceljs a xlsx - Julio 2025

## Problema Resuelto

`exceljs` era la fuente principal de dependencias deprecadas en el proyecto:
- `inflight@1.0.6` (fugas de memoria)
- `rimraf@2.7.1` (versión obsoleta)
- `lodash.isequal@4.5.0` (deprecado)
- `glob@7.2.3` (versión obsoleta)
- `fstream@1.0.12` (no soportado)

## Solución Implementada

Reemplazamos `exceljs@4.4.0` con `xlsx@0.18.5`, una librería más moderna y sin dependencias deprecadas.

### Ventajas de xlsx:

1. **🚀 Sin dependencias deprecadas**: No tiene las dependencias problemáticas de exceljs
2. **📦 Más ligero**: Menos dependencias transitivas
3. **🔄 Mantenido activamente**: Actualizaciones regulares
4. **⚡ Mejor rendimiento**: Más rápido para operaciones básicas
5. **📱 Universal**: Funciona en Node.js y navegadores
6. **🔧 API más simple**: Más fácil de usar

## Comparación de Dependencias

### Antes (exceljs):
```
exceljs@4.4.0
├── archiver@5.3.2
│   ├── archiver-utils@2.1.0
│   │   └── glob@7.2.3 (deprecado)
│   └── zip-stream@4.1.1
│       └── archiver-utils@3.0.4
│           └── glob@7.2.3 (deprecado)
├── fast-csv@4.3.6
│   └── @fast-csv/format@4.3.5
│       └── lodash.isequal@4.5.0 (deprecado)
└── unzipper@0.10.14
    └── fstream@1.0.12 (no soportado)
```

### Después (xlsx):
```
xlsx@0.18.5
└── (sin dependencias deprecadas)
```

## Migración de Código

### Antes (exceljs):
```javascript
import ExcelJS from 'exceljs';

const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Sheet1');

worksheet.addRow(['Name', 'Age']);
worksheet.addRow(['John', 30]);

await workbook.xlsx.writeFile('output.xlsx');
```

### Después (xlsx):
```javascript
import * as XLSX from 'xlsx';

const data = [
  ['Name', 'Age'],
  ['John', 30]
];

const worksheet = XLSX.utils.aoa_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

XLSX.writeFile(workbook, 'output.xlsx');
```

## Funcionalidades Principales

### Lectura de archivos:
```javascript
import * as XLSX from 'xlsx';

// Leer archivo Excel
const workbook = XLSX.readFile('data.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet);
```

### Escritura de archivos:
```javascript
import * as XLSX from 'xlsx';

// Crear archivo Excel
const data = [
  { name: 'John', age: 30 },
  { name: 'Jane', age: 25 }
];

const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

XLSX.writeFile(workbook, 'users.xlsx');
```

### Manipulación de datos:
```javascript
import * as XLSX from 'xlsx';

// Convertir array a worksheet
const arrayData = [['A', 'B'], [1, 2], [3, 4]];
const worksheet = XLSX.utils.aoa_to_sheet(arrayData);

// Convertir objeto a worksheet
const objectData = [{ name: 'John', age: 30 }, { name: 'Jane', age: 25 }];
const worksheet = XLSX.utils.json_to_sheet(objectData);
```

## Resultados Obtenidos

### Antes:
- 5 warnings de dependencias deprecadas
- 84 paquetes adicionales (dependencias transitivas)
- Dependencias obsoletas y con problemas de seguridad

### Después:
- 0 warnings de dependencias deprecadas
- Solo 1 paquete (xlsx)
- Dependencias modernas y seguras

## Configuración en package.json

```json
{
  "dependencies": {
    "xlsx": "^0.18.5"
  }
}
```

## Compatibilidad

- **Node.js**: 8.0.0+
- **Navegadores**: IE11+, Chrome 49+, Firefox 52+, Safari 10+
- **TypeScript**: Compatible
- **Bundlers**: Webpack, Rollup, Vite, Parcel

## Referencias

- [xlsx en npm](https://www.npmjs.com/package/xlsx)
- [GitHub Repository](https://github.com/SheetJS/sheetjs)
- [Documentación oficial](https://docs.sheetjs.com/) 