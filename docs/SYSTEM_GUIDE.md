# Guía completa — L'Art de la Vie POS

## 1. Propósito

L'Art de la Vie POS es un sistema privado para administrar:

- autenticación y roles del personal;
- apertura y cierre diario de caja;
- productos e inventario;
- punto de venta;
- movimientos de inventario;
- gastos diarios;
- reportes y dashboard.

Esta guía explica la estructura y el recorrido de los datos. No es necesario memorizar cada línea de código: primero hay que comprender dónde ocurre cada responsabilidad.

---

## 2. Arquitectura general

```text
┌─────────────────────────────────────────────┐
│ Usuario                                     │
│ Navegador / computadora de la tienda        │
└──────────────────────┬──────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────┐
│ Frontend React + Vite                       │
│ Vercel                                      │
│ https://l-art-de-la-vie.vercel.app          │
└──────────────────────┬──────────────────────┘
                       │ HTTP + Bearer token
                       ▼
┌─────────────────────────────────────────────┐
│ Backend Node.js + Express                   │
│ Render                                      │
│ https://l-art-de-la-vie.onrender.com        │
└──────────────────────┬──────────────────────┘
                       │ Supabase JS
                       ▼
┌─────────────────────────────────────────────┐
│ Supabase                                    │
│ PostgreSQL + Auth + RLS + Logs              │
└─────────────────────────────────────────────┘
```

### Responsabilidades

| Capa | Responsabilidad |
|---|---|
| React | Interfaz, formularios, navegación y estado visible |
| Express | API, validaciones, autenticación y permisos |
| PostgreSQL | Persistencia, relaciones y operaciones transaccionales |
| Supabase Auth | Usuarios, contraseñas, sesiones y tokens |
| Vercel | Alojamiento del frontend |
| Render | Ejecución del backend Express |
| GitHub | Historial y fuente de los deployments |

---

## 3. Estructura del repositorio

```text
L-Art-de-la-Vie/
├── .git/                         Historial Git principal
├── .gitignore                    Archivos que Git no debe subir
├── README.md                     Inicio rápido
├── docs/
│   └── SYSTEM_GUIDE.md           Este documento
├── l-art-de-la-vie-pos/          Frontend
└── l-art-de-la-vie-api/          Backend y migraciones
```

El frontend antes era un submódulo. Actualmente es una carpeta normal del mismo repositorio, lo que permite seleccionar por separado las carpetas raíz en Vercel y Render.

---

## 4. Frontend: `l-art-de-la-vie-pos`

```text
l-art-de-la-vie-pos/
├── public/                       Imágenes y archivos públicos
├── src/
│   ├── components/               Componentes reutilizables
│   │   └── ui/                   Componentes visuales base
│   ├── context/                  Estado global
│   ├── hooks/                    Hooks reutilizables
│   ├── lib/                      API, Supabase y utilidades
│   ├── pages/                    Pantallas completas
│   ├── types/                    Interfaces TypeScript
│   ├── App.tsx                   Rutas y proveedores
│   └── main.tsx                  Punto de entrada
├── .env                          Variables locales, nunca Git
├── .env.example                  Plantilla de variables
├── package.json                  Dependencias y scripts
├── vercel.json                   Build y rutas SPA
└── vite.config.ts                Configuración de Vite
```

### 4.1 Pantallas

| Archivo | Función |
|---|---|
| `pages/Login.tsx` | Acceso con correo y contraseña |
| `pages/ResetPassword.tsx` | Cambio de contraseña mediante enlace |
| `pages/Dashboard.tsx` | Métricas, gráficos y stock bajo |
| `pages/Inventory.tsx` | Productos y movimientos |
| `pages/POS.tsx` | Carrito, pagos y comprobante |
| `pages/CashClose.tsx` | Gastos, resumen y cierre diario |
| `pages/NotFound.tsx` | Ruta inexistente |

### 4.2 Componentes estructurales

| Archivo | Función |
|---|---|
| `components/AppLayout.tsx` | Sidebar, encabezado y contenido |
| `components/AppSidebar.tsx` | Navegación, usuario, rol y logout |
| `components/CashOpeningDialog.tsx` | Modal obligatorio de apertura diaria |
| `components/NavLink.tsx` | Enlaces que indican la ruta activa |
| `components/ui/*` | Botones, inputs, tablas, diálogos, etc. |

### 4.3 Contextos

