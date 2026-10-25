# Cambios para Turing Store — Sprint 4

Esta carpeta contiene una copia completa del proyecto basada en main, commit
6c07f2ff3f575f3775de33186bbccc3643bfb1ad, con una propuesta de corrección.
El repositorio remoto y las reglas activas de Firebase NO fueron modificados.

## Qué cambia

- firestore.rules: exige guardar el pedido y descontar el stock juntos; verifica
  cantidades, precio, subtotal, total y pertenencia al usuario. Impide reducir
  stock sin pedido, pedidos sin stock y reutilización de pedidos anteriores.
- js/carrito.js: vincula cada descuento al pedido y a su línea, valida cantidades
  y productos duplicados, y avisa cuando se superan 8 productos distintos.
- README.md: cierre del Sprint 4, enlace público, limitaciones, roles,
  cuentas de evaluación pendientes y recorrido final.
- firebase.json, package.json y tests/firestore.test.mjs: configuración
  para probar permisos en un emulador local, sin usar la base real.

Los clientes conservan el acceso solo a sus propios pedidos y no pueden
asignarse el rol admin. El administrador conserva la gestión de productos.

## Verificaciones realizadas y pendientes

REALIZADO:
- Revisión de la relación entre reglas, datos del pedido y transacción del carrito.
- Comprobación de sintaxis de carrito.js y del archivo de pruebas con node --check.
- HTTP 200 en la página principal y pages/catalogo.html publicadas.

RESULTADO DEL EMULADOR Y PENDIENTES:
- Pruebas ejecutadas el 25/10/2026: 20 aprobadas, 0 fallidas, incluidas compras de ocho productos y rechazos de stock, nombres, precios, subtotales y totales alterados.
- Probar la compra real de la aplicación contra el emulador y luego la versión final.
- Completar las dos cuentas de evaluación y comprobar el diseño desde un teléfono.

## Cómo aplicar la propuesta

1. Abrir esta carpeta en Visual Studio Code.
2. Comparar los archivos con tu copia actual antes de reemplazarlos.
3. Crear una rama en tu repositorio y copiar estos cambios.
4. Instalar Node.js compatible con Firebase CLI y Java 21 o superior.
5. Desde la carpeta del proyecto ejecutar:

   npm install
   npm run test:rules

   El proyecto de pruebas es demo-turing-store. No requiere iniciar sesión
   en Firebase ni acceder al proyecto real.

6. Corregir cualquier fallo de las pruebas antes de publicar.
7. Publicar el sitio y las reglas de forma coordinada. En Firebase Console,
   abrir Firestore Database → Reglas y publicar el contenido de firestore.rules.
   Conservar antes una copia de las reglas activas.
8. Recargar pestañas antiguas y probar una compra, stock e historial.
9. Completar en README las cuentas exclusivas de evaluación; compartir su
   acceso por el canal privado del docente.

IMPORTANTE: el carrito nuevo y las reglas nuevas forman una misma entrega.
Las reglas nuevas rechazan compras de las pestañas que aún usan el carrito
anterior. Planificar una pausa breve y recargar después de actualizar.

## Alcance

Máximo 8 productos distintos por compra; cada uno puede tener varias unidades.
Esto permite validar las líneas dentro del límite de lecturas de las reglas.
Los pagos siguen siendo simulados y el proyecto no incorpora un backend de pago.

El archivo en GitHub no publica automáticamente reglas en Firebase.
La integración de GitHub devolvió HTTP 403 al intentar crear una rama, por lo
que no fue posible crear un pull request desde esta sesión.

