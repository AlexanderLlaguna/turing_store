# Turing Store - Sprint 3

Proyecto web orientado a la venta de accesorios informáticos.

## Descripción

Turing Store es una tienda de accesorios tecnológicos para estudiar, trabajar y crear.

Durante el Sprint 3 se integraron Firebase Authentication y Cloud Firestore para implementar autenticación, perfiles de usuario, roles, productos, control de stock, pedidos, historial de compras y valoraciones.

## Público objetivo

- Estudiantes.
- Docentes.
- Desarrolladores.
- Personas que necesitan accesorios informáticos confiables y accesibles.

## Categorías de productos

- Periféricos.
- Audio.
- Almacenamiento.
- Conectividad.

## Tecnologías utilizadas

- HTML5 semántico.
- CSS3.
- Bootstrap 5.3.
- JavaScript.
- DOM y eventos.
- LocalStorage.
- Firebase Authentication.
- Cloud Firestore.
- Git y GitHub.

## Estructura del proyecto

```text
turing_store/
├── assets/
│   ├── favicon.svg
│   ├── logo-turing.svg
│   └── imágenes de productos
├── css/
│   └── styles.css
├── js/
│   ├── admin.js
│   ├── base.js
│   ├── carrito.js
│   ├── catalogo.js
│   ├── config.js
│   ├── login.js
│   ├── perfil.js
│   ├── producto.js
│   ├── productos-firestore.js
│   ├── sesion.js
│   └── valoraciones.js
├── pages/
│   ├── admin.html
│   ├── carrito.html
│   ├── catalogo.html
│   ├── login.html
│   ├── perfil.html
│   └── producto.html
├── firestore.rules
├── index.html
└── README.md
```

## Páginas principales

- `index.html`: página principal de Turing Store.
- `pages/catalogo.html`: catálogo dinámico, búsqueda, filtros y ordenamiento.
- `pages/producto.html`: detalle del producto seleccionado.
- `pages/carrito.html`: administración y confirmación del carrito.
- `pages/login.html`: registro, inicio de sesión y recuperación de contraseña.
- `pages/perfil.html`: información del cliente, edición del nombre e historial de pedidos.
- `pages/admin.html`: gestión administrativa de productos y pedidos.

## Organización de JavaScript

- `js/config.js`: configuración e inicialización de Firebase.
- `js/base.js`: navegación, contador del carrito, mensajes y funciones compartidas.
- `js/sesion.js`: control de sesión y navegación según el usuario.
- `js/login.js`: registro, inicio de sesión y recuperación de contraseña.
- `js/catalogo.js`: generación del catálogo, búsqueda, filtros y ordenamiento.
- `js/producto.js`: detalle del producto seleccionado mediante su identificador.
- `js/productos-firestore.js`: consulta y carga inicial de productos en Firestore.
- `js/carrito.js`: carrito, cantidades, compra, pedido y actualización de stock.
- `js/perfil.js`: perfil, edición del nombre e historial de pedidos.
- `js/valoraciones.js`: puntuaciones y comentarios asociados a productos.
- `js/admin.js`: funciones protegidas para usuarios administradores.

## Sprint 2 - Catálogo, producto y carrito

Durante el Sprint 2 se incorporó comportamiento dinámico mediante JavaScript.

### Funcionalidades implementadas

- Generación dinámica del catálogo.
- Búsqueda de productos por nombre.
- Filtrado por categoría.
- Ordenamiento por nombre y precio.
- Visualización de la cantidad de resultados.
- Mensaje cuando no existen productos coincidentes.
- Restauración del catálogo al limpiar los filtros.
- Página dinámica de detalle mediante parámetros en la URL.
- Información de nombre, imagen, descripción, categoría, precio y stock.
- Mensaje cuando el producto solicitado no existe.
- Incorporación de productos al carrito.
- Aumento y disminución de cantidades.
- Eliminación de productos.
- Validación de cantidades según el stock disponible.
- Cálculo automático de subtotales y total.
- Contador de unidades en la barra de navegación.
- Conservación del carrito al recargar la página.
- Confirmación de compra mediante una ventana modal.
- Mensaje informativo cuando el carrito está vacío.
- Botón flotante de contacto mediante WhatsApp.
- Sistema de calificación mediante estrellas.

