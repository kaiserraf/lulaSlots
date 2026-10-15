import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { HttpError } from "../middlewares/errorHandler";
import { env } from "../config/env";
import { userRepository } from "../repositories/userRepository";

function toPublic(user: { id: string; username: string; balance: bigint; lastDailyRewardAt: Date | null; createdAt: Date }) {
  return {
    id: user.id,
    username: user.username,
    balance: Number(user.balance),
    lastDailyRewardAt: user.lastDailyRewardAt,
    createdAt: user.createdAt,
  };
}

export const authService = {
  async register(username: string, password: string) {
    const existing = await userRepository.findByUsername(username);
    if (existing) throw new HttpError(409, "Nome de usuário já utilizado.");
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userRepository.create(username, passwordHash);
    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: "7d" });
    return { token, user: toPublic(user) };
  },

  async login(username: string, password: string) {
    const user = await userRepository.findByUsername(username);
    if (!user) throw new HttpError(401, "Credenciais inválidas.");
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new HttpError(401, "Credenciais inválidas.");
    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: "7d" });
    return { token, user: toPublic(user) };
  },

  async me(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new HttpError(404, "Usuário não encontrado.");
    return toPublic(user);
  },
};