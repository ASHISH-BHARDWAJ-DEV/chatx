import express from 'express';
import jwt from "jsonwebtoken";
import {signup , login , logout, updateProfile} from  "../controllers/auth.controller.js";
import { protectRoute } from '../middleware/auth.middleware.js';
import { arcjetProtection } from '../middleware/arcjet.middleware.js';
const router = express.Router();


router.use(arcjetProtection);

router.post("/signup",signup );

router.post("/login",login);

router.post("/logout",logout);

router.put("/update-profile", protectRoute , updateProfile);


router.get("/check", (req,res) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(200).json(null);
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({userId: decoded.userId});
  } catch (error) {
    return res.status(200).json(null);
  }
});

router.get("/me", protectRoute, (req,res) => {
  return res.status(200).json(req.user);
});
   

export default router;
