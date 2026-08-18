const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
    createInterview,
    generateQuestions,
    getInterview,
    submitAnswer
} = require("../controllers/interviewController");

console.log("🔥 INTERVIEW ROUTES FILE LOADED");

const router = express.Router();

router.post("/test-answer", (req, res) => {
    console.log("🔥 TEST ROUTE HIT");

    res.status(200).json({
        message: "POST route is working"
    });
});

router.post("/", authMiddleware, createInterview);

router.post("/generate-questions", authMiddleware, generateQuestions);

router.get("/:id", authMiddleware, getInterview);

router.post("/:id/answer", authMiddleware, submitAnswer);

module.exports = router;