# Trabajo práctico 07 - Persistencia inicial de reservas de salas

Laura Ivanna Toloza

## 1. Punto de partida

Esta carpeta, `tp-07-salas-mongodb`, es una copia del TP 06 (`tp-06-salas-modular`). El TP 06 quedó intacto. No se copiaron `node_modules`, `.git` ni credenciales.

Se agregó un **laboratorio de persistencia**: lectura de la URI, conexión, el modelo `Reserva` y tres programas de terminal (comprobar la conexión, crear y listar). El sitio Express sigue funcionando igual que en el TP 06, con sus reservas en memoria.

## 2. Versiones y entorno

- Node.js 22.13 o superior.
- Mongoose 9.10.3 (versión exacta, instalada con `--save-exact`).
- Express 5, EJS, express-ejs-layouts y Morgan, como en el TP 06.
- Base de datos: **MongoDB Atlas, clúster gratuito Free (M0)**, base `reservas_salas_u7`, colección `reservas`.

## 3. Preparación desde una descarga nueva

1. `npm install`
2. En MongoDB Atlas, dentro de un proyecto propio, crear (o reutilizar) un clúster **Free / M0**.
3. En el acceso a la base, crear un **usuario de base de datos** con contraseña y permiso de lectura y escritura. No es la cuenta con la que se entra a Atlas.
4. En **Network Access / IP Access List**, agregar la IP pública actual. No habilitar el acceso desde cualquier dirección.
5. En el clúster: **Connect → Drivers → Node.js** y copiar la URI.
6. Copiar `.env.example` como `.env` y reemplazar `USUARIO`, `CLAVE` y `HOST` por los datos reales, con `reservas_salas_u7` como nombre de base (después del host y antes de `?`). Si la contraseña tiene caracteres reservados, codificarlos (por ejemplo `@` → `%40`).

## 4. Comandos

Desde la raíz del proyecto:

```bash
node --env-file=.env scripts/comprobar-conexion.js   # conecta y cierra; no crea nada
node --env-file=.env scripts/crear-reserva.js        # crea UNA reserva por ejecución
node --env-file=.env scripts/listar-reservas.js      # solo lee

npm run format     # Prettier sobre src y scripts
npm run check      # format:check + ESLint sobre src y scripts
npm start          # sitio web en memoria, http://localhost:3000 (no necesita MONGODB_URI)
```

## 5. Mapa de archivos

| Archivo | Responsabilidad |
| --- | --- |
| `src/config/entorno.js` | `leerConfiguracion` (puerto y formato de Morgan, la del TP 06) y `leerUriMongo` (lee y valida `MONGODB_URI`) |
| `src/config/base-datos.js` | `conectarBaseDatos` y `desconectarBaseDatos` con Mongoose |
| `src/modelos/reserva.js` | Esquema y modelo `Reserva`, colección `reservas` |
| `scripts/comprobar-conexion.js` | Prueba de conexión |
| `scripts/crear-reserva.js` | Alta de una reserva ficticia |
| `scripts/listar-reservas.js` | Consulta de todas las reservas |
| `src/index.js` | Solo cambió la importación: `./config/entorno` en lugar de `./configuracion` |
| resto de `src/`, `views/`, `public/` | Sin cambios respecto del TP 06 |

`src/configuracion.js` se eliminó después de trasladar `leerConfiguracion` a `src/config/entorno.js` y actualizar la importación de `src/index.js`. El sitio solo llama a `leerConfiguracion`, por eso arranca sin `MONGODB_URI`.

**Esquema, modelo y colección:** el *esquema* (`reservaSchema`) define los campos y sus reglas; el *modelo* (`Reserva`) es lo que se usa en el código para `create` y `find`; la *colección* (`reservas`) es donde MongoDB guarda los documentos. El nombre de la colección se declara explícitamente con `{ collection: "reservas" }`.

## 6. Campos y reglas

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `estudiante` | String | `required`, `trim` |
| `email` | String | `required`, `trim`, `match: /@/` |
| `sala` | String | `required`, `enum`: Sala Norte, Sala Sur, Sala Multimedia |
| `fecha` | String | `required`, `trim` |
| `turno` | String | `required`, `enum`: Mañana, Tarde, Noche |
| `personas` | Number | `required`, `min: 1`, `max: 6`, `validate` con `Number.isInteger` |

Límites que todavía **no** se controlan: email completo (solo se exige `@`), fechas imposibles o pasadas, solapamiento de reservas en la misma sala y turno, cupos y reservas repetidas. No hay índice único.

Mongoose **convierte** antes de validar: `personas: "4"` se guarda como el número 4; `personas: "abc"` no se puede convertir y se rechaza.

**`_id`:** cada reserva usa el `ObjectId` que genera Mongoose; no se calculan ids con `reduce`. Se convierte a texto solo para mostrarlo. Un objeto con `_id` no demuestra que se haya escrito: Mongoose asigna el `_id` al construir el documento, antes de guardarlo. La prueba es encontrar ese `_id` desde otro proceso.

Ejecutar dos veces `crear-reserva.js` crea dos documentos distintos con los mismos datos, porque no hay regla de unicidad. Es la conducta esperada y no se ocultó borrando registros.

## 7. Pruebas

Las pruebas inválidas se hicieron cambiando temporalmente un solo campo de `scripts/crear-reserva.js`; el archivo quedó restaurado con la reserva válida.

| Caso | Esperado | Observado | Cantidad antes → después |
| --- | --- | --- | --- |
| Conexión válida | Confirmación y fin | | — |
| Variable vacía | Fallo de configuración | | — |
| Contraseña incorrecta temporal | Fallo de autenticación | | — |
| Colección vacía | Cantidad 0, sin error | | 0 |
| Reserva válida | Se guarda y devuelve `_id` | | |
| Consulta desde proceso nuevo | Recupera ese `_id` | | |
| Segunda consulta | No agrega | | |
| Estudiante vacío | Rechazo | | |
| Email sin @ | Rechazo | | |
| Sala o turno no permitido | Rechazo | | |
| Fecha vacía | Rechazo | | |
| Personas 0, 7 y 2.5 | Rechazo | | |
| Personas "abc" | Rechazo de conversión | | |

**Evidencia de persistencia:** transcripción de `listar → crear → listar → listar` (cuatro procesos distintos) y captura de Data Explorer (base `reservas_salas_u7`, colección `reservas`) mostrando el mismo `_id`, recortada sin datos de conexión.

**Continuidad del sitio** con `npm start`: inicio, `/estado` (4 reservas), listado, formulario válido (302) e inválido (400), CSS y 404 siguen funcionando igual que en el TP 06.

## 8. Por qué el sitio sigue en memoria

Las rutas web todavía usan el servicio del TP 06, que trabaja con un arreglo creado desde las reservas iniciales de `src/index.js`. Las reservas creadas con el formulario no llegan a MongoDB, y las creadas con los scripts no aparecen en `/reservas`. Conectar el sitio exige que el servicio y los controladores trabajen con promesas (`async`/`await`), usar `ObjectId` en vez de ids numéricos y abrir la conexión una sola vez al arrancar el servidor: eso se hace en la unidad 8.

## 9. Datos sensibles

El repositorio no incluye `.env`, contraseñas, la URI real ni datos personales: `.env` está en `.gitignore` y `.env.example` solo tiene marcadores. Las reservas de prueba usan datos ficticios.
