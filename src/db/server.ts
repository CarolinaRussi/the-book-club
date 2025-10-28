import express from "express";
import cors from "cors";
import authRoutes from "../routes/authRoutes";
import userRoutes from "../routes/userRoutes";

const app = express();

app.use(express.json());
app.use(cors());

app.use(authRoutes);
app.use(userRoutes);

app.listen(4000, () => {
  console.log("Servidor rodando em http://localhost:4000");
});
