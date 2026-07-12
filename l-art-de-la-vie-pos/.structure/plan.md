

# L'Art de la Vie - Sistema de Gestión de Tienda

## Visión General
Aplicación web elegante y sofisticada para gestionar el inventario, ventas, cierre de caja y análisis de L'Art de la Vie, con una paleta de verde oscuro (#003c06) y dorado (#c8b042) que refleja el lujo de la marca.

## Diseño y Navegación
- **Sidebar lateral** con navegación entre las 4 secciones principales (Dashboard, Inventario, Punto de Venta, Cierre de Caja)
- Paleta de colores: verde oscuro (#003c06) como color primario, dorado/mostaza (#c8b042) como acento, fondos claros
- Tipografía elegante, cards con sombras sutiles, animaciones suaves
- Diseño responsivo optimizado para tablet (uso en tienda)
- Logo/nombre "L'Art de la Vie" en el sidebar

## Funcionalidades

### 1. Dashboard Analítico (Página principal)
- Tarjetas resumen: ventas del día, semana y mes, total de productos, alertas de stock bajo
- Gráfico de ventas por período (día/semana/mes) con Recharts
- Top 5 productos más vendidos
- Estado general del inventario por categoría (Decoración, Perfumes, Carteras, Varios)

### 2. Sistema de Inventario
- Tabla de productos con búsqueda y filtros por categoría, nombre o código
- Formulario para agregar/editar productos (nombre, código, categoría, precio, stock, imagen)
- Indicadores visuales de stock bajo (alertas en rojo)
- Registro de entradas y salidas de stock con historial de movimientos
- Confirmación para eliminación de productos

### 3. Punto de Venta (POS)
- Interfaz dividida: catálogo de productos a la izquierda, carrito a la derecha
- Búsqueda rápida de productos por nombre o código
- Carrito con cantidades editables, cálculo automático de subtotal, descuentos y total
- Selector de método de pago (efectivo, tarjeta, transferencia)
- Cálculo de cambio para pagos en efectivo
- Generación de ticket/recibo de venta (vista para impresión)
- Aplicación de descuentos por porcentaje o monto fijo

### 4. Cierre de Caja
- Resumen automático de ventas del día desglosado por método de pago
- Formulario de conteo de efectivo real vs. esperado por el sistema
- Cálculo automático de diferencias (faltantes/sobrantes)
- Registro de gastos y retiros realizados durante el día
- Historial de cierres anteriores
- Exportación del reporte de cierre en PDF
- Confirmación obligatoria antes de cerrar caja

## Backend (Lovable Cloud + Supabase)
- **Tablas**: productos, categorías, ventas, detalle_ventas, movimientos_inventario, cierres_caja, gastos
- **Autenticación**: Login simple para proteger el acceso al sistema
- **Políticas RLS**: Seguridad a nivel de filas para proteger los datos
- Datos persistentes y sincronizados en tiempo real

## Notificaciones y UX
- Toasts para confirmaciones de acciones (venta realizada, producto guardado, etc.)
- Diálogos de confirmación para acciones críticas (eliminar producto, cerrar caja)
- Alertas visuales para stock bajo
- Feedback inmediato en todas las interacciones