## Uso de LocalStorage

El carrito se conserva en el navegador mediante `LocalStorage`.

Antes de guardar los productos, el arreglo se convierte a JSON mediante:

```js
JSON.stringify(carrito);
```

Al recuperar el carrito, el contenido se transforma nuevamente en un arreglo mediante:

```js
JSON.parse(localStorage.getItem("turingStoreCarrito"));
```

Esto permite conservar los productos y sus cantidades aunque la página se recargue.

## Sprint 3 - Firebase, perfiles y pedidos

### Autenticación

- Registro de usuarios mediante Firebase Authentication.
- Inicio de sesión con correo electrónico y contraseña.
- Cierre de sesión.
- Protección de las páginas privadas.
- Identificación del usuario activo en la barra de navegación.
- Redirección al inicio de sesión cuando no existe una sesión activa.
- Recuperación de contraseña mediante correo electrónico.
- Mensajes de confirmación y error mediante notificaciones de Bootstrap.

### Perfil del cliente

- Consulta del perfil almacenado en `usuarios/{uid}`.
- Visualización del nombre, correo electrónico y rol.
- Edición del nombre del cliente.
- Actualización del nombre en Firebase Authentication.
- Actualización del nombre en Cloud Firestore.
- Actualización inmediata del saludo de la barra de navegación.
- Historial de pedidos correspondiente al usuario autenticado.
- Cantidad total de pedidos realizados.

El cliente puede modificar su nombre, pero no puede cambiar su rol desde la interfaz.

### Catálogo en Firestore

- Productos obtenidos desde la colección `productos`.
- Consulta de precios, stock y disponibilidad.
- Carga inicial de productos desde el panel administrativo.
- Eliminación del arreglo local como fuente principal del catálogo.
- Conservación de `productosIniciales` únicamente para la primera carga administrativa.

### Carrito y compras

- Conservación temporal del carrito mediante `LocalStorage`.
- Comprobación de sesión antes de confirmar una compra.
- Nueva comprobación de precios y stock antes de registrar el pedido.
- Uso de una transacción de Firestore para evitar inconsistencias.
- Descuento automático del stock.
- Cambio automático de disponibilidad cuando el stock llega a cero.
- Registro del pedido únicamente si la transacción termina correctamente.
- Vaciado del carrito después de una compra exitosa.
- Mensajes de compra mostrados en el centro de la pantalla.

### Pedidos

Cada pedido guarda información como:

- Número de pedido.
- Identificador del usuario.
- Correo electrónico del usuario.
- Productos comprados.
- Cantidades.
- Precios.
- Subtotales.
- Total.
- Fecha.
- Estado.

Los pedidos nuevos utilizan un número más legible con un formato similar a:

```text
TS-20260921-247509
```

Los pedidos anteriores continúan siendo compatibles y muestran una versión corta de su identificador de Firestore.

### Valoraciones

- Puntuación mediante estrellas.
- Comentario del usuario.
- Asociación de la valoración con el producto y el usuario.
- Cálculo del promedio de puntuaciones.
- Visualización de la cantidad de valoraciones.
- Almacenamiento en Cloud Firestore.
- Sustitución de la valoración anterior cuando el mismo usuario vuelve a valorar.

### Administración

- Acceso protegido según el rol.
- Carga inicial de productos.
- Gestión de productos almacenados en Firestore.
- Consulta de pedidos.
- Restricción del panel para usuarios que no poseen el rol `admin`.

## Colecciones de Firestore

### `usuarios`

Almacena los perfiles y roles.

Campos principales:

- `nombre`
- `correo`
- `rol`
- `actualizadoEn`

