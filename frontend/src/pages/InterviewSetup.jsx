import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function InterviewSetup() {
    const [role, setRole] = useState("");
    const [difficulty, setDifficulty] = useState("Medium");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const handleStartInterview = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setMessage("");

            const token = localStorage.getItem("token");

            // STEP 1: Create interview
            const interviewResponse = await api.post(
                "/interviews",
                {
                    role,
                    difficulty
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log(
                "Interview created:",
                interviewResponse.data
            );

            const interviewId =
                interviewResponse.data.interview._id;

            // STEP 2: Generate questions using Gemini
            const questionsResponse = await api.post(
                "/interviews/generate-questions",
                {
                    interviewId,
                    role,
                    difficulty
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log(
                "Questions generated:",
                questionsResponse.data
            );

            // STEP 3: Go to interview
            navigate(`/interview/${interviewId}`);

        } catch (error) {
            console.error(
                "Start interview error:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Failed to start interview"
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Start Interview 🚀</h1>

            <form onSubmit={handleStartInterview}>

                <div>
                    <label>Job Role</label>

                    <br />

                    <input
                        type="text"
                        placeholder="e.g. Java Developer"
                        value={role}
                        onChange={(e) =>
                            setRole(e.target.value)
                        }
                        required
                    />
                </div>

                <br />

                <div>
                    <label>Difficulty</label>

                    <br />

                    <select
                        value={difficulty}
                        onChange={(e) =>
                            setDifficulty(e.target.value)
                        }
                    >
                        <option value="Easy">
                            Easy
                        </option>

                        <option value="Medium">
                            Medium
                        </option>

                        <option value="Hard">
                            Hard
                        </option>
                    </select>
                </div>

                <br />

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Generating Interview..."
                        : "Start Interview 🚀"}
                </button>

            </form>

            {message && (
                <p>{message}</p>
            )}
        </div>
    );
}

export default InterviewSetup;