import express from 'express';
import handlebars from 'express-handlebars';
import {Server} from 'socket.io';
import mongoose from 'mongoose';
import session from "express-session";
import cookieParser from "cookie-parser";
import MongoStore from "connect-mongo";
import passport from 'passport';

import { CONFIG } from './config/config.js';

import productRouter from './routes/productRouter.js';
import cartRouter from './routes/cartRouter.js';
import viewsRouter from './routes/viewsRouter.js';
import __dirname from './utils/constantsUtil.js';
import websocket from './websocket.js';
import { sessionRoutes } from './routes/sessionRouter.js';
import { initializePassport } from './config/passport.config.js';

const app = express();

// Mongoose
mongoose
  .connect(CONFIG.MONGO.URL)
  .then(() => console.log("Conectado a la Base de datos"))
  .catch((err) => console.error(err));

// Configuración Handlebars
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/../views');
app.set('view engine', 'handlebars');


//Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(cookieParser());
app.use(
  session({
    secret: CONFIG.MONGO.SECRET,
    saveUninitialized: false,
    resave: false,
    store: MongoStore.create({
      mongoUrl: CONFIG.MONGO.URL,
      ttl: 6000,
    }),
  })
);

// Configuración Passport
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

//Routers
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);
app.use('/', viewsRouter);
app.use('/api/sessions', sessionRoutes);

const httpServer = app.listen(CONFIG.PORT, () => {
    console.log(`Start server in PORT ${CONFIG.PORT}`);
});

const io = new Server(httpServer);

websocket(io);