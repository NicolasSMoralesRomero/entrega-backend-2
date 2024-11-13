import { Router } from 'express';
import { auth } from './users.router.js';



const router = Router();


router.get('/', (req, res) => {
    const data = {
        users: users
    };
    
    res.status(200).render('index', data);
});

router.get('/register', (req, res) => {
    const data = {
    };

    res.status(200).render('register', data);
});

router.get('/login', (req, res) => {
    const data = {
    };
    
    res.status(200).render('login', data);
});

router.get('/profile', auth, (req, res) => {
    const data = req.session.userData;
    
    res.status(200).render('profile', data);
});


export default router;
