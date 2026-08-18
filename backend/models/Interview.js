const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        role: {
            type: String,
            required: true
        },

        difficulty: {
            type: String,
            required: true,
            enum: ["Easy", "Medium", "Hard"]
        },

        questions: [
            {
                question: {
                    type: String,
                    required: true
                },

                answer: {
                    type: String,
                    default: ""
                },

                score: {
                    type: Number,
                    default: 0
                },

                feedback: {
                    type: String,
                    default: ""
                }
            }
        ],

        overallScore: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Interview", interviewSchema);