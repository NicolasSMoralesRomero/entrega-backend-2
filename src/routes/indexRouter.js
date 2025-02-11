import { Router } from "express";

import productRouter from './productRouter.js';
import cartRouter from './cartRouter.js';
import viewsRouter from './viewsRouter.js';
import { sessionRoutes } from './sessionRouter.js';

export const router = Router();

router.use('/api/products', productRouter);
router.use('/api/carts', cartRouter);
router.use('/', viewsRouter);
router.use('/api/sessions', sessionRoutes);
