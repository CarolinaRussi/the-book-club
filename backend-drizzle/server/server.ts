import "dotenv/config";
import "../config/cloudinary";
import express from "express";
import cors from "cors";
import authRoutes from "../routes/authRoutes";
import userRoutes from "../routes/userRoutes";
import clubRoutes from "../routes/clubRoutes";
import memberRoutes from "../routes/memberRoutes";
import bookRoutes from "../routes/bookRoutes";
import meetingRoutes from "../routes/meetingRoutes";
import googleAuthRoutes from "../routes/googleAuthRoutes";
import feedRoutes from "../routes/feedRoutes";

const app = express();
const port = process.env.PORT || 4001;

app.use(express.json());
app.use(cors());

app.use("/api", googleAuthRoutes);

app.use(authRoutes);
app.use(clubRoutes);
app.use(userRoutes);
app.use(feedRoutes);
app.use(bookRoutes);
app.use(meetingRoutes);
app.use(memberRoutes);

app.listen(port, () => {
  console.log(
    `Servidor Drizzle rodando em http://localhost:${port}`
  );
});
