# Preparación de facturación CAI en Honduras

Esta guía separa lo técnico de lo legal. El sistema ya puede guardar la configuración fiscal y proteger el rango, pero **todavía no debe sustituir una factura fiscal autorizada** hasta completar las fases indicadas y validarlas con la contadora y el SAR.

## Qué debe conseguir la empresa

1. Confirmar RTN, razón social, nombre comercial, domicilio fiscal y obligaciones tributarias.
2. Confirmar con la contadora si corresponde factura, ticket u otro comprobante y qué tasas de ISV usa cada producto.
3. Solicitar/autorización de impresión o autoimpresor mediante los canales vigentes del SAR.
4. Obtener el CAI, rango autorizado, fecha de autorización y fecha límite de emisión.
5. Verificar el documento y su rango con las herramientas oficiales del SAR antes de activarlo.

El SAR indica que quienes transfieren bienes o prestan servicios deben emitir comprobante fiscal y publica los trámites y normativa aplicables en su portal de facturación.

## Qué ya prepara el sistema

- Pantalla **Facturación CAI** visible para `owner` y `admin`.
- Borrador con razón social, RTN, dirección, CAI, establecimiento, punto de emisión, tipo de documento, rango y fechas.
- Validación de RTN de 14 dígitos, estructura de códigos, rango y vencimiento.
- Tabla de comprobantes con una copia inmutable de los datos fiscales usados en cada venta.
- Acceso solamente por el backend y la `service_role`.

Para habilitar esta base ejecuta `202609120002_cai_foundation.sql` en **Supabase > SQL Editor** y entra en **POS > Facturación CAI**. Guarda primero como borrador.

## Lo que falta antes de emitir facturas reales

| Componente | Estado |
| --- | --- |
| Guardar datos, CAI y rango | Listo |
| Control de acceso de configuración | Listo |
| Clasificación fiscal de cada producto: exento, exonerado, 15% o 18% | Pendiente |
| Asignación transaccional del correlativo al completar la venta | Pendiente |
| Cálculo fiscal final y redondeo validado por contadora | Pendiente |
| Comprobante imprimible con todos los requisitos | Pendiente |
| Anulaciones, notas de crédito/débito y cierre de rangos | Pendiente |
| Prueba y aprobación con documentos reales del SAR | Obligatoria |

No se automatizó la emisión todavía porque inventar tasas, numeración o datos fiscales puede producir comprobantes inválidos.

## Datos que deberá mostrar el comprobante

La implementación final debe contemplar, según el documento autorizado: datos e identificación del emisor, RTN, CAI, número completo de documento, fecha, datos del cliente cuando correspondan, detalle de productos, descuentos, importes exentos/exonerados/gravados, ISV, total, rango autorizado y fecha límite. El número se estructura como establecimiento / punto de emisión / tipo de documento / correlativo.

## Fuentes de verificación

- [SAR: portal oficial de facturación](https://www.sar.gob.hn/facturacion/)
- [SAR: leyes y texto consolidado del régimen de facturación](https://www.sar.gob.hn/leyes/)
- [SAR: trámites de facturación](https://www.sar.gob.hn/tramitesfacturacion/)
- [SAR: ayuda de autorización de impresión por imprenta y autoimpresor](https://www.sar.gob.hn/download/ayuda-solicitud-de-autorizacion-de-impresion-por-imprenta-y-auto-impresor-2025/)
- [Koddix: explicación práctica de facturación con CAI](https://www.koddix.com/blog/como-facturar-con-cai-en-honduras)

La normativa y los procedimientos pueden cambiar. Confirma los datos finales con el SAR y una profesional contable antes de emitir documentos fiscales desde el POS.
