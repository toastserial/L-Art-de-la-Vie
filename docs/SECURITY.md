# Seguridad de L'Art de la Vie

## La idea principal

La pestaña **Red/Network** del navegador siempre muestra las solicitudes hechas por ese navegador. No se puede ocultar `/api/auth/me`, `/api/store` ni el token al propietario de la computadora. Intentar esconderlos con JavaScript solamente cambia su apariencia; no agrega seguridad.

La protección real consiste en que cada solicitud:

1. requiera una sesión válida;
2. compruebe el rol del usuario;
3. acepte solamente datos válidos;
4. devuelva solamente los campos necesarios;
5. no permita acceder directamente a la base de datos.

## Flujo protegido

```text
Web o app móvil
  -> Supabase Auth valida correo y contraseña
  -> Express recibe el access token
  -> Express comprueba usuario y rol
  -> Express valida los datos
  -> Express consulta Supabase con service_role
  -> Express devuelve una respuesta limitada
```

La clave `SUPABASE_SERVICE_ROLE_KEY` vive exclusivamente en Render. La web y la app usan la clave publishable, que identifica el proyecto pero no concede por sí sola acceso a las tablas.

## Protecciones aplicadas

- `/api/auth/me` devuelve solamente `fullName` y `role`; no devuelve correo ni UUID.
- Las respuestas de la API usan `Cache-Control: no-store` y no generan ETag, evitando copias privadas y respuestas `304` con datos del negocio.
- CORS acepta solamente los orígenes configurados en `FRONTEND_ORIGIN`.
- Hay límites de solicitudes generales, escrituras y carga de fotografías.
- Los cuerpos JSON tienen un límite de 100 KB.
- IDs, textos, cantidades, dinero, categorías y métodos de pago se validan con listas y rangos permitidos.
- Las ventas rechazan carritos vacíos, duplicados o excesivamente grandes.
- Las imágenes se verifican por su contenido binario real, no solamente por su extensión o MIME declarado.
- Los errores internos de PostgreSQL no se entregan al navegador. El usuario recibe un mensaje genérico y un `requestId` para buscar el incidente en Render.
- Render recibe un log estructurado por cada llamada real a la API con ruta, estado, duración, UUID y rol. Nunca se registran tokens, correos, contraseñas, cuerpos ni query strings.
- Helmet y Vercel agregan cabeceras contra clickjacking, MIME sniffing y carga de recursos no autorizados.
- En la web, la sesión se guarda en `sessionStorage`; se elimina al cerrar el navegador, adecuado para una caja compartida.
- La migración `202607140002_backend_only_access.sql` revoca a `anon` y `authenticated` el acceso directo a tablas y RPC comerciales. Todo pasa por Express.

## Por qué una inyección SQL no entra aquí

El backend no construye consultas concatenando texto enviado por el usuario. Usa el cliente de Supabase con filtros (`eq`, `insert`, `update`) y RPC con argumentos separados. Las funciones PostgreSQL usan consultas SQL estáticas, no `EXECUTE` dinámico. Además, los UUID, números y valores enumerados se validan antes de consultar.

Ejemplo peligroso que **no** se usa:

```js
`select * from products where id = '${req.params.id}'`
```

Patrón usado:

```js
supabase.from("products").select("...").eq("id", productId)
```

## Activación en producción

1. En Supabase, abre **SQL Editor**.
2. Ejecuta `l-art-de-la-vie-api/supabase/migrations/202607140002_backend_only_access.sql`.
3. Sube el código a GitHub.
4. Espera el redeploy de Render y Vercel.
5. Cierra la sesión web anterior, cierra el navegador y vuelve a iniciar sesión.
6. Comprueba una venta, un producto, una foto, un gasto y el cierre de caja con cada rol relevante.

## Variables que deben permanecer secretas

- `SUPABASE_SERVICE_ROLE_KEY`: solamente Render; nunca GitHub, Vercel, Expo ni una captura.
- Contraseñas de usuarios: nunca se guardan en el código.
- Deploy hooks y tokens de GitHub/EAS: no compartir.

Las variables `VITE_SUPABASE_PUBLISHABLE_KEY` y `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` son públicas por diseño. Su seguridad depende de permisos/RLS correctos, no de ocultarlas.

## Si una clave secreta se filtra

1. Rota inmediatamente la clave en Supabase.
2. Actualiza `SUPABASE_SERVICE_ROLE_KEY` en Render.
3. Redeploya el backend.
4. Revisa los logs de Supabase y Render.
5. No basta con borrar la clave de Git: una clave publicada debe considerarse comprometida.

## Revisión periódica

- Mensual: `npm audit` en las tres aplicaciones y revisión de usuarios/roles.
- Después de cada cambio: build web, typecheck móvil y prueba del backend.
- Trimestral: rotación de accesos administrativos y revisión de logs.
- Siempre: copias de seguridad de Supabase y autenticación multifactor para las cuentas de GitHub, Supabase, Render y Vercel.