#### `AuthContext.tsx`

Mantiene:

- sesión de Supabase;
- usuario autenticado;
- nombre y rol;
- login y logout;
- recuperación de contraseña;
- permiso `canManage`.

```text
Supabase Auth
      │
      ▼
AuthContext
      │
      ├── Login
      ├── AppSidebar
      └── Rutas protegidas
```

#### `StoreContext.tsx`

Mantiene:

- productos;
- ventas;
- movimientos;
- carrito;
- gastos;
- apertura actual;
- cierres;
- acciones CRUD y actualización de datos.

El carrito vive temporalmente en React. La venta existe oficialmente solo después de que Express y PostgreSQL la aceptan.

### 4.4 Comunicación HTTP

`src/lib/api.ts`:

1. Lee `VITE_API_URL`.
2. Obtiene el access token de Supabase.
3. Añade `Authorization: Bearer <token>`.
4. Ejecuta `fetch`.
5. Convierte respuestas fallidas en errores legibles.

```text
VITE_API_URL=https://l-art-de-la-vie.onrender.com/api

api('/store')
→ https://l-art-de-la-vie.onrender.com/api/store
```

### 4.5 Configuración de Supabase del navegador

`src/lib/supabase.ts` crea el cliente público usando:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

La publishable key puede estar en el navegador. La secret/service-role key nunca debe aparecer en variables `VITE_*`.

---

## 5. Backend: `l-art-de-la-vie-api`

```text
l-art-de-la-vie-api/
├── src/
│   ├── server.js                Inicia el servidor
│   ├── app.js                   Middleware y rutas
│   ├── auth.js                  Token y roles
│   ├── supabase.js              Cliente administrativo
│   ├── validation.js            Validación básica
│   └── mappers.js               SQL snake_case → camelCase
├── supabase/
│   ├── migrations/              Evolución de la base
│   └── README.md
├── .env                         Secretos locales
├── .env.example
└── package.json
```

### 5.1 Inicio del servidor

```text
npm start
→ node src/server.js
→ createApp()
→ listen(process.env.PORT)
```

Render proporciona `PORT` automáticamente.

### 5.2 Middleware de `app.js`

Orden simplificado:

```text
Solicitud
  │
  ├── Helmet: cabeceras de seguridad
  ├── CORS: valida el dominio del frontend
  ├── JSON parser
  ├── Rate limiter
  ├── requireAuth
  ├── requireRole, si aplica
  ├── Controlador de la ruta
  └── Manejador de errores
```

### 5.3 Autenticación del backend

`auth.js` recibe:

```http
Authorization: Bearer <access-token>
```

Después:

1. Envía el token a Supabase Auth.
2. Obtiene el usuario auténtico.
3. Busca su membresía en `store_members`.
4. Adjunta `userId`, correo, nombre y rol a `req.auth`.

### 5.4 Roles

| Acción | Owner | Admin | Cashier |
|---|---:|---:|---:|
| Ver dashboard | Sí | Sí | Sí |
| Realizar ventas | Sí | Sí | Sí |
| Registrar gastos | Sí | Sí | Sí |
| Abrir caja | Sí | Sí | Sí |
| Modificar inventario | Sí | Sí | No |
| Eliminar gasto | Sí | Sí | No |
| Cerrar caja | Sí | Sí | No |

### 5.5 Endpoints

| Método | Ruta | Función |
|---|---|---|
| GET | `/` | Información del backend |
| GET | `/api/health` | Comprueba API y Supabase |
| GET | `/api-docs` | Interfaz Swagger/OpenAPI |
| GET | `/api-docs.json` | Especificación OpenAPI en JSON |
| GET | `/api/auth/me` | Usuario y rol actuales |
| GET | `/api/store` | Estado completo de la tienda |
| POST | `/api/cash-openings` | Apertura diaria |
| POST | `/api/products` | Crear producto |
| PUT | `/api/products/:id` | Actualizar producto |
| DELETE | `/api/products/:id` | Desactivar producto |
| POST | `/api/movements` | Entrada o salida |
| POST | `/api/sales` | Completar venta |
| POST | `/api/expenses` | Registrar gasto |
| DELETE | `/api/expenses/:id` | Eliminar gasto abierto |
| POST | `/api/cash-closes` | Cerrar caja |

Swagger en producción: `https://l-art-de-la-vie.onrender.com/api-docs`.

