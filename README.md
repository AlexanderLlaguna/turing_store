*Turing Store - Sprint 3*

Proyecto orientado a la venta de accesorios informáticos.

*Descripción*

Turing Store es una tienda web de accesorios tecnológicos para estudiar, trabajar y crear. En el Sprint 3 se incorporaron Firebase Authentication, Cloud Firestore, pedidos, control de stock, historial de compras y valoraciones de usuarios.

*Público objetivo*

Estudiantes, docentes, desarrolladores y usuarios que necesitan accesorios informáticos confiables y accesibles.

*Categorías de productos*

- Periféricos.
- Audio.
- Almacenamiento.
- Conectividad.

*Tecnologías utilizadas*

- HTML5 semántico.
- CSS3.
- Bootstrap 5.3.
- JavaScript.
- DOM y eventos.
- LocalStorage.
- Git y GitHub.

*Estructura del proyecto*

- **index.html**: página principal de Turing Store.
- **pages/catalogo.html**: catálogo dinámico, buscador y filtro por categoría.
- **pages/producto.html*: detalle dinámico del producto seleccionado.
- **pages/carrito.html**: carrito de compras.
- **pages/perfil.html**: perfil previsto para el Sprint 3.
- **pages/admin.html**: administración prevista para el Sprint 3.
- **css/styles.css**: identidad visual, estilos y diseño responsive.
- **js/productos.js**: arreglo con los datos de los productos.
- **js/catalogo.js**: generación del catálogo, búsqueda y filtros.
- **js/producto.js**: lectura del identificador desde la URL y presentación del detalle.
- **js /carrito.js**: operaciones del carrito, cantidades, subtotales, total y LocalStorage.
- **js/base.js**: navegación, contador del carrito, avisos y funciones generales.
- **assets/**: logotipo, favicon e imágenes de los productos.

*Representación de los productos*

Los productos se almacenan como objetos dentro de un arreglo en js/productos.js. Cada objeto contiene información como:

- Identificador.
- Nombre.
- Descripción.
- Categoría.
- Precio.
- Stock.
- Ruta de la imagen.

*Funcionalidades desarrolladas en el Sprint 2*

- Generación dinámica del catálogo desde JavaScript.
- Búsqueda de productos por nombre.
- Filtrado de productos por categoría.
- Combinación de búsqueda y filtro.
- Mensaje cuando no existen productos coincidentes.
- Restauración del catálogo al limpiar los filtros.
- Detalle dinámico mediante el identificador incluido en la URL.
- Mensaje cuando el producto solicitado no existe.
- Incorporación de productos al carrito desde el catálogo y el detalle.
- Visualización de los productos agregados.
- Incremento y disminución de cantidades.
- Eliminación de productos.
- Validación de cantidades según el stock disponible.
- Cálculo automático de subtotales y total.
- Contador de unidades en la barra de navegación.
- Conservación del carrito al recargar la página.
- Confirmación de compra mediante una ventana modal.
- Vaciado del carrito después de confirmar la compra.
- Mensaje informativo cuando el carrito está vacío.

*Uso de LocalStorage*

El carrito se guarda en el navegador mediante LocalStorage. Antes de almacenar la información, el arreglo se convierte a formato JSON con JSON.stringify().
Al recuperar el carrito, el texto almacenado se transforma nuevamente en un arreglo mediante JSON.parse(). Esto permite conservar los productos y sus cantidades aunque la página se recargue.

*Ejecución*

1. Abrir la carpeta del proyecto en Visual Studio Code.
2. Abrir index.html mediante la extensión Live Server.
3. Acceder al catálogo.
4. Probar la búsqueda y el filtro por categoría.
5. Abrir el detalle de un producto.
6. Agregar productos al carrito y modificar sus cantidades.
7. Recargar la página para comprobar la persistencia del carrito.
8. Confirmar la compra.

*Comprobaciones realizadas*

- El catálogo se genera correctamente desde JavaScript.
- La búsqueda y los filtros funcionan.
- El detalle cambia según el producto seleccionado.
- El carrito permite agregar, modificar y eliminar productos.
- Las cantidades no superan el stock disponible.
- Los subtotales y el total se calculan correctamente.
- El carrito permanece guardado al recargar.
- No se detectaron errores relevantes de JavaScript en la consola del navegador.

*Base prevista al comenzar el Sprint 3*

- Registro e inicio de sesión real.
- Firebase Authentication.
- Cloud Firestore.
- Persistencia de usuarios, perfiles y pedidos.
- Cierre de sesión.
- Roles de usuario.
- Panel administrativo funcional.
- Gestión de productos y pedidos.
- Reglas de seguridad.

*Decisiones de diseño*

Se mantuvo una estética minimalista basada en azul noche, blanco, gris claro y turquesa. Las tarjetas utilizan bordes suaves, espacios amplios y sombras discretas. El logotipo combina la letra "T" (Allan Turing) con nodos inspirados en circuitos electrónicos.

La lógica JavaScript se distribuyó en diferentes archivos para evitar concentrar todas las funciones en un único documento y facilitar el mantenimiento del proyecto.

*Mejoras adicionales del Sprint 2*

- Catálogo ampliado a ocho productos.
- Distribución equilibrada de productos por categoría.
- Nueva imagen principal adaptada a la identidad de Turing Store.
- Botón flotante de contacto mediante WhatsApp.
- Mensaje de WhatsApp personalizado desde el detalle del producto.
- Sistema de calificación de productos mediante estrellas.
- Cálculo dinámico del promedio y cantidad de valoraciones.
- Conservación de la valoración del usuario mediante LocalStorage.
- Visualización dinámica de la cantidad de productos encontrados.
- Ordenamiento de productos por nombre y precio.

## Sprint 2 - Catálogo, producto y carrito

Durante el Sprint 2 se incorporó comportamiento dinámico a Turing Store mediante JavaScript.

### Funcionalidades implementadas

- Generación dinámica delcatálogo desde un arreglo de productos.
- Búsqueda de productos por nombre.
- Filtrado de productos por categoría.
- Ordenamiento por nombre y precio.
- Visualización de la cantidad de resultados.
- Página dinámica de detalle utilizando parámetros en la URL.
- Información de nombre, imagen, descripción, precio y stock.
- Sistema de valoraciones y promedio de estrellas.
- Incorporación de productos al carrito.
- Aumento y disminución de cantidades.
- Eliminación de productos.
- Validación de cantidades según el stock disponible.
- Cálculo automático del total.
- Conservación del carrito al recargar la página.
- Botón flotante de contacto mediante WhatsApp.

### Representación de los productos

Los productos se almacenan como objetos dentro de un arreglo en
`js/productos.js`.

Cada producto contiene información como:

- Identificador.
- Nombre.
- Descripción.
- Categoría.
- Precio.
- Stock.
- Imagen.
- Valoraciones.

### Organización de JavaScript

- `productos.js`: contiene los productos de la tienda.
- `catalogo.js`: genera el catálogo, los filtros y el ordenamiento.
- `producto.js`: muestra el detalle del producto seleccionado.
- `carrito.js`: administra los productos y cantidades del carrito.
- `valoraciones.js`: calcula y muestra las valoraciones.
- `base.js`: contiene funciones compartidas de navegación e interfaz.

### LocalStorage

El carrito se conserva en el navegador mediante `LocalStorage`.

## Sprint 3 - Firebase, pedidos y valoraciones

### Funcionalidades incorporadas

- Registro, ingreso, cierre de sesión y perfil mediante Firebase Authentication.
- Identificación del usuario activo en la barra de navegación mediante su nombre.
- Documento de perfil en `usuarios/{uid}` con nombre, correo y rol.
- Catálogo y detalle obtenidos desde la colección `productos` de Cloud Firestore.
- Comprobación de sesión antes de confirmar una compra.
- Confirmación mediante una transacción que vuelve a verificar precios y stock.
- Registro del pedido con usuario, productos, cantidades, precios, subtotales, total,
  fecha y estado.
- Descuento de stock y cambio de disponibilidad dentro de la misma transacción.
- Vaciado del carrito únicamente después de una compra correcta.
- Historial de pedidos del usuario autenticado dentro de su perfil.
- Valoraciones y comentarios en Firestore, asociados al usuario y al producto.
- Panel protegido por rol administrador para cargar productos y consultar pedidos.
- Reglas de seguridad incluidas en `firestore.rules`.

### Colecciones de Firestore

- `usuarios`: perfiles y roles.
- `productos`: catálogo, precios, stock y disponibilidad.
- `pedidos`: compras realizadas por los usuarios.
- `valoraciones`: puntuación y comentario de cada usuario por producto.

### Preparación inicial

1. Publicar el contenido de `firestore.rules` en Firebase Console.
2. Registrar una cuenta desde Turing Store.
3. En Firebase Console, cambiar temporalmente el campo `rol` de esa cuenta a
   `admin` dentro de `usuarios/{uid}`.
4. Ingresar nuevamente y abrir `pages/admin.html`.
5. Presionar **Cargar productos iniciales** una sola vez.
6. Comprobar el catálogo, realizar una compra y revisar el pedido en el perfil.

El arreglo anterior dejó de ser la fuente principal del catálogo. Los datos de
`productosIniciales` se conservan únicamente para la primera carga administrativa.
