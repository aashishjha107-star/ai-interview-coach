const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
    createInterview,
    generateQuestions,
    getInterview,
    submitAnswer,
    getInterviewResult
} = require("../controllers/interviewController");

console.log("🔥 INTERVIEW ROUTES FILE LOADED");

const router = express.Router();

// Test route
router.get("/result-test", (req, res) => {
    console.log("🔥🔥 RESULT TEST HIT 🔥🔥");

    res.status(200).json({
        message: "Result test route works"
    });
});

// Existing test route
router.post("/test-answer", (req, res) => {
    console.log("🔥 TEST ROUTE HIT");

    res.status(200).json({
        message: "POST route is working"
    });
});

router.post("/", authMiddleware, createInterview);

router.post(
    "/generate-questions",
    authMiddleware,
    generateQuestions
);

router.post(
    "/:id/answer",
    authMiddleware,
    submitAnswer
);

// IMPORTANT: keep this BEFORE /:id
router.get(
    "/:id/result",
    authMiddleware,
    getInterviewResult
);

router.get(
    "/:id",
    authMiddleware,
    getInterview
);

module.exports = router;