`/api` es una convención definida por el proyecto. Render solo proporciona el dominio.

---

## 6. Base de datos

### 6.1 Tablas

```text
stores
├── store_members ── auth.users
├── products
├── sales
│   └── sale_items
├── inventory_movements
├── expenses
├── cash_openings
└── cash_closes
    └── cash_close_expenses ── expenses
```

| Tabla | Contenido |
|---|---|
| `stores` | Tienda, moneda y zona horaria |
| `profiles` | Nombre visible del usuario |
| `store_members` | Usuario, tienda y rol |
| `products` | Catálogo, precios y stock |
| `sales` | Totales y método de pago |
| `sale_items` | Productos congelados en cada venta |
| `inventory_movements` | Entradas, salidas y ventas |
| `expenses` | Gastos de caja |
| `cash_openings` | Fondo inicial diario |
| `cash_closes` | Resumen y diferencia diaria |
| `cash_close_expenses` | Gastos incluidos en un cierre |
| `product_code_counters` | Consecutivos por categoría |

### 6.2 Claves y relaciones

- `id`: identifica una fila.
- `store_id`: identifica la tienda propietaria.
- `product_id`: conecta un movimiento o línea con un producto.
- `sale_id`: conecta líneas y movimientos con una venta.
- `opened_by`, `sold_by`, `closed_by`: identifican al usuario responsable.
- `unique(store_id, business_date)`: impide dos aperturas o cierres del mismo día.

### 6.3 RLS

Row Level Security limita qué filas puede consultar un usuario autenticado directamente. Express también aplica autorización. Son dos capas diferentes:

```text
Express permissions + PostgreSQL RLS = defensa en profundidad
```

La secret key del backend puede omitir RLS, por lo que Express debe validar siempre el token y el rol antes de operar.

---

## 7. Migraciones

| Archivo | Cambio |
|---|---|
| `001_initial_schema.sql` | Tablas, funciones, RLS y catálogo inicial |
| `002_delete_open_expense.sql` | Eliminación transaccional de gasto abierto |
| `003_auth_bootstrap.sql` | Primer propietario y perfiles |
| `004_auto_product_codes.sql` | Códigos consecutivos por categoría |
| `005_cash_openings.sql` | Apertura diaria y fondo inicial |

### Regla fundamental

```text
Archivo SQL en GitHub ≠ cambio aplicado en Supabase
```

Actualmente las migraciones se aplican copiándolas en Supabase SQL Editor. El orden debe respetarse.

---

## 8. Flujos principales

### 8.1 Login

```text
Login.tsx
→ Supabase signInWithPassword
→ Supabase devuelve sesión
→ api('/auth/me')
→ Express valida token
→ React muestra aplicación
```

### 8.2 Apertura de caja

```text
Nuevo día
→ GET /api/store
→ cashOpening = null
→ modal obligatorio
→ POST /api/cash-openings
→ cash_openings
→ se habilita el sistema
```

### 8.3 Venta

```text
POS.tsx
→ carrito local
→ StoreContext.completeSale
→ POST /api/sales
→ Express verifica caja abierta
→ función complete_sale
   ├── valida stock
   ├── toma precios reales
   ├── crea sale
   ├── crea sale_items
   ├── descuenta stock
   └── crea movimientos
→ respuesta a React
```

### 8.4 Cierre

```text
Fondo inicial
+ ventas en efectivo
- gastos
= efectivo esperado

efectivo contado
- efectivo esperado
= diferencia
```

El cierre guarda también ventas por tarjeta y transferencia, pero estas no entran en el efectivo físico esperado.

---

## 9. Git y GitHub

### Conceptos

| Concepto | Significado |
|---|---|
| Working tree | Archivos actuales |
| Staging area | Cambios preparados con `git add` |
| Commit | Fotografía con mensaje |
| Branch `main` | Línea principal |
| Remote `origin` | Repositorio de GitHub |
| Push | Enviar commits a GitHub |
| Pull | Descargar commits |

### Flujo diario

```bash
git status
git add .
git commit -m "Descripción clara"
git push origin main
```

GitHub activa los auto-deploys de Vercel y Render.

### Archivos que nunca deben subirse

```text
.env
node_modules/
dist/
claves secretas
```

---

## 10. Despliegue

### Vercel

```text
Repositorio: toastserial/L-Art-de-la-Vie
Root Directory: l-art-de-la-vie-pos
Framework: Vite
Build: npm run build
Output: dist
```

