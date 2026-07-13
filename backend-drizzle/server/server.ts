import "dotenv/config";
import "../config/cloudinary";
import express from "express";
import cors from "cors";
import cron from "node-cron";
import authRoutes from "../routes/authRoutes";
import userRoutes from "../routes/userRoutes";
import clubRoutes from "../routes/clubRoutes";
import memberRoutes from "../routes/memberRoutes";
import bookRoutes from "../routes/bookRoutes";
import meetingRoutes from "../routes/meetingRoutes";
import googleAuthRoutes from "../routes/googleAuthRoutes";
import feedRoutes from "../routes/feedRoutes";
import feedbackRoutes from "../routes/feedbackRoutes";
import { autoCompleteOverdueMeetings } from "../services/meetingService";

const app = express();
const port = process.env.PORT || 4001;

app.use(express.json());
app.use(cors());

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api", googleAuthRoutes);

app.use(authRoutes);
app.use(clubRoutes);
app.use(userRoutes);
app.use(feedRoutes);
app.use(feedbackRoutes);
app.use(bookRoutes);
app.use(meetingRoutes);
app.use(memberRoutes);

if (process.env.ENABLE_MEETING_AUTO_COMPLETE === "true") {
  cron.schedule(
    "0 3 * * *",
    () => {
      void autoCompleteOverdueMeetings()
        .then((result) => {
          console.log(
            `[meetings:auto-complete] today=${result.todayYmd} completed=${result.completed} failed=${result.failed}`,
          );
        })
        .catch((error) => {
          console.error("[meetings:auto-complete]", error);
        });
    },
    { timezone: "America/Sao_Paulo" },
  );
  console.log(
    "Auto-conclusão de encontros agendada (03:00 America/Sao_Paulo)",
  );
}

app.listen(port, () => {
  console.log(
    `Servidor Drizzle rodando em http://localhost:${port}`
  );
});
