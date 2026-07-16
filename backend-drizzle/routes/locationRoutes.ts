import { Router } from "express";
import { listCities, listStates } from "../controllers/location";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/locations/states", authMiddleware, listStates);
router.get(
  "/locations/states/:stateId/cities",
  authMiddleware,
  listCities,
);

export default router;