Variables:

```env
VITE_API_URL=https://l-art-de-la-vie.onrender.com/api
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

### Render

```text
Repositorio: toastserial/L-Art-de-la-Vie
Root Directory: l-art-de-la-vie-api
Build: npm install
Start: npm start
```

Variables:

```env
FRONTEND_ORIGIN=https://l-art-de-la-vie.vercel.app
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_STORE_ID=00000000-0000-0000-0000-000000000001
```

---

## 11. Monitoreo

### Verificaciones rápidas

| Servicio | URL / ubicación | Resultado esperado |
|---|---|---|
| Frontend | `https://l-art-de-la-vie.vercel.app` | Login o POS |
| Backend | `https://l-art-de-la-vie.onrender.com/` | `status: online` |
| Salud | `/api/health` | `status: ok` |
| Supabase | Logs Explorer | API/Auth/Postgres logs |

### Diagnóstico por síntoma

```text
Pantalla en blanco
→ Vercel Build Logs + consola del navegador

No conecta con backend
→ /api/health + Render Logs + VITE_API_URL

CORS
→ FRONTEND_ORIGIN exacto, sin barra final

Login falla
→ Supabase Auth Logs + membresía store_members

Datos fallan
→ Render Logs + Supabase API/Postgres Logs

Cambio no aparece
→ comparar commit de GitHub, Vercel y Render
```

---

## 12. Seguridad

- La publishable key es para el frontend.
- La secret key es exclusivamente para Express.
- Una secret key mostrada en captura debe rotarse.
- CORS no reemplaza autenticación.
- Ocultar botones no reemplaza permisos del backend.
- RLS no reemplaza validaciones de negocio.
- Los totales y precios importantes se calculan en el servidor/base.

---

## 13. Glosario

| Término | Explicación simple |
|---|---|
| API | Puertas por las que React habla con Express |
| Endpoint | Una puerta específica, por ejemplo `/api/sales` |
| Token | Prueba temporal de sesión |
| CORS | Lista de sitios autorizados a llamar al backend desde navegador |
| CRUD | Crear, leer, actualizar y eliminar |
| RLS | Reglas de acceso por fila en PostgreSQL |
| Migration | Cambio versionado de la base |
| Middleware | Filtro ejecutado antes de la ruta |
| Context | Estado compartido entre componentes React |
| Mapper | Traducción entre formatos de datos |
| Deploy | Publicar una versión |
| Build | Convertir código fuente en archivos ejecutables/publicables |
| Environment variable | Configuración externa al código |

---

## 14. Ruta de estudio sugerida

1. Dibujar las cuatro capas: React, Express, PostgreSQL y Auth.
2. Recorrer `App.tsx` para entender rutas y proveedores.
3. Recorrer `api.ts` y una ruta GET sencilla.
4. Seguir el flujo completo de una venta.
5. Estudiar tablas y relaciones.
6. Estudiar token, roles y RLS.
7. Revisar apertura y cierre.
8. Practicar Git con commits pequeños.
9. Revisar logs de un deployment.
10. Después estudiar detalles de TypeScript, Express y PL/pgSQL.

Para cada pieza, responder:

```text
¿Dónde vive?
¿Qué recibe?
¿Qué produce?
¿Quién tiene permiso?
¿Dónde se guarda?
¿Qué pasa si falla?
```

Si puedes responder esas preguntas, entiendes la estructura aunque todavía no memorices la sintaxis.

---

## 15. Swagger / OpenAPI explicado desde cero

### ¿Qué es?

Swagger es una pantalla que muestra las puertas disponibles del backend.

```text
Frontend usa la API
        │
        ▼
Swagger documenta la API
        │
        ▼
Express ejecuta la API
```

Swagger no reemplaza al backend, no guarda datos y no crea las rutas. Solo lee el archivo OpenAPI y presenta las rutas existentes de una forma navegable.

### Ubicaciones

Producción:

```text
https://l-art-de-la-vie.onrender.com/api-docs
```

OpenAPI en formato JSON:

```text
https://l-art-de-la-vie.onrender.com/api-docs.json
```

Desarrollo local:

```text
http://localhost:3000/api-docs
```

El archivo fuente está en:

```text
l-art-de-la-vie-api/docs/openapi.yaml
```

### Relación entre los archivos

```text
openapi.yaml
   │ describe rutas, modelos y errores
   ▼
swagger-ui-express
   │ convierte la descripción en una página web
   ▼
/api-docs
```

