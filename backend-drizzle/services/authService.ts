import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserStatus } from "../enums/userStatus";
import { createId } from "../utils/id";
import * as userRepository from "../repositories/userRepository";

export class DuplicateEmailError extends Error {
  constructor() {
    super("E-mail já cadastrado");
    this.name = "DuplicateEmailError";
  }
}

export class JwtSecretMissingError extends Error {
  constructor() {
    super("JWT_SECRET não definido");
    this.name = "JwtSecretMissingError";
  }
}

export class UserNotFoundOrInactiveError extends Error {
  constructor() {
    super("Usuário não encontrado ou inativo");
    this.name = "UserNotFoundOrInactiveError";
  }
}

export class InvalidPasswordError extends Error {
  constructor() {
    super("Senha inválida");
    this.name = "InvalidPasswordError";
  }
}

function signToken(userId: string, email: string) {
  if (!process.env.JWT_SECRET) {
    throw new JwtSecretMissingError();
  }
  return jwt.sign({ id: userId, email }, process.env.JWT_SECRET);
}

export async function register(input: {
  name: string;
  lastName: string;
  email: string;
  nickname: string;
  password: string;
}) {
  const hashedPassword = await bcrypt.hash(input.password, 10);
  const fullName = `${input.name} ${input.lastName}`;

  try {
    const newUser = await userRepository.insertUser({
      id: createId(),
      name: fullName,
      email: input.email,
      nickname: input.nickname,
      password: hashedPassword,
      status: UserStatus.ACTIVE,
    });

    if (!newUser) {
      throw new Error("insert_user_failed");
    }

    const token = signToken(newUser.id, newUser.email);
    const { password: _, ...userParaFront } = newUser;
    return { token, user: userParaFront };
  } catch (error: any) {
    if (error?.code === "23505") {
      throw new DuplicateEmailError();
    }
    throw error;
  }
}

export async function login(email: string, password: string) {
  const foundUser = await userRepository.findUserByEmail(email);

  if (!foundUser || foundUser.status !== UserStatus.ACTIVE) {
    throw new UserNotFoundOrInactiveError();
  }

  const isMatch = await bcrypt.compare(password, foundUser.password);
  if (!isMatch) {
    throw new InvalidPasswordError();
  }

  const token = signToken(foundUser.id, foundUser.email);
  const { password: _, ...userParaFront } = foundUser;
  return { token, user: userParaFront };
}
