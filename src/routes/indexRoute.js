import express from 'express'
import authRoutes from './userRoute.js'
import chatRoutes from './chatRoute.js'

const routes = express.Router();
routes.use('/auth', authRoutes);
routes.use('/chat', chatRoutes)
export default routes