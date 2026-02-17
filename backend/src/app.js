require('dotenv').config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const db = require("./models");
const apiRoutes = require("./routes");
const app = express();
const PORT=process.env.SERVER_PORT;

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST","PUT"],
  credentials: true
}));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

//sync with database
db.sequelize.sync()
  .then(() => {
    console.log(" Database in sync.");
  })
  .catch((err) => {
    console.error("Database Connection Failed ", err.message);
  });

//health check api route
app.get("/", (req, res) => {
  res.json({ message: "HSFC booking System API is running" });
});

app.use("/api", apiRoutes);


app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});