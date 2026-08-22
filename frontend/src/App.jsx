import {
    BrowserRouter,
    Routes,
    Route,
    Link,
    useNavigate
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import InterviewSetup from "./pages/InterviewSetup";
import Interview from "./pages/Interview";
import InterviewResult from "./pages/InterviewResult";

function Home() {
    return (
        <div>
            <h1>AI Interview Coach</h1>

            <p>
                Practice interviews with AI-powered feedback.
            </p>

            <Link to="/login">
                <button>Login</button>
            </Link>

            {" "}

            <Link to="/register">
                <button>Register</button>
            </Link>
        </div>
    );
}

function Dashboard() {
    const navigate = useNavigate();

    return (
        <div>
            <h1>AI Interview Coach Dashboard</h1>

            <p>
                Welcome to your interview dashboard! 🚀
            </p>

            <button
                onClick={() =>
                    navigate("/interview/setup")
                }
            >
                Start Interview 🚀
            </button>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/interview/setup"
                    element={<InterviewSetup />}
                />

                <Route
                    path="/interview/:id"
                    element={<Interview />}
                />

                <Route
                    path="/interview/:id/result"
                    element={<InterviewResult />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;