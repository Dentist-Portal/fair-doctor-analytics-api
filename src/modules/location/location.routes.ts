import express from "express";
import { getAllLocations } from "./location.controller";
const router = express.Router();

router.get("/", getAllLocations);

export default router;
