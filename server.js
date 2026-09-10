import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./src/router/productRoute.js";
import authRoutes from "./src/router/authRoute.js";
import databaseRoutes from "./src/router/databaseRoute.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());
app.use("/img_pd", express.static("img_pd"));
app.use(productRoutes);
app.use(authRoutes);
app.use(databaseRoutes);

app.listen(PORT, () => {
    console.log(`API server is running at http://localhost:${PORT}`);
});