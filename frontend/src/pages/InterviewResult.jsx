import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function InterviewResult() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchResult();
    }, [id]);

    const fetchResult = async () => {
        try {
            const token = localStorage.getItem("token");

            console.log("Fetching result for:", id);

            const response = await api.get(
                `/interviews/${id}/result`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log("RESULT:", response.data);

            setResult(response.data.result);

        } catch (error) {
            console.error(
                "Failed to fetch result:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load interview result"
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div>
                <h1>Loading Result...</h1>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h1>Something went wrong ❌</h1>
                <p>{error}</p>

                <button
                    onClick={() =>
                        navigate("/dashboard")
                    }
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    if (!result) {
        return (
            <div>
                <h1>No result found.</h1>
            </div>
        );
    }

    return (
        <div>
            <h1>🏆 Interview Result</h1>

            <h2>{result.role}</h2>

            <p>
                Difficulty: {result.difficulty}
            </p>

            <hr />

            <h2>
                Overall Score: {result.overallScore}/10
            </h2>

            <p>
                Questions Answered:{" "}
                {result.answeredQuestions} /{" "}
                {result.totalQuestions}
            </p>

            <p>
                Status:{" "}
                {result.completed
                    ? "Completed ✅"
                    : "Incomplete ⚠️"}
            </p>

            <hr />

            <h2>Question Results</h2>

            {result.questions.map(
                (question, index) => (
                    <div key={question._id}>
                        <h3>
                            Question {index + 1}
                        </h3>

                        <p>
                            <strong>
                                {question.question}
                            </strong>
                        </p>

                        <p>
                            <strong>
                                Score:
                            </strong>{" "}
                            {question.score}/10
                        </p>

                        {question.answer && (
                            <p>
                                <strong>
                                    Your Answer:
                                </strong>{" "}
                                {question.answer}
                            </p>
                        )}

                        {question.feedback && (
                            <p>
                                <strong>
                                    AI Feedback:
                                </strong>{" "}
                                {question.feedback}
                            </p>
                        )}

                        <hr />
                    </div>
                )
            )}

            <button
                onClick={() =>
                    navigate("/dashboard")
                }
            >
                Back to Dashboard
            </button>

            <button
                onClick={() =>
                    navigate("/interview/setup")
                }
            >
                Take Another Interview 🚀
            </button>
        </div>
    );
}

export default InterviewResult;