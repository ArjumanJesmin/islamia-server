import jwt, { JwtPayload, Secret } from "jsonwebtoken";

const generateToken = (
  payload: object,
  secret: Secret,
  expiresIn: string
): string => {
  // Type assertion to bypass type checking
  return jwt.sign(payload, secret, { 
    algorithm: "HS256",
    expiresIn 
  } as any);
};

const verifyToken = (token: string, secret: Secret): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};

export const jwtHelpers = {
  generateToken,
  verifyToken,
};