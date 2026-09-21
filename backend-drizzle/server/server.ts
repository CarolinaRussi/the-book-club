import "dotenv/config";
import "../config/cloudinary";
import express from "express";
import cors from "cors";
import cron from "node-cron";
import authRoutes from "../routes/authRoutes";
import userRoutes from "../routes/userRoutes";
import clubRoutes from "../routes/clubRoutes";
import locationRoutes from "../routes/locationRoutes";
import memberRoutes from "../routes/memberRoutes";
import bookRoutes from "../routes/bookRoutes";
import meetingRoutes from "../routes/meetingRoutes";
import googleAuthRoutes from "../routes/googleAuthRoutes";
import feedRoutes from "../routes/feedRoutes";
import feedbackRoutes from "../routes/feedbackRoutes";
import readingDrawRoutes from "../routes/readingDrawRoutes";
import { autoCompleteOverdueMeetings } from "../services/meetingService";
import { expireOverdueReadingDraws } from "../services/readingDrawService";
import { sendReviewReminderDigests } from "../services/reviewReminderService";

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
app.use(locationRoutes);
app.use(userRoutes);
app.use(feedRoutes);
app.use(feedbackRoutes);
app.use(readingDrawRoutes);
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

if (process.env.ENABLE_REVIEW_REMINDER === "true") {
  cron.schedule(
    "0 10 1,15 * *",
    () => {
      void sendReviewReminderDigests()
        .then((result) => {
          console.log(
            `[reviews:remind] recipients=${result.recipients} sent=${result.sent} failed=${result.failed}`,
          );
        })
        .catch((error) => {
          console.error("[reviews:remind]", error);
        });
    },
    { timezone: "America/Sao_Paulo" },
  );
  console.log(
    "Lembrete de notas agendado (10:00 dias 1 e 15 America/Sao_Paulo)",
  );
}

if (process.env.ENABLE_READING_DRAW_EXPIRE === "true") {
  cron.schedule(
    "15 * * * *",
    () => {
      void expireOverdueReadingDraws()
        .then((result) => {
          console.log(
            `[reading-draws:expire] expired=${result.expired}`,
          );
        })
        .catch((error) => {
          console.error("[reading-draws:expire]", error);
        });
    },
    { timezone: "America/Sao_Paulo" },
  );
  console.log(
    "Expiração de sorteios agendada (minuto 15 de cada hora, America/Sao_Paulo)",
  );
}

app.listen(Number(port), "0.0.0.0", () => {
  console.log(
    `Servidor Drizzle rodando em http://localhost:${port}`
  );
});
