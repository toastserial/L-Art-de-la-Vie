# Análisis de productos con Cloudflare Workers AI

La aplicación usa Cloudflare Workers AI para mirar la fotografía completa y proponer datos editables de cualquier clase de producto: nombre, categoría existente, categoría nueva sugerida, descripción, marca, color, material, tipo y texto visible.

El modelo principal es `@cf/meta/llama-4-scout-17b-16e-instruct`. El backend envía la imagen directamente a la API REST de Cloudflare; no hace falta crear ni publicar un Worker.

## Cómo funciona

1. La app móvil toma o selecciona una fotografía y permite recortarla.
2. La fotografía se envía al backend privado de L'Art.
3. El backend llama a Cloudflare con un formato JSON estricto.
4. La app llena solamente los datos que la IA pudo sostener visualmente.
5. Si no existe una categoría precisa, muestra una propuesta reutilizable con el botón **Crear y usar**.
6. La persona revisa y corrige todo antes de pulsar **Guardar**.

Cloudflare es el primer intento. Gemini queda como respaldo opcional y Cloud Vision como respaldo básico. Ninguna credencial de IA se incluye en la aplicación móvil.

## Costo y límites

Workers AI está disponible en el plan gratuito. Cloudflare publica una asignación gratuita de **10,000 neuronas por día**; el contador se reinicia diariamente. En el plan Free, al excederla las solicitudes dejan de procesarse en vez de generar un cobro automático. El consumo exacto depende del tamaño de la imagen y de la respuesta del modelo.

La aplicación conserva además un tope propio de 100 análisis por tienda al mes, configurable con `PRODUCT_ANALYSIS_MONTHLY_LIMIT`. Los límites y precios de Cloudflare pueden cambiar, por lo que conviene revisar su documentación oficial:

- [Precios de Workers AI](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [Documentación de Workers AI](https://developers.cloudflare.com/workers-ai/)
- [Modelo Llama 4 Scout](https://developers.cloudflare.com/workers-ai/models/llama-4-scout-17b-16e-instruct/)

## 1. Crear la cuenta y el token

1. Entra a [Cloudflare Dashboard](https://dash.cloudflare.com/) y crea una cuenta o inicia sesión.
2. En el menú de Cloudflare abre **Workers AI**.
3. Pulsa **Use REST API**.
4. En la sección de autenticación pulsa **Create a Workers AI API Token**.
5. Revisa el token propuesto y pulsa **Create Token**.
6. Copia el token inmediatamente y guárdalo en un administrador de contraseñas. Cloudflare no vuelve a mostrar el valor completo.
7. Copia también el **Account ID** que aparece en esa misma pantalla o en la página de resumen de la cuenta.

Si en vez del botón preconfigurado creas un token personalizado, agrega los permisos **Workers AI — Read** y **Workers AI — Edit** para la cuenta correcta. La guía oficial del flujo REST está en [Get started with REST API](https://developers.cloudflare.com/workers-ai/get-started/rest-api/).

No pegues el token en el chat, GitHub, Expo, Vite ni archivos que vayan a publicarse.

## 2. Configurar Render

1. Entra a [Render Dashboard](https://dashboard.render.com/).
2. Abre el servicio web del backend de L'Art de la Vie.
3. Entra a **Environment**.
4. Agrega estas variables y sustituye solamente los valores de ejemplo:

```text
CLOUDFLARE_ACCOUNT_ID=tu_account_id
CLOUDFLARE_API_TOKEN=tu_token_privado
CLOUDFLARE_AI_MODEL=@cf/meta/llama-4-scout-17b-16e-instruct
PRODUCT_ANALYSIS_MONTHLY_LIMIT=100
```

5. Guarda los cambios.
6. Render iniciará un nuevo despliegue; espera hasta que el estado sea **Live**.

`CLOUDFLARE_AI_MODEL` es opcional porque el mismo modelo ya es el valor predeterminado. Se incluye para que resulte visible qué modelo utiliza producción.

No es necesario agregar `GEMINI_API_KEY` ni `GOOGLE_VISION_API_KEY`. Si ya existen, pueden permanecer como respaldos; Cloudflare siempre se intenta primero.

## 3. Probar en la aplicación

1. Abre la app del personal e inicia sesión como propietaria o administradora.
2. Entra a **Inventario** y crea un producto.
3. Toma una fotografía clara o selecciónala de la galería.
4. Procura que el producto principal ocupe la mayor parte del recorte y que haya buena luz.
5. Confirma el encuadre y pulsa **Analizar y sugerir datos**.
6. Comprueba que el aviso diga **Análisis semántico con Cloudflare listo**.
7. Revisa nombre, categoría, descripción, marca, color, material y tipo.
8. Si aparece una categoría sugerida, pulsa **Crear y usar** solo si resulta apropiada para otros productos similares.
9. Completa precio, existencias y stock mínimo; la IA no debe inventarlos.
10. Pulsa **Guardar**.

Para la foto del letrero “Help Yourself”, un resultado razonable sería algo parecido a:

```text
Nombre: Letrero decorativo Help Yourself
Categoría actual: Decoración
Categoría sugerida: Letreros decorativos
Color: Blanco y negro
Material: MDF o madera prensada
Tipo: Letrero decorativo de mesa
```

El material se muestra como probable porque una fotografía no permite confirmar siempre la composición exacta.

## 4. Solucionar errores

- **401 o 403:** el token no corresponde a la cuenta, fue copiado incompleto o no tiene permisos de Workers AI. Crea uno nuevo y actualiza `CLOUDFLARE_API_TOKEN`.
- **404:** revisa `CLOUDFLARE_ACCOUNT_ID` y que `CLOUDFLARE_AI_MODEL` coincida exactamente con el modelo indicado.
- **429:** se alcanzó la asignación gratuita diaria o hay una limitación temporal de capacidad. Espera y vuelve a intentar.
- **El aviso dice Gemini:** Cloudflare falló y el backend logró usar el respaldo de Google. Revisa los logs de Render; aparecerá el evento `cloudflare_product_analysis_fallback`.
- **El aviso dice que la configuración está incompleta:** falta una de las dos variables obligatorias de Cloudflare.
- **El formulario queda vacío:** la app evita aplicar el resultado básico cuando el análisis semántico falla, porque podría confundir texto visible con el tipo de producto.

## 5. Seguridad y mantenimiento

- El token vive únicamente en las variables privadas de Render.
- Si el token se comparte accidentalmente, revócalo en Cloudflare y crea otro.
- No guardes el token real en `.env.example`; ese archivo contiene solamente nombres y ejemplos.
- Todas las sugerencias siguen siendo editables y requieren revisión humana.
- Precio, inventario, dimensiones y características no visibles deben introducirse manualmente.
