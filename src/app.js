import dotenv from "dotenv";
dotenv.config();
import express, { json, urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import  prisma from "./database/prisma.js";

const app = express();

app.use(json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(urlencoded({ extended: true }));
app.use(cookieParser());


// routes
import userRoutes from "./routes/User.router.js"
import jobRoutes from "./routes/Job.router.js"
import resumeRoutes from "./routes/Resume.router.js"

app.use("/api/v1/user",userRoutes)
app.use("/api/v1/job",jobRoutes)
app.use("/api/v1/resume",resumeRoutes)



app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});
