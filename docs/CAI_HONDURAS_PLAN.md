# Plan de facturación CAI — L'Art de la Vie

> Documento de estudio y trabajo. No reemplaza la revisión del SAR ni la asesoría de un profesional contable hondureño. El sistema no debe emitir documentos llamados **factura fiscal** hasta que el negocio tenga una autorización vigente y hayamos validado su modalidad.

## 1. Mapa sencillo

```text
Regularizar negocio ante SAR
        ↓
Inscribirse al Régimen de Facturación
        ↓
Definir modalidad autorizada (imprenta o autoimpresor)
        ↓
Obtener CAI + rango + fecha límite
        ↓
Configurar y probar el sistema sin emitir documentos reales
        ↓
Validar muestra con contador/SAR
        ↓
Activar facturación fiscal
```

El CAI no es un número inventado por la aplicación. Lo entrega el SAR junto con un rango autorizado y una fecha límite. El software solo podrá administrar fielmente esos datos.

## 2. Tareas para la propietaria

### Carpeta legal

Reunir y confirmar:

- [ ] RTN de la propietaria o de la empresa.
- [ ] Nombre o razón social exactamente como aparece en el RTN.
- [ ] Nombre comercial: L'Art de la Vie.
- [ ] Domicilio tributario y dirección del establecimiento.
- [ ] Teléfono y correo declarados.
- [ ] Constancia de inicio de operaciones/actividades.
- [ ] Obligaciones tributarias activas, especialmente ISV.
- [ ] Acceso vigente a la Oficina Virtual del SAR.
- [ ] Establecimiento y punto de emisión registrados.
- [ ] Confirmación escrita de la modalidad autorizada: imprenta o autoimpresor.
- [ ] CAI, rango inicial, rango final y fecha límite de emisión cuando sean otorgados.

### Trámite orientativo

1. Entrar a la Oficina Virtual del SAR con el RTN.
2. Confirmar que la información del RTN y la declaración de inicio de actividades estén actualizadas.
3. Solicitar/confirmar la inscripción al Régimen de Facturación.
4. Consultar al SAR qué modalidad corresponde al negocio. No asumir que tener un POS convierte automáticamente al negocio en autoimpresor.
5. Solicitar la autorización de impresión y el rango por la vía indicada para esa modalidad.
6. Descargar y conservar la resolución/constancia que contiene el CAI, rango y fecha límite.
7. Antes de la primera factura real, entregar una muestra al contador o a la orientación tributaria del SAR para revisión.

Fuentes de consulta:

- [Portal oficial de Facturación del SAR](https://www.sar.gob.hn/facturacion/)
- [Requisitos oficiales del SAR](https://www.sar.gob.hn/requisitos/)
- [Nueva Oficina Virtual](https://www.sar.gob.hn/ovi/)
- [Guía introductoria de KODDIX](https://www.koddix.com/blog/como-facturar-con-cai-en-honduras)

Contacto publicado por el SAR: **2216-5800** y **asistencia@sar.gob.hn**.

## 3. Datos que necesitaremos antes de programar la emisión

Completar esta ficha sin publicar información sensible en GitHub:

```text
Tipo de contribuyente:
Nombre/razón social:
Nombre comercial:
RTN:
Dirección fiscal:
Correo y teléfono:
¿Inscrito en Régimen de Facturación?:
¿Responsable de ISV?:
Modalidad autorizada:
Código de establecimiento:
Código de punto de emisión:
Tipo de documento autorizado:
CAI:
Rango desde:
Rango hasta:
Fecha límite de emisión:
¿Los precios actuales incluyen ISV?:
```

El CAI y los rangos se guardarán en Supabase con acceso administrativo; **no** se colocarán en archivos `.env` del frontend.

## 4. Información que debe soportar una factura

Basándonos en la guía compartida y sujetos a validación oficial final:

- Datos legales y RTN del emisor.
- CAI y fecha límite de emisión.
- Rango autorizado.
- Número fiscal completo y correlativo único.
- Fecha y hora de emisión.
- Nombre y RTN del cliente cuando corresponda.
- Detalle, cantidad y precio de cada producto.
- Subtotales separados: exento, exonerado, gravado 15% y gravado 18%.
- ISV 15% e ISV 18% desglosados.
- Descuentos y total en lempiras.
- Identificación del cajero y forma de pago como datos internos útiles.

El ticket actual del POS seguirá llamándose **ticket de venta** hasta completar este proceso. No será presentado como factura fiscal.

## 5. Diseño técnico propuesto

### Nuevos datos

```text
stores
  └── tax_profile (razón social, RTN, dirección, régimen)
        └── cai_authorizations (CAI, rango, vencimiento, estado)
              └── fiscal_documents (factura emitida o anulada)
                    └── fiscal_document_items (detalle congelado)

products
  └── tax_treatment (exento / exonerado / gravado_15 / gravado_18)

sales
  └── fiscal_document_id (vínculo opcional)
```

### Reglas que el servidor impondrá

1. Asignar correlativos dentro de una transacción de base de datos para que dos cajas nunca repitan número.
2. Rechazar una emisión si el CAI está vencido, inactivo o agotado.
3. Calcular impuestos en el servidor; nunca confiar en los totales enviados por web o móvil.
4. Guardar una copia histórica del nombre, precio y tratamiento fiscal de cada artículo.
5. No permitir eliminar ni editar silenciosamente una factura emitida.
6. Anular con motivo, usuario, fecha y trazabilidad, según el procedimiento permitido.
7. Avisar con anticipación cuando el rango o la fecha estén próximos a agotarse.
8. Generar PDF/ticket reproducible y conservar los datos que lo originaron.
9. Registrar auditoría sin almacenar claves o contraseñas en los logs.

## 6. Fases de implementación

### Fase A — Preparación segura (ahora)

- Mantener ticket comercial no fiscal.
- Reunir la ficha legal.
- Confirmar modalidad y tratamiento del ISV con SAR/contador.
- Diseñar una factura de prueba con marca de agua **SIN VALIDEZ FISCAL**.

### Fase B — Base de datos y configuración

- Crear perfil tributario y autorizaciones CAI.
- Agregar tratamiento fiscal a productos.
- Agregar clientes y RTN opcional/obligatorio según el caso.
- Crear asignación atómica de correlativos.

### Fase C — Factura de prueba

- Incorporar impuestos al cobro.
- Crear vista previa antes de emitir.
- Generar PDF térmico/carta.
- Probar vencimiento, rango agotado, doble clic, caída de internet y anulación.

### Fase D — Validación y activación

- Revisar una muestra con contador/SAR.
- Corregir formato y reglas.
- Cargar autorización real mediante una pantalla solo para `owner`.
- Activar emisión fiscal y respaldos.

## 7. Decisiones pendientes

- ¿La tienda está registrada como persona natural, comerciante individual o persona jurídica?
- ¿Ya tiene RTN e inicio de actividades?
- ¿Ya está inscrita en el Régimen de Facturación?
- ¿Actualmente entrega talonarios autorizados?
- ¿El SAR ya la autorizó como autoimpresor o debe continuar con imprenta?
- ¿Está obligada a cobrar ISV y qué artículos pertenecen a 15%, 18%, exento o exonerado?
- ¿El precio mostrado al público ya incluye el impuesto?
- ¿Necesita factura tamaño carta, media carta o impresión térmica?

Estas respuestas determinan el modelo final. No deben resolverse por suposición técnica.
