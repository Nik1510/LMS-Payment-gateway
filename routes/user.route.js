import express from 'express'
import {createUserAccount, getCurrentUserProfile, signOutUser } from '../controllers/user.controller.js'
import {isAuthenticated}  from '../middleware/auth.middleware.js'
import upload from '../utils/multer.js';
import { validateSignup } from '../middleware/validation.middleware.js';

const router = express.Router();


// Auth routes
router.post("/signup",validateSignup,createUserAccount);
router.post("/",authenticateUser);
router.post('/signout',signOutUser);


// Profile routes 
router.get('/profile',isAuthenticated, getCurrentUserProfile)
router.patch('/profile',isAuthenticated, upload.single("avatar"),updateUserProfile)


export default router;