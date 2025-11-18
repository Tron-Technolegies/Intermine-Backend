import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import morgan from "morgan";
import errorHandleMiddleware from "./middlewares/errorHandlingMiddleware.js";

import authRouter from "./routers/authRouter.js";
import userRouter from "./routers/userRouter.js";
import adminMinerRouter from "./routers/adminMinerRouter.js";
import adminClientRouter from "./routers/adminClientRouter.js";
import minerRouter from "./routers/minerRouter.js";
import adminIssueRouter from "./routers/adminIssueRouter.js";
import { authenticateUser, isAdmin } from "./middlewares/authMiddleWare.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("tiny"));
}

app.get("/", (req, res) => {
  res.send("<h1>Welcome to Intermine Server</h1>");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", authenticateUser, userRouter);
app.use("/api/v1/miner", authenticateUser, minerRouter);
app.use("/api/v1/admin/miner", authenticateUser, adminMinerRouter);
app.use("/api/v1/admin/user", authenticateUser, isAdmin, adminClientRouter);
app.use("/api/v1/admin/issue", authenticateUser, isAdmin, adminIssueRouter);

app.use("/*path", (req, res) => {
  res.status(404).json({ message: "Not Found in Server" });
});

app.use(errorHandleMiddleware);

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Database connected successfully`);
  app.listen(port, () => {
    console.log(`Server started listening to port ${port}`);
  });
} catch (error) {
  console.log(error);
  process.exit(1);
}
