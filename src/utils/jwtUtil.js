import jwt from "jsonwebtoken";

export const SECRET = "mysecret";

export function createToken(payload) {
  return jwt.sign(payload, SECRET, {
    expiresIn: "10m",
  });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}