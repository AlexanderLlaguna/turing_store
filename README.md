# Turing Store - Sprint 3

Proyecto web orientado a la venta de accesorios informáticos.

## Descripción

Turing Store es una tienda de accesorios tecnológicos para estudiar, trabajar y crear.

Durante el Sprint 3 se integraron Firebase Authentication y Cloud Firestore para implementar autenticación, perfiles de usuario, roles, productos, control de stock, pedidos, historial de compras y valoraciones.

También se incorporó el inicio de sesión con Google y la posibilidad de personalizar la foto del perfil manteniendo el proyecto dentro del plan gratuito de Firebase.

Como mejora de accesibilidad visual, se incorporó un control que permite aumentar o disminuir el tamaño del contenido entre 100 % y 200 %. La preferencia seleccionada se conserva al navegar entre las páginas.

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
- Canvas API para procesar imágenes.
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
- `pages/login.html`: registro, inicio de sesión, acceso con Google y recuperación de contraseña.
- `pages/perfil.html`: información del cliente, foto de perfil, edición del nombre e historial de compras.
- `pages/admin.html`: gestión administrativa de productos y pedidos.

## Organización de JavaScript

- `js/config.js`: configuración e inicialización de Firebase.
- `js/base.js`: navegación, contador del carrito, mensajes, control de accesibilidad visual y funciones compartidas.
- `js/sesion.js`: control de sesión y navegación según el usuario.
- `js/login.js`: registro, inicio de sesión, acceso con Google y recuperación de contraseña.
- `js/catalogo.js`: generación del catálogo, búsqueda, filtros y ordenamiento.
- `js/producto.js`: detalle del producto seleccionado mediante su identificador.
- `js/productos-firestore.js`: consulta y carga inicial de productos en Firestore.
- `js/carrito.js`: carrito, cantidades, compra, pedido y actualización de stock.
- `js/perfil.js`: perfil, foto personalizada, edición del nombre e historial de compras.
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
- Inicio de sesión mediante una cuenta de Google.
- Creación automática del perfil en Firestore cuando el usuario ingresa con Google por primera vez.
- Actualización de la fecha del último acceso.
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
- Historial de compras correspondiente al usuario autenticado.
- Cantidad total de compras realizadas.
- Carga de una foto personalizada de perfil.
- Validación de imágenes JPG, PNG y WebP.
- Validación del tamaño máximo permitido para la imagen.
- Redimensionamiento y compresión de la imagen antes de guardarla.
- Almacenamiento de la foto personalizada en Cloud Firestore.
- Uso de la foto de Google cuando no existe una imagen personalizada.
- Uso de un avatar predeterminado cuando el usuario no tiene fotografía.
- Opción para eliminar la foto personalizada.
- Sección visual de **Mis compras**.
- Mejoras visuales mediante sombras, bordes, colores y animaciones suaves.

El cliente puede modificar su nombre y su fotografía, pero no puede cambiar su rol desde la interfaz.

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
- Simulación de pago mediante tarjeta de crédito o débito.
- Validación de tarjetas incompletas o vencidas.
- Simulación de transferencia bancaria.
- Opción de efectivo al retirar.
- Generación automática de una referencia de pago.
- Registro del método y estado del pago en Firestore.
- Pagos con tarjeta guardados como `aprobado`.
- Transferencia y efectivo guardados como `pendiente`.
- Protección de datos sensibles: no se almacenan número de tarjeta, vencimiento ni CVV.

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
- Forma de pago.
- Estado del pago.
- Referencia del pago.

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

### Accesibilidad visual

- Control de tamaño disponible desde la barra de navegación.
- Botón identificado mediante `A±`.
- Ajuste del contenido entre 100 % y 200 %.
- Incrementos y reducciones de 25 %.
- Botones para aumentar y disminuir el tamaño.
- Control deslizante para seleccionar el nivel deseado.
- Opción para restablecer el tamaño original.
- Conservación de la preferencia mediante `LocalStorage`.
- Aplicación automática del tamaño seleccionado al cambiar de página.
- Integración en todas las páginas sin modificar individualmente cada archivo HTML.

Esta funcionalidad está orientada principalmente a facilitar la navegación de personas con baja visión.

## Colecciones de Firestore

### `usuarios`

Almacena los perfiles, roles y fotografías de los usuarios.

Campos principales:

