import express from 'express';
import * as authController from '../controllers/userController.js';
import auth from '../middlewares/authMiddleware.js'

const authRoutes = express.Router();
authRoutes.post('/register', authController.registerUser);
authRoutes.post('/login', authController.loginUser);
authRoutes.get('/all', auth(), authController.getUser);
export default authRoutes;
