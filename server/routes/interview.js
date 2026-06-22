import express from "express";

import {
startInterview,
nextQuestion,
finalReport
}
from "../controllers/aicontrollers.js";


const router = express.Router();



router.post(
"/start",
startInterview
);


router.post(
"/next",
nextQuestion
);


router.post(
"/report",
finalReport
);



export default router;