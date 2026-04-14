import express from "express";
import { getAllLocations } from "./location.controller";
const Router = express.Router();

Router.get("/", getAllLocations);

export default Router;