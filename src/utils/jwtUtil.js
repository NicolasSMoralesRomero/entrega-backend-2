import jwt from "jsonwebtoken";
import { CONFIG } from "../config/config.js";

export function createToken(payload) {
  return jwt.sign(payload, CONFIG.JWT_SECRET, {
    expiresIn: "10m",
  });
}

export function verifyToken(token) {
  return jwt.verify(token, CONFIG.JWT_SECRET);
}