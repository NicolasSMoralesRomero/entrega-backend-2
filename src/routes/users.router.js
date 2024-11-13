import { Router } from 'express';
import { uploader } from '../uploader.js';
import userManager from '../dao/users.manager.js';
import passport from 'passport';
import initAuthStrategies from '../auth/passport.config.js';

const router = Router();
const manager = new userManager();
initAuthStrategies();

export const auth = (req, res, next) => {
    if (req.session?.userData && req.session?.userData.admin) {
        //if (req.session?.passport){
        next();
    } else {
        res.status(401).send({ error: 'No autorizado', data: [] });
    }
}

router.get('/', async (req, res) => {
    try {
        // Utilizamos el método find a través del modelo, para obtener la lista completa de users desde la colección
        const data = await userModel.find().lean();
        res.status(200).send({ error: null, data: data });
    } catch (err) {
        res.status(500).send({ error: 'Error interno de ejecución del servidor', data: [] });
    }
});

// router.post('/', auth, uploader.array('thumbnail', 3), (req, res) => { // gestión de múltiples archivos
router.post('/', auth, uploader.single('thumbnail'), async (req, res) => { // gestión de archivo único
    try {
        const { name, age, email } = req.body; // desestructuramos (extraemos) las ppdades que nos interesan del body

        if (name != '' && age != '' && email != '') {
            // Utilizamos el método create(), pasándole un objeto con los datos del nuevo usuario
            const process = await(userModel.create({ name: name, age: +age, email: email }))
            res.status(200).send({ error: null, data: process });
        } else {
            res.status(400).send({ error: 'Faltan campos obligatorios', data: [] });
        }
    } catch (err) {
        res.status(500).send({ error: 'Error interno de ejecución del servidor', data: [] });
    }
});

// ? indica parámetro opcional
router.patch('/:id?', auth, async (req, res) => {
    try {
        const id = req.params.id;
        
        if (!id) {
            res.status(400).send({ error: 'Se requiere parámetro id', data: null });
        } else {
            const { name, age, email } = req.body;
            const filter = { _id: id };
            const update = {};
            if (name) update.name = name;
            if (age) update.age = +age;
            if (email) update.email = email;
            const options = { new: true }; // Retorna como resultado de la consulta el documento actualizado
            
            // Aprovechamos el método findOneAndUpdate(), filter nos permite especificar el criterio de búsqueda
            // para localizar el documento (por id por ej), update incluye solo los campos válidos que querramos
            // tomar del req.body.
            const process = await userModel.findOneAndUpdate(filter, update, options);
            if (!process) {
                res.status(404).send({ error: 'No se encuentra el usuario', data: [] });
            } else {
                // Si la consulta es exitosa, retorna el documento actualizado
                res.status(200).send({ error: null, data: process });
            }
        }
    } catch (err) {
        res.status(500).send({ error: 'Error interno de ejecución del servidor', data: [] });
    }
});

// ? indica parámetro opcional
router.delete('/:id?', auth, async (req, res) => {
    try {
        const id = req.params.id;
        
        if (!id) {
            res.status(400).send({ error: 'Se requiere parámetro id', data: null });
        } else {
            const filter = { _id: id };
            const options = {};
            
            // Aprovechamos el método findOneAndDelete(), filter nos permite especificar el criterio de búsqueda
            // para localizar el documento (por id por ej).
            const process = await userModel.findOneAndDelete(filter, options);
            if (!process) {
                res.status(404).send({ error: 'No se encuentra el usuario', data: [] });
            } else {
                // Si la consulta es exitosa, retorna el documento que acaba de borrarse
                res.status(200).send({ error: null, data: process });
            }
        }
    } catch (err) {
        res.status(500).send({ error: 'Error interno de ejecución del servidor', data: [] });
    }
});

router.post('/register', async (req, res) => {
    const { firstname, lastname, username, password } = req.body;

    if (firstname != '' && lastname != '' && username != '' && password != '') {
        const process = await manager.register({ firstName: firstname, lastName: lastname, email: username, password: password });

        if (process) {
            res.status(200).send({ error: null, data: 'Usuario registrado, bienvenido!' });
        } else {
            res.status(401).send({ error: 'Ya existe un usuario con ese email', data: [] });
        }
    } else {
        res.status(400).send({ error: 'Faltan campos: obligatorios firstname, lastname, email, password', data: [] });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (username != '' && password != '') {
        const process = await manager.authenticate(username, password);
        if (process) {
            req.session.userData = { firstName: process.firstName, lastName: process.lastName, email: process.email, admin: true };

            // Nos aseguramos que los datos de sesión se hayan guardado
            req.session.save(err => {
                if (err) return res.status(500).send({ error: 'Error al almacenar datos de sesión', data: [] });

                // Podemos tanto retornar respuesta como es habitual, o redireccionar a otra plantilla
                // res.status(200).send({ error: null, data: 'Usuario autenticado, sesión iniciada!' });
                res.redirect('/views/profile');
            });
        } else {
            res.status(401).send({ error: 'Usuario o clave no válidos', data: [] });
        }
    } else {
        res.status(400).send({ error: 'Faltan campos: obligatorios username, password', data: [] });
    }
});

router.post('/pplogin', passport.authenticate('login', { failureRedirect: '/views/login' }), async (req, res) => {

    req.session.save(err => {
        if (err) return res.status(500).send({ error: 'Error al almacenar datos de sesión', data: [] });

        res.redirect('/views/profile');
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if(err) return res.status(500).send({ error: 'Error al cerrar sesión', data: [] });

        res.redirect('/views/login')
    })
})

router.get('/private', auth, (req, res) => {
    res.status(200).send({ error: null, data: 'Este contenido solo es visible por usuarios autenticados' });
});


export default router;
