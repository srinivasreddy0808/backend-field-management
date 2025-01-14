const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const AppError = require("./utils/appError");
const userRouter = require("./routes/userRouter");
const fieldRouter = require("./routes/fieldRouter");
const globalErrorHandler = require("./controllers/errorController");

const app = express();
dotenv.config({
  path: "./config.env",
});

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/fields", fieldRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
