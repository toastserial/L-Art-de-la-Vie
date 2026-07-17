# Correos de L'Art de la Vie

Plantillas listas para pegar en `Supabase Dashboard > Authentication > Email Templates`.

| Pantalla de Supabase | Asunto recomendado | Archivo |
| --- | --- | --- |
| Confirm signup | `Confirma tu cuenta | L'Art de la Vie` | `confirm-signup.html` |
| Reset password | `Recupera tu acceso | L'Art de la Vie` | `reset-password.html` |
| Password changed | `Tu contraseña fue actualizada | L'Art de la Vie` | `password-changed.html` |

## Instalación

1. Entra al proyecto de Supabase.
2. Abre `Authentication > Email Templates`.
3. Selecciona la plantilla correspondiente.
4. Copia el asunto de la tabla.
5. Copia todo el contenido del archivo HTML correspondiente.
6. Pégalo en el editor y guarda.
7. Envía un correo de prueba registrando una cuenta de prueba.

No reemplaces `{{ .ConfirmationURL }}`. Supabase sustituye esa variable por el enlace seguro y único de cada solicitud.

Para la app móvil, conserva también `lartdelavieclientes://**` dentro de `Authentication > URL Configuration > Redirect URLs`.

## Página intermedia de confirmación

La tienda incluye la ruta `/auth/confirmed`. Cuando esté desplegada:

1. Agrega `https://TU-DOMINIO/auth/confirmed` a las Redirect URLs de Supabase.
2. Configura `EXPO_PUBLIC_AUTH_REDIRECT_URL=https://TU-DOMINIO/auth/confirmed` en el build de la app de clientes.
3. Conserva `VITE_CUSTOMER_APP_URL=lartdelavieclientes://auth/confirm` en la tienda web.

Supabase confirma el enlace, abre la página web y el botón `Regresar a la app` entrega la sesión a la aplicación instalada.
