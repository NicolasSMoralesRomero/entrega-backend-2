# Proyecto Backend 2

Este es un proyecto que evoluciona el realizado para *Backend 1*.  
El repositorio del proyecto original es:  
[https://github.com/NicolasSMoralesRomero/entrega-backend](https://github.com/NicolasSMoralesRomero/entrega-backend)

En este proyecto se refactoriza el código del proyecto original, tomando como base el código de muestra ofrecido por CoderHouse.  
El apartado de **Productos** y **Carrito** sigue en construcción.

## Pasos para clonar y testear el código

1. Clonar el repositorio en tu máquina local con el siguiente comando:

   ```bash
   git clone https://github.com/NicolasSMoralesRomero/entrega-backend-2
   ```

2. Instalar las dependencias con el siguiente comando:
```bash
npm install
```

3. Configurar las credenciales de GitHub en el archivo passport.config.js.

Estas credenciales (GITHUB_CLIENT_ID y GITHUB_CLIENT_SECRET) deben ser definidas en dicho archivo, ubicado en la carpeta config.

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
#
Email: cindy@gmail.com
Contraseña: 12345
