import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "../routes/authRoutes";
import userRoutes from "../routes/userRoutes";

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

app.use(authRoutes);
app.use(userRoutes);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
