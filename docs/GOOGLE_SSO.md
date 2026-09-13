# Google SSO para el personal

Google comprueba la identidad; la aplicación decide quién puede entrar. Un correo de Google que no esté en `staff_access_allowlist` no recibe membresía y el backend le responde `403`.

## 1. Preparar Supabase

Ejecuta primero `202609120001_staff_access_allowlist.sql` en **Supabase > SQL Editor**. La migración conserva las cuentas que ya tenían acceso.

Después de desplegar backend y POS, el propietario puede agregar o retirar correos en **POS > Personal**. También puedes cargar los cinco correos iniciales manualmente con SQL:

```sql
insert into public.staff_access_allowlist (store_id, email, role)
values
  ('00000000-0000-0000-0000-000000000001', 'persona1@gmail.com', 'owner'),
  ('00000000-0000-0000-0000-000000000001', 'persona2@gmail.com', 'admin'),
  ('00000000-0000-0000-0000-000000000001', 'persona3@gmail.com', 'cashier')
on conflict (store_id, email)
do update set role = excluded.role, active = true;
```

Desde **POS > Personal** usa **Retirar**. Esto elimina la autorización y la membresía de esa persona. La alternativa SQL es:

```sql
delete from public.staff_access_allowlist
where store_id = '00000000-0000-0000-0000-000000000001'
  and email = 'persona3@gmail.com';
```

## 2. Crear las credenciales de Google

1. En Google Cloud crea o selecciona un proyecto.
2. Configura **Google Auth Platform** con los scopes `openid`, `userinfo.email` y `userinfo.profile`.
3. Si la aplicación queda en modo de prueba, agrega esos mismos correos como usuarios de prueba.
4. Crea un **OAuth Client ID** de tipo **Web application**.
5. Agrega como orígenes autorizados:
   - `http://localhost:8080`
   - el dominio real del POS en Vercel, sin ruta final.
6. Google debe usar como redirect URI el callback que muestra Supabase en **Authentication > Providers > Google**. Tiene la forma:
   - `https://TU-PROYECTO.supabase.co/auth/v1/callback`

## 3. Conectar Google con Supabase

En **Supabase > Authentication > Providers > Google** activa el proveedor y pega el Client ID y Client Secret. En **URL Configuration** incluye el origen local y el dominio real del POS entre las redirect URLs permitidas.

## 4. App móvil POS

La app móvil usa el mismo proveedor de Google y la misma lista de personal autorizado. Agrega esta URL exacta en **Supabase > Authentication > URL Configuration > Redirect URLs**:

```
lartdelavie://auth/callback
```

Esa es la dirección privada que devuelve al APK después de terminar en Google. Como la app ya declara el esquema `lartdelavie`, funciona al reconstruir o actualizar el APK con Expo/EAS.

Para probar en **Expo Go**, la URL de redirección puede cambiar con cada servidor de desarrollo (`exp://.../--/auth/callback`). Es más confiable probar Google en un APK/development build; si se prueba en Expo Go, agrega temporalmente la URL que imprima Expo a la misma lista de Redirect URLs.

## 5. Mostrar el botón en POS web

Después de probar la configuración, define en `.env` y en Vercel:

```env
VITE_GOOGLE_AUTH_ENABLED=true
```

Reinicia Vite en local o vuelve a desplegar Vercel. El botón se muestra por defecto; solamente se oculta al definir `VITE_GOOGLE_AUTH_ENABLED=false`. El acceso por contraseña continúa funcionando en ambos casos.

## Verificación

1. Prueba con un correo incluido en la lista: debe entrar y conservar su rol.
2. Prueba con otro correo: Google puede autenticarlo, pero la aplicación debe cerrar su sesión y mostrar que no tiene acceso.
3. No uses solamente los usuarios de prueba de Google como seguridad. La lista de Supabase es la autorización permanente.

Referencia: [Supabase: Login with Google](https://supabase.com/docs/guides/auth/social-login/auth-google).
