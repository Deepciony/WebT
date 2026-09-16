import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import productRoutes from "./src/router/productRoute.js";
import authRoutes from "./src/router/authRoute.js";
import databaseRoutes from "./src/router/databaseRoute.js";
import memberRoutes from "./src/router/memberRoute.js";

dotenv.config();

if (!process.env.SECRET_KEY) {
    throw new Error("SECRET_KEY is missing. Add it to .env before starting the API.");
}

const app = express();
const PORT = Number(process.env.PORT || 3000);

// Whitelist the frontend and allow cookies to travel with requests
app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());
app.use("/img_pd", express.static("img_pd"));
// Must run before the routers so req.cookies is filled in
app.use(cookieParser());
app.use(productRoutes);
app.use(authRoutes);
app.use(databaseRoutes);
app.use(memberRoutes);

app.listen(PORT, () => {
    console.log(`API server is running at http://localhost:${PORT}`);
});
