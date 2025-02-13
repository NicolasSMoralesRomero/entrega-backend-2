# Proyecto Backend 2

Este es un proyecto que evoluciona el realizado para *Backend 1*.  
El repositorio del proyecto original es:  
[https://github.com/NicolasSMoralesRomero/entrega-backend](https://github.com/NicolasSMoralesRomero/entrega-backend)

En este proyecto se refactoriza el código del proyecto original, tomando como base el código de muestra ofrecido por CoderHouse.  

## Pasos para clonar y testear el código

1. Clonar el repositorio en tu máquina local con el siguiente comando:

   ```bash
   git clone https://github.com/NicolasSMoralesRomero/entrega-backend-2
   ```

2. Instalar las dependencias con el siguiente comando:
```bash
npm install
```

3. Configurar las credenciales en el archivo .env, utilizando los datos proporcionados en la entrega.

4. Para levantar el servidor, ejecuta el siguiente comando:

```bash
npm start
```

5. Ingresa a la siguiente URL en tu navegador para probar la API:

http://localhost:8080/

## Usuarios de prueba
Se cargaron usuarios en la base de datos para realizar pruebas.
Usuarios disponibles:
#
Email: nico@gmail.com
Contraseña: 12345
Rol: Admin
#
Email: tomi@gmail.com
Contraseña: 12345
Rol: User

⚠️ **Advertencia:**  
A veces cuando recién se inició el servidor y se intenta iniciar sesión, la página no carga. Ingresar nuevamente a http://localhost:8080/ y volver a hacer el login. 

## Agregado para entrega final.
- Se optimizaron los endpoints de carrito y productos para corregir errores y mejorar su estabilidad.
- El botón "Agregar al carrito" desaparece en los productos cuando el usuario tiene rol "Admin".
- La opción "Carrito" se oculta en la barra de navegación si el usuario tiene rol "Admin".
- Si el carrito está vacío ($0), los botones "Finalizar compra" y "Vaciar carrito" se desactivan.
- Se mejoró la lógica de filtrado, eliminando opciones hardcodeadas y obteniendo dinámicamente las categorías desde la base de datos.
- En la vista productDetail.handlebars:
- Se agregó un formulario para actualizar los datos del producto.
-Se añadió un botón para eliminar el producto.
Ambas opciones solo están disponibles para usuarios con rol "Admin".
-Se realizaron ajustes responsivos en las plantillas Handlebars para mejorar la experiencia en dispositivos móviles.