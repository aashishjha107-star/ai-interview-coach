import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function Interview() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [interview, setInterview] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answer, setAnswer] = useState("");
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchInterview();
    }, [id]);

    const fetchInterview = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await api.get(
                `/interviews/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log("Interview:", response.data);

            setInterview(response.data.interview);

        } catch (error) {
            console.error(
                "Failed to load interview:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load interview"
            );
        } finally {
            setLoading(false);
        }
    };

    const submitAnswer = async () => {
        if (!answer.trim()) {
            setError("Please enter an answer.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const token = localStorage.getItem("token");

            const question =
                interview.questions[currentQuestion];

            const response = await api.post(
                `/interviews/${id}/answer`,
                {
                    questionId: question._id,
                    answer: answer
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log(
                "Evaluation:",
                response.data
            );

            // Show AI evaluation
            setFeedback({
                score: response.data.question.score,
                feedback: response.data.question.feedback
            });

            // Update question locally
            setInterview((prev) => {
                const updatedQuestions = [
                    ...prev.questions
                ];

                updatedQuestions[currentQuestion] = {
                    ...updatedQuestions[currentQuestion],
                    answer: answer,
                    score: response.data.question.score,
                    feedback:
                        response.data.question.feedback
                };

                return {
                    ...prev,
                    questions: updatedQuestions
                };
            });

        } catch (error) {
            console.error(
                "Failed to submit answer:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to evaluate answer"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const nextQuestion = () => {
        if (
            currentQuestion <
            interview.questions.length - 1
        ) {
            setCurrentQuestion(
                currentQuestion + 1
            );

            setAnswer("");
            setFeedback(null);
            setError("");
        } else {
            navigate(
                `/interview/${id}/result`
            );
        }
    };

    if (loading) {
        return (
            <div>
                <h2>Loading interview...</h2>
            </div>
        );
    }

    if (!interview) {
        return (
            <div>
                <h2>
                    {error || "Interview not found"}
                </h2>
            </div>
        );
    }

    if (
        !interview.questions ||
        interview.questions.length === 0
    ) {
        return (
            <div>
                <h2>No questions found.</h2>
            </div>
        );
    }

    const question =
        interview.questions[currentQuestion];

    if (!question) {
        return (
            <div>
                <h2>Interview completed! 🎉</h2>

                <button
                    onClick={() =>
                        navigate(
                            `/interview/${id}/result`
                        )
                    }
                >
                    View Result
                </button>
            </div>
        );
    }

    return (
        <div>
            <h1>AI Interview Coach</h1>

            <h2>{interview.role}</h2>

            <p>
                Difficulty: {interview.difficulty}
            </p>

            <hr />

            <h3>
                Question {currentQuestion + 1} of{" "}
                {interview.questions.length}
            </h3>

            <p>
                {question.question}
            </p>

            {!feedback && (
                <>
                    <textarea
                        rows="8"
                        cols="60"
                        placeholder="Type your answer here..."
                        value={answer}
                        onChange={(e) =>
                            setAnswer(e.target.value)
                        }
                    />

                    <br />
                    <br />

                    <button
                        onClick={submitAnswer}
                        disabled={submitting}
                    >
                        {submitting
                            ? "AI is evaluating..."
                            : "Submit Answer"}
                    </button>
                </>
            )}

            {feedback && (
                <div>
                    <hr />

                    <h2>
                        AI Evaluation 🤖
                    </h2>

                    <h3>
                        Score: {feedback.score}/10
                    </h3>

                    <h3>Feedback</h3>

                    <p>
                        {feedback.feedback}
                    </p>

                    <br />

                    <button
                        onClick={nextQuestion}
                    >
                        {currentQuestion ===
                        interview.questions.length - 1
                            ? "Finish Interview 🏆"
                            : "Next Question →"}
                    </button>
                </div>
            )}

            {error && (
                <p>
                    {error}
                </p>
            )}
        </div>
    );
}

export default Interview;