### Cómo leer una ruta en Swagger

Ejemplo:

```text
POST /api/sales
```

- `POST`: se enviará información nueva.
- `/api`: grupo de rutas del backend.
- `/sales`: operación relacionada con ventas.
- `Request body`: datos que debes enviar.
- `Responses`: posibles resultados.
- `201`: venta creada.
- `400`: datos inválidos.
- `401`: no existe sesión válida.
- `409`: conflicto, por ejemplo caja cerrada o stock insuficiente.

### Colores habituales

```text
GET     → consultar
POST    → crear o ejecutar
PUT     → actualizar completamente
DELETE  → eliminar o desactivar
```

### Por qué Swagger solicita autorización

Casi todas las rutas están protegidas. El backend espera:

```http
Authorization: Bearer ACCESS_TOKEN
```

El access token es la prueba temporal de que un usuario inició sesión.

### Cómo obtener el token para estudiar y probar

1. Inicia sesión normalmente en el POS.
2. Abre las herramientas del navegador con `F12`.
3. Entra en `Application`.
4. Abre `Local Storage`.
5. Selecciona el dominio del POS.
6. Busca una clave similar a:

```text
sb-fctoxbgsjwfppzpljnav-auth-token
```

7. Dentro del JSON busca:

```json
{
  "access_token": "TOKEN-TEMPORAL"
}
```

8. Copia únicamente el contenido de `access_token`.
9. Abre `/api-docs`.
10. Pulsa **Authorize**.
11. Pega el token sin escribir la palabra `Bearer`.
12. Pulsa **Authorize** y cierra la ventana.

No compartas el token. Aunque expira, representa tu sesión mientras siga válido.

### Cómo probar sin causar daños

Empieza con rutas de lectura:

```text
GET /api/health
GET /api/auth/me
GET /api/store
```

Proceso:

1. Abre una ruta.
2. Pulsa **Try it out**.
3. Pulsa **Execute**.
4. Observa `Request URL`.
5. Observa `Response code`.
6. Lee `Response body`.

Evita inicialmente ejecutar desde Swagger:

```text
POST /api/sales
POST /api/cash-closes
DELETE /api/products/{id}
DELETE /api/expenses/{id}
```

Estas rutas modifican datos reales de producción.

### Swagger en versión mono

```text
Express tiene puertas.
OpenAPI escribe el mapa de puertas.
Swagger enseña el mapa bonito.
Token entrega la llave.
Try it out abre una puerta real.
```

---

## 16. Qué hacer cuando todo empieza a mezclarse

No intentes sostener toda la aplicación en la memoria. Identifica primero en qué capa estás.

```text
¿Estoy viendo una pantalla?
→ Frontend React

¿Estoy enviando/recibiendo una solicitud?
→ API / Express

¿Estoy guardando o consultando datos?
→ PostgreSQL / Supabase

¿Estoy publicando una versión?
→ GitHub / Vercel / Render

¿Estoy entrando con usuario y contraseña?
→ Supabase Auth
```

### Método de diagnóstico de cinco preguntas

Cuando algo falle, escribe:

1. ¿Qué estaba intentando hacer?
2. ¿Qué pantalla o archivo participa?
3. ¿Qué endpoint se llamó?
4. ¿Qué código HTTP regresó?
5. ¿En qué plataforma están los logs?

Ejemplo:

```text
Intento: iniciar sesión
Pantalla: Login.tsx
Endpoint: /api/auth/me
Código: CORS / request bloqueada
Logs: navegador + Render
```

### Sesión de estudio recomendada

```text
25 minutos: estudiar una sola pieza
5 minutos: caminar, tomar agua, mirar lejos
25 minutos: seguir un solo flujo
10 minutos: escribir un resumen propio
```

Si llevas varias horas, descansar no es perder tiempo. La memoria organiza conceptos durante las pausas. Volver descansado suele resolver en minutos algo que agotado parece imposible.

### Orden mínimo para retomar mañana

```text
1. Leer arquitectura general.
2. Elegir un flujo: login, venta o caja.
3. Seguir solamente ese flujo.
4. Probar sus GET en Swagger.
5. Anotar con tus palabras qué entra y qué sale.
```

No necesitas entender hoy cada componente UI ni cada línea SQL. Tu objetivo inicial es reconocer el camino de los datos.