### `productos`

Almacena el catálogo.

Campos principales:

- `nombre`
- `descripcion`
- `categoria`
- `precio`
- `stock`
- `imagen`
- `disponible`
- `actualizadoEn`

### `pedidos`

Almacena las compras confirmadas.

Campos principales:

- `numeroPedido`
- `usuarioId`
- `usuarioCorreo`
- `productos`
- `total`
- `fecha`
- `estado`

### `valoraciones`

Almacena las opiniones de los usuarios.

Campos principales:

- `usuarioId`
- `productoId`
- `puntuacion`
- `comentario`
- `fecha`

## Reglas de seguridad

El archivo `firestore.rules` contiene las reglas de seguridad de Cloud Firestore.

Las reglas permiten:

- Lectura pública de productos y valoraciones.
- Creación y modificación de valoraciones por usuarios autenticados.
- Acceso de cada usuario a su propio perfil.
- Creación de pedidos por usuarios autenticados.
- Protección de productos y funciones administrativas mediante el rol `admin`.

Las reglas deben publicarse desde Firebase Console para que tengan efecto.

## Preparación inicial

1. Crear un proyecto en Firebase.
2. Activar Firebase Authentication con correo electrónico y contraseña.
3. Crear una base de datos de Cloud Firestore.
4. Configurar los datos del proyecto en `js/config.js`.
5. Publicar el contenido de `firestore.rules`.
6. Registrar una cuenta desde Turing Store.
7. Cambiar manualmente el campo `rol` a `admin` en `usuarios/{uid}` para establecer el primer administrador.
8. Ingresar nuevamente con la cuenta administradora.
9. Abrir `pages/admin.html`.
10. Presionar **Cargar productos iniciales** una sola vez.

## Ejecución local

1. Abrir la carpeta del proyecto en Visual Studio Code.
2. Ejecutar `index.html` mediante la extensión Live Server.
3. Registrar una cuenta o iniciar sesión.
4. Acceder al catálogo.
5. Probar la búsqueda, los filtros y el ordenamiento.
6. Abrir el detalle de un producto desde el catálogo.
7. Agregar productos al carrito.
8. Modificar las cantidades.
9. Confirmar la compra.
10. Consultar el pedido dentro de **Mi perfil**.
11. Probar la edición del nombre.
12. Probar la recuperación de contraseña cerrando previamente la sesión.

## Comprobaciones realizadas

- El registro y el inicio de sesión funcionan.
- La recuperación de contraseña envía el correo correspondiente.
- El perfil muestra los datos del usuario autenticado.
- El nombre del cliente puede editarse y permanece actualizado al recargar.
- El catálogo consulta los productos desde Firestore.
- La búsqueda, los filtros y el ordenamiento funcionan.
- El detalle se carga según el identificador del producto.
- El carrito permite agregar, modificar y eliminar productos.
- Las cantidades no superan el stock disponible.
- Los subtotales y el total se calculan correctamente.
- El carrito permanece guardado al recargar.
- La compra genera un pedido.
- El stock se actualiza después de la compra.
- El historial muestra solamente los pedidos del usuario autenticado.
- Las valoraciones quedan asociadas al producto y al usuario.
- Los usuarios sin rol administrativo no pueden acceder al panel de administración.

## Decisiones de diseño

Se mantuvo una estética minimalista basada en azul noche, blanco, gris claro y turquesa.

Las tarjetas utilizan bordes suaves, espacios amplios y sombras discretas. El logotipo combina la letra `T`, como referencia a Alan Turing, con nodos inspirados en circuitos electrónicos.

La lógica JavaScript se distribuyó en archivos separados para facilitar la lectura, el mantenimiento y la reutilización del código.

## Próximas mejoras

- Simulación de formas de pago.
- Pruebas completas de todas las funcionalidades.
- Mejoras de accesibilidad.
- Validaciones adicionales.
- Preparación del Pull Request final hacia `main`.