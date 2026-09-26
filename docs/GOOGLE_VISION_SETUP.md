# Análisis de productos con Google Cloud Vision

La función está diseñada solamente para la app móvil del personal. La fotografía se envía al backend, el backend consulta Google y devuelve sugerencias editables. El producto no se guarda hasta que una persona revise y pulse **Guardar**.

## Costo esperado

Google cobra cada función aplicada a cada imagen como una unidad separada, pero las primeras 1,000 unidades mensuales de cada función de Cloud Vision son gratuitas. Esta integración usa etiquetas, texto, logos, propiedades de imagen, objetos y búsqueda web. Con 50 fotografías serían aproximadamente 50 unidades de cada función, por debajo del nivel gratuito actual.

Google exige habilitar facturación aunque el uso permanezca dentro del nivel gratuito. El backend además detiene la función en 100 análisis mensuales por tienda: suficiente para unos 50 productos y una segunda foto si alguna falla. Esto deja bastante margen, pero no sustituye una alerta de presupuesto de Google Cloud.

Fuentes oficiales:

- https://cloud.google.com/vision/pricing
- https://docs.cloud.google.com/vision/docs/setup
- https://docs.cloud.google.com/vision/docs/request

## 1. Preparar Google Cloud

1. Entra a https://console.cloud.google.com/ con la cuenta que administrará L'Art.
2. Crea un proyecto, por ejemplo `lart-vision`.
3. Vincula una cuenta de facturación al proyecto. No significa un cobro mensual fijo; habilita el consumo por uso.
4. Abre **APIs y servicios → Biblioteca**.
5. Busca **Cloud Vision API** y pulsa **Habilitar**.
6. Abre **APIs y servicios → Credenciales → Crear credenciales → Clave de API**.
7. Edita la clave y en **Restricciones de API** selecciona **Restringir clave → Cloud Vision API**.
8. Guarda la clave en un administrador de contraseñas. No debe colocarse en Expo, Vite, GitHub ni archivos `.env` públicos.

## 2. Evitar cobros inesperados

1. En Google Cloud abre **Facturación → Presupuestos y alertas**.
2. Crea un presupuesto pequeño, por ejemplo USD 1, con avisos al 50%, 90% y 100%.
3. Conserva en Render `GOOGLE_VISION_MONTHLY_LIMIT=100`.

Importante: una alerta de presupuesto avisa, pero por sí sola no corta el servicio. El corte preventivo de esta aplicación sí deja de llamar a Google al llegar a 100 análisis registrados y permite continuar manualmente.

## 3. Aplicar la migración en Supabase

1. Abre **Supabase → SQL Editor → New query**.
2. Copia y ejecuta el contenido de:
   `l-art-de-la-vie-api/supabase/migrations/202609250001_product_intelligence.sql`
3. Confirma que aparecen las columnas `description` y `specifications` en `products`, además de la tabla `product_vision_usage`.

## 4. Configurar Render

En el servicio del backend abre **Environment** y agrega:

```text
GOOGLE_VISION_API_KEY=la_clave_creada_en_google
GEMINI_API_KEY=la_clave_creada_en_google_ai_studio
GOOGLE_VISION_MONTHLY_LIMIT=100
```

`GEMINI_API_KEY` es opcional, pero recomendado: permite comprender el producto completo y devolver datos estructurados en español. Sin esa clave, la aplicación usa Cloud Vision con reglas conservadoras y deja vacíos los campos dudosos.

Guarda los cambios y espera el nuevo despliegue. Las claves existen únicamente en el servidor.

## 5. Probar desde el celular

1. Abre la app del personal e inicia sesión como propietaria o administradora.
2. Entra a **Inventario → +**.
3. Toma una fotografía o elige una de la galería.
4. Confirma el recorte.
5. Pulsa **Analizar y sugerir datos**.
6. Revisa nombre, categoría, descripción, marca, color, material y tipo.
7. Completa precio, existencias y stock mínimo manualmente.
8. Pulsa **Guardar**.
9. Abre el preview en móvil, POS y tienda para confirmar que la descripción y especificaciones aparecen.

Si Google falla, no está configurado o llega al límite, la app muestra **Continúa manualmente** y conserva el formulario abierto.

## Qué puede y qué no puede reconocer

Gemini comprende el producto de forma semántica y Cloud Vision sirve como respaldo para texto, logos y objetos generales. Ninguno debe inventar precio, stock, dimensiones, aroma, modelo exacto ni composición. Por eso todas las sugerencias quedan editables y requieren confirmación humana.