- `nombre`
- `correo`
- `rol`
- `fotoPerfil`
- `fotoGoogle`
- `fechaRegistro`
- `ultimoAcceso`
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
- `pago.metodo`
- `pago.nombreMetodo`
- `pago.estado`
- `pago.referencia`

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
3. Activar el proveedor de acceso con Google.
4. Seleccionar el nombre público y el correo de asistencia del proyecto.
5. Autorizar los dominios `localhost` y `127.0.0.1`.
6. Crear una base de datos de Cloud Firestore.
7. Configurar los datos del proyecto en `js/config.js`.
8. Publicar el contenido de `firestore.rules`.
9. Registrar una cuenta o ingresar mediante Google.
10. Cambiar manualmente el campo `rol` a `admin` en `usuarios/{uid}` para establecer el primer administrador.
11. Ingresar nuevamente con la cuenta administradora.
12. Abrir `pages/admin.html`.
13. Presionar **Cargar productos iniciales** una sola vez.

## Ejecución local

1. Abrir la carpeta del proyecto en Visual Studio Code.
2. Ejecutar `index.html` mediante la extensión Live Server.
3. Registrar una cuenta, iniciar sesión o acceder mediante Google.
4. Acceder al catálogo.
5. Probar la búsqueda, los filtros y el ordenamiento.
6. Abrir el detalle de un producto desde el catálogo.
7. Agregar productos al carrito.
8. Modificar las cantidades.
9. Confirmar la compra.
10. Consultar la compra dentro de **Mi perfil**.
11. Probar la edición del nombre.
12. Probar la carga y eliminación de la foto del perfil.
13. Probar la recuperación de contraseña cerrando previamente la sesión.
14. Abrir el control `A±` de la barra de navegación.
15. Probar los diferentes tamaños entre 100 % y 200 %.
16. Cambiar de página y comprobar que el tamaño seleccionado se conserva.

## Comprobaciones realizadas

- El registro y el inicio de sesión funcionan.
- El inicio de sesión con Google funciona correctamente.
- Los usuarios nuevos de Google se registran en Firestore.
- La recuperación de contraseña envía el correo correspondiente.
- El perfil muestra los datos del usuario autenticado.
- La foto de Google se muestra como imagen inicial del perfil.
- El usuario puede cargar, guardar y eliminar una foto personalizada.
- La foto personalizada permanece después de recargar la página.
- Al eliminar la foto personalizada se recupera la imagen de Google o el avatar predeterminado.
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
- El historial muestra solamente las compras del usuario autenticado.
- Las valoraciones quedan asociadas al producto y al usuario.
- Los usuarios sin rol administrativo no pueden acceder al panel de administración.
- Las formas de pago con tarjeta, transferencia y efectivo funcionan correctamente.
- Las tarjetas incompletas o vencidas son rechazadas.
- Los pagos guardan método, estado y referencia en Firestore.
- No se almacenan datos sensibles de las tarjetas.
- El stock se descuenta mediante una transacción de Firestore.
- El control de accesibilidad aparece en todas las páginas.
- El tamaño del contenido puede ajustarse entre 100 % y 200 %.
- Los botones de aumento, disminución y restablecimiento funcionan correctamente.
- La preferencia visual permanece guardada al cambiar de página o recargar el sitio.
- La barra de navegación mantiene correctamente el orden de sus elementos.

## Decisiones de diseño

Se mantuvo una estética minimalista basada en azul noche, blanco, gris claro y turquesa.

Las tarjetas utilizan bordes suaves, espacios amplios y sombras discretas. El logotipo combina la letra `T`, como referencia a Alan Turing, con nodos inspirados en circuitos electrónicos.

El perfil del usuario utiliza una tarjeta destacada, colores suaves, sombras y pequeños movimientos al pasar el cursor. La sección **Mis compras** se presenta de forma separada para facilitar la lectura.

El control de accesibilidad se mantuvo compacto dentro de la barra de navegación para evitar sobrecargar la interfaz. La reproducción automática de audio no fue incorporada, priorizando una experiencia sencilla y no invasiva.

La lógica JavaScript se distribuyó en archivos separados para facilitar la lectura, el mantenimiento y la reutilización del código.

Para mantener el proyecto dentro del plan gratuito de Firebase, las fotografías se redimensionan, comprimen y almacenan en el documento del usuario en Cloud Firestore, sin utilizar Firebase Storage.

## Próximas mejoras

- Pruebas automatizadas.
- Evaluación de compatibilidad con lectores de pantalla.
- Seguimiento administrativo del estado de los pedidos.
- Optimización adicional de imágenes.
- Publicación de una versión estable del proyecto.