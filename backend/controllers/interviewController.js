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
    try {
        const { id } = req.params;
        const { questionId, answer } = req.body;

        // Find the interview
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

        // Find the question
        const question = interview.questions.find(
            q => q._id.toString() === questionId
        );

        if (!question) {
            return res.status(404).json({
                message: "Question not found"
            });
        }

        // Save the user's answer
        question.answer = answer;

        // Save changes to MongoDB
        await interview.save();

        res.status(200).json({
            message: "Answer submitted successfully",
            question
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to submit answer",
            error: error.message
        });
    }
};

module.exports = {
    createInterview,
    generateQuestions,
    getInterview,
    submitAnswer
};