import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "../routes/authRoutes";
import userRoutes from "../routes/userRoutes";
import clubRoutes from "../routes/clubRoutes";
import memberRoutes from "../routes/memberRoutes";

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

app.use(authRoutes);
app.use(clubRoutes);
app.use(userRoutes);
app.use(memberRoutes);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
