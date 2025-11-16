const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const errorHandler = require("./middlewares/error.middleware");

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res) => {
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.get("/health", (req, res) => res.json({ ok: true }));

app.use(errorHandler);

module.exports = app;
