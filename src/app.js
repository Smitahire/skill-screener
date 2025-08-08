import dotenv from "dotenv";
dotenv.config();
import express, { json, urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import  prisma from "./database/prisma";

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



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
