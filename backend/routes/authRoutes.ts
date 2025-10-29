import { Router } from "express";
import { register } from "../controllers/authControllers";

const router = Router();

router.post("/register", register);
//router.post('/login', login);

export default router;
