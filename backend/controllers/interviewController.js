const Interview = require("../models/Interview");
const { GoogleGenAI } = require("@google/genai");

const createInterview = async (req, res) => {
    try {
        const { role, difficulty } = req.body;

        const interview = await Interview.create({
            user: req.userId,
            role,
            difficulty
        });

        res.status(201).json({
            message: "Interview created successfully",
            interview
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create interview",
            error: error.message
        });
    }
};


const generateQuestions = async (req, res) => {
    try {
        const { interviewId, role, difficulty } = req.body;

        console.log(
            "Controller API key exists:",
            !!process.env.GEMINI_API_KEY
        );

        // Find the interview
        const interview = await Interview.findById(interviewId);

        if (!interview) {
            return res.status(404).json({
                message: "Interview not found"
            });
        }

        // Create Gemini client
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });

        const prompt = `
Generate 5 interview questions for a ${role} position.

Difficulty: ${difficulty}

Return only the questions.
Number them from 1 to 5.
Do not provide answers or explanations.
`;

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt
        });

        // Convert Gemini response into separate questions
        const questions = response.text
            .split("\n")
            .map(q => q.trim())
            .filter(q => q.length > 0);

        // Save questions in MongoDB
        interview.questions = questions.map(q => ({
            question: q
        }));

        await interview.save();

        res.status(200).json({
            message: "Questions generated successfully",
            questions: interview.questions
        });

    } catch (error) {
        console.error("Gemini Error:", error);

        res.status(500).json({
            message: "Failed to generate questions",
            error: error.message
        });
    }
};
const getInterview = async (req, res) => {
    try {
        const { id } = req.params;

        const interview = await Interview.findById(id);

        if (!interview) {
            return res.status(404).json({
                message: "Interview not found"
            });
        }

        // Make sure the interview belongs to the logged-in user
        if (interview.user.toString() !== req.userId) {
            return res.status(403).json({
                message: "Not authorized to access this interview"
            });
        }

        res.status(200).json({
            message: "Interview fetched successfully",
            interview
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch interview",
            error: error.message
        });
    }
};
const submitAnswer = async (req, res) => {
    console.log("🔥🔥🔥 SUBMIT ANSWER CONTROLLER HIT 🔥🔥🔥");
    try {
        const { id } = req.params;
        const { questionId, answer } = req.body;

        if (!questionId || !answer) {
            return res.status(400).json({
                message: "questionId and answer are required"
            });
        }

        // Find interview
        const interview = await Interview.findById(id);

        if (!interview) {
            return res.status(404).json({
                message: "Interview not found"
            });
        }

        // Check ownership
        if (interview.user.toString() !== req.userId) {
            return res.status(403).json({
                message: "Not authorized to access this interview"
            });
        }

        // Find question
        const question = interview.questions.find(
            q => q._id.toString() === questionId
        );

        if (!question) {
            return res.status(404).json({
                message: "Question not found"
            });
        }

        // Save answer
        question.answer = answer;

        // Create Gemini client
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });

        // Prompt Gemini to evaluate the answer
        const prompt = `
You are an expert technical interviewer.

Evaluate the candidate's answer.

Interview Question:
${question.question}

Candidate's Answer:
${answer}

Give a score from 0 to 10.

Evaluate based on:
- Technical correctness
- Understanding of the concept
- Completeness
- Clarity

Return ONLY valid JSON in this exact format:

{
    "score": 0,
    "feedback": "short constructive feedback"
}

Do not include markdown.
Do not include anything outside the JSON.
`;

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt
        });

        // Convert Gemini response to JSON
        let evaluationText = response.text.trim();

        // Remove markdown code fences if Gemini adds them
        evaluationText = evaluationText
            .replace(/^```json\s*/, "")
            .replace(/^```\s*/, "")
            .replace(/\s*```$/, "")
            .trim();

        const evaluation = JSON.parse(evaluationText);

        // Save evaluation
       
question.score = evaluation.score;
question.feedback = evaluation.feedback;

console.log("Question score:", question.score);
console.log("All questions:", interview.questions);

const answeredQuestions = interview.questions.filter(
    q => q.answer && q.answer.trim() !== ""
);

console.log("Answered questions:", answeredQuestions.length);

const totalScore = answeredQuestions.reduce(
    (sum, q) => sum + q.score,
    0
);

console.log("Total score:", totalScore);

if (answeredQuestions.length > 0) {
    interview.overallScore = Number(
        (totalScore / answeredQuestions.length).toFixed(2)
    );
}

console.log("Overall score before save:", interview.overallScore);

await interview.save();

console.log("Overall score after save:", interview.overallScore);

        res.status(200).json({
            message: "Answer evaluated successfully",
            question
        });

    } catch (error) {
        console.error("Answer Evaluation Error:", error);

        res.status(500).json({
            message: "Failed to evaluate answer",
            error: error.message
        });
    }
};
const getInterviewResult = async (req, res) => {
    try {
        const { id } = req.params;

        const interview = await Interview.findById(id);

        if (!interview) {
            return res.status(404).json({
                message: "Interview not found"
            });
        }

        if (interview.user.toString() !== req.userId) {
            return res.status(403).json({
                message: "Not authorized to access this interview"
            });
        }

        const answeredQuestions = interview.questions.filter(
            q => q.answer && q.answer.trim() !== ""
        );

        res.status(200).json({
            message: "Interview result fetched successfully",
            result: {
                interviewId: interview._id,
                role: interview.role,
                difficulty: interview.difficulty,
                totalQuestions: interview.questions.length,
                answeredQuestions: answeredQuestions.length,
                overallScore: interview.overallScore,
                completed:
                    answeredQuestions.length === interview.questions.length,
                questions: interview.questions
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch interview result",
            error: error.message
        });
    }
};
module.exports = {
    createInterview,
    generateQuestions,
    getInterview,
    submitAnswer,
    getInterviewResult
};