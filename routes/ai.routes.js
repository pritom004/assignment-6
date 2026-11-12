import express from "express";
import { suggestTask } from "../controllers/ai.controller.js";


const router = express.Router();

router.post("/suggestion", suggestTask)


export default router;