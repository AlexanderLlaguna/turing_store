*Turing Store 2 - Sprint 2*

Proyecto orientado a la venta de accesorios informáticos.

*Descripción*

Turing Store es una tienda web de accesorios tecnológicos para estudiar, trabajar y crear. En el sprint 2 se incorporó interactividad mediante JS, incluyendo un catálogo dinámico, búsqueda y filtros, detalle individual de productos y un carrito de compras persistente.

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

*Funcionalidades pendientes para el siguiente sprint*

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
