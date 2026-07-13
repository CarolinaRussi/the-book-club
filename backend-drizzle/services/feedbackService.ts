import { FeedbackType } from "../enums/feedbackType";
import { createId } from "../utils/id";
import { getFeedbackToEmail } from "../utils/emailConfig";
import * as feedbackRepository from "../repositories/feedbackRepository";
import * as userRepository from "../repositories/userRepository";
import { sendFeedbackNotificationEmail } from "./emailService";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_PAGE_URL_LENGTH = 2000;

const FEEDBACK_TYPES = new Set<string>(Object.values(FeedbackType));

const TYPE_LABELS: Record<FeedbackType, string> = {
  [FeedbackType.BUG]: "Bug",
  [FeedbackType.IDEA]: "Ideia",
  [FeedbackType.OTHER]: "Outro",
};

export class FeedbackValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FeedbackValidationError";
  }
}

export type CreateFeedbackInput = {
  userId: string;
  type: unknown;
  message: unknown;
  pageUrl: unknown;
};

function normalizeType(type: unknown): FeedbackType {
  if (typeof type !== "string" || !FEEDBACK_TYPES.has(type)) {
    throw new FeedbackValidationError("Selecione o tipo de feedback.");
  }
  return type as FeedbackType;
}

function normalizeMessage(message: unknown): string {
  if (typeof message !== "string") {
    throw new FeedbackValidationError("Escreva sua mensagem.");
  }
  const trimmed = message.trim();
  if (!trimmed) {
    throw new FeedbackValidationError("Escreva sua mensagem.");
  }
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    throw new FeedbackValidationError(
      `A mensagem pode ter no máximo ${MAX_MESSAGE_LENGTH} caracteres.`,
    );
  }
  return trimmed;
}

function normalizePageUrl(pageUrl: unknown): string {
  if (typeof pageUrl !== "string") {
    throw new FeedbackValidationError("URL da página inválida.");
  }
  const trimmed = pageUrl.trim();
  if (!trimmed) {
    throw new FeedbackValidationError("URL da página inválida.");
  }
  if (trimmed.length > MAX_PAGE_URL_LENGTH) {
    throw new FeedbackValidationError("URL da página inválida.");
  }
  return trimmed;
}

export async function createFeedback(input: CreateFeedbackInput) {
  const type = normalizeType(input.type);
  const message = normalizeMessage(input.message);
  const pageUrl = normalizePageUrl(input.pageUrl);

  const foundUser = await userRepository.findUserById(input.userId);
  if (!foundUser) {
    throw new FeedbackValidationError("Usuária não encontrada.");
  }

  const savedFeedback = await feedbackRepository.insertFeedback({
    id: createId(),
    userId: input.userId,
    type,
    message,
    pageUrl,
  });

  if (!savedFeedback) {
    throw new Error("insert_feedback_failed");
  }

  try {
    const to = getFeedbackToEmail();
    await sendFeedbackNotificationEmail({
      to,
      typeLabel: TYPE_LABELS[type],
      userName: foundUser.name,
      userEmail: foundUser.email,
      userId: foundUser.id,
      message,
      pageUrl,
    });
  } catch (error) {
    console.error("Erro ao enviar e-mail de feedback:", error);
  }

  return {
    message: "Feedback enviado com sucesso!",
    feedback: {
      id: savedFeedback.id,
      type: savedFeedback.type,
      createdAt: savedFeedback.createdAt,
    },
  };
}
