const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const interviewRoutes = require("./routes/interviewRoutes");
const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
console.log("SERVER FILE:", __filename);
console.log("INTERVIEW ROUTES:", require.resolve("./routes/interviewRoutes"));

const app = express();
const PORT = process.env.PORT || 5000;

console.log("Gemini key loaded:", !!process.env.GEMINI_API_KEY);

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.post("/api/interviews/test-direct", (req, res) => {
    console.log("🔥 DIRECT POST ROUTE HIT");

    res.status(200).json({
        message: "Direct POST route works"
    });
});
app.use("/api/interviews", interviewRoutes);

// Home route
app.get("/", (req, res) => {
    res.send("AI Interview Coach Backend is running!");
});
app.use((req, res, next) => {
    console.log("REQUEST RECEIVED:", req.method, req.originalUrl);
    next();
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});