require('dotenv').config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const db = require("./models");
const apiRoutes = require("./routes");
const app = express();
const PORT = process.env.SERVER_PORT;

// --- LOGGING FIRST ---
app.use(morgan("dev"));


app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Rate limiting for login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,    
  max: 10,                     
  message: { error: "Too many login attempts. Try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/api/auth/login", loginLimiter);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- DATABASE SYNC ---
db.sequelize.sync()
  .then(() => {
    console.log(" Database in sync.");
  })
  .catch((err) => {
    console.error("Database Connection Failed ", err.message);
  });

// --- ROUTES ---
app.get("/", (req, res) => {
  res.json({ message: "HSFC booking System API is running" });
});

app.use("/api", apiRoutes);

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
