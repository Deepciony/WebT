import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import swaggerUI from "swagger-ui-express";
import yaml from "yaml";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import productRoutes from "./routes/productRoute.js";
import databaseRoutes from "./routes/databaseRoute.js";
import memberRoutes from "./routes/memberRoute.js";
import cartRoutes from "./routes/cartRoute.js";

dotenv.config();

if (!process.env.SECRET_KEY) {
    throw new Error("SECRET_KEY is missing. Add it to .env before starting the API.");
}

const app = express();
const PORT = Number(process.env.PORT || 3000);

// Whitelist the frontend and allow cookies to travel with requests
app.use(cors({
    origin: [
        "http://localhost:5173", "http://127.0.0.1:5173",
        // vite preview and the nginx build (port 80)
        "http://localhost:4173", "http://127.0.0.1:4173",
        "http://localhost", "http://127.0.0.1"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());
app.use("/img_pd", express.static("img_pd"));
// member photos
app.use("/img_mem", express.static("img_mem"));
// Must run before the routers so req.cookies is filled in
app.use(cookieParser());
app.use(productRoutes);
app.use(databaseRoutes);
app.use(memberRoutes);
app.use(cartRoutes);

// API document (Lab 13): the spec lives next to this file, so it is found
// no matter which folder the server was started from
const here = path.dirname(fileURLToPath(import.meta.url));
const swaggerFile = fs.readFileSync(path.join(here, "swagger.yaml"), "utf-8");
const swaggerDoc = yaml.parse(swaggerFile);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDoc));

app.listen(PORT, () => {
    console.log(`API server is running at http://localhost:${PORT}`);
});
