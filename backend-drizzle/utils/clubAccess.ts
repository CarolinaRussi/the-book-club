import type { Response } from "express";
import * as bookRepository from "../repositories/bookRepository";
import * as clubRepository from "../repositories/clubRepository";

export async function respondIfNotClubMember(
  userId: string | undefined,
  clubId: string,
  res: Response
): Promise<boolean> {
  if (!userId) {
    res.status(401).json({ message: "Usuário não autenticado" });
    return false;
  }
  const membership = await bookRepository.findMemberByUserAndClub(
    userId,
    clubId
  );
  if (!membership) {
    res.status(403).json({ message: "Acesso negado a este clube." });
    return false;
  }
  return true;
}

export async function respondIfNotClubOwner(
  userId: string | undefined,
  clubId: string,
  res: Response
): Promise<boolean> {
  if (!userId) {
    res.status(401).json({ message: "Usuário não autenticado" });
    return false;
  }
  const ownerId = await clubRepository.findClubOwnerId(clubId);
  if (!ownerId) {
    res.status(404).json({ message: "Clube não encontrado." });
    return false;
  }
  if (ownerId !== userId) {
    res.status(403).json({
      message: "Apenas o administrador do clube pode realizar esta ação.",
    });
    return false;
  }
  return true;
}
