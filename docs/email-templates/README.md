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

La aplicación móvil para compradores fue retirada. No configures el esquema
`lartdelavieclientes://` ni variables `EXPO_PUBLIC_AUTH_REDIRECT_URL` o
`VITE_CUSTOMER_APP_URL`; pertenecían exclusivamente a esa aplicación.
