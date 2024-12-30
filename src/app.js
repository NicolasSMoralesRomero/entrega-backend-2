import express from 'express';
import { engine } from 'express-handlebars';
import {Server} from 'socket.io';
import mongoose from 'mongoose';

import productRouter from './routes/productRouter.js';
import cartRouter from './routes/cartRouter.js';
import viewsRouter from './routes/viewsRouter.js';
import __dirname from './utils/constantsUtil.js';
import websocket from './websocket.js';

const app = express();

const uri = 'mongodb+srv://nicomorales:C0hsHN0Of0oXC5aq@cluster0.rqnge.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(uri);

//Handlebars Config
app.engine('handlebars', engine({ defaultLayout: 'main' }));
app.set('views', __dirname + 'views');
app.set('view engine', 'handlebars');

//Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

//Routers
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);
app.use('/', viewsRouter);

const PORT = 8080;
const httpServer = app.listen(PORT, () => {
    console.log(`Start server in PORT ${PORT}`);
});

const io = new Server(httpServer);

websocket(io);