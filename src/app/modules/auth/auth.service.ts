import * as bcrypt from "bcrypt";
import config from "../../../config";
import { Secret } from "jsonwebtoken";
import httpStatus from "http-status";
import prisma from "../../../lib/prisma";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import ApiError from "../../errors/ApiError";


interface LoginPayload {
  email: string;
  password: string;
}

interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

interface ResetPasswordPayload {
  id: string;
  password: string;
}

const loginUser = async (payload: LoginPayload) => {
  const userData = await prisma.user.findFirstOrThrow({
    where: {
      email: payload.email,
      isActive: true, // Added isActive check
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new Error("Password Incorrect!");
  }

  const accessToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string
  );

  // Update last login
  await prisma.user.update({
    where: { id: userData.id },
    data: { lastLogin: new Date() }
  });

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string) => {
  let decodedData;
  try {
    // FIXED: Use verifyToken instead of generateToken
    decodedData = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_token_secret as Secret
    );
  } catch (err: any) {
    throw new Error("You are not Authorized");
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      isActive: true,
    },
  });

  const accessToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string // FIXED: Added expires_in
  );
  
  return {
    accessToken,
  };
};

const changePassword = async (user: any, payload: ChangePasswordPayload) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      isActive: true,
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.oldPassword,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new Error("Password Incorrect!");
  }
  
  const hashPassword: string = await bcrypt.hash(payload.newPassword, 12);

  await prisma.user.update({
    where: {
      email: userData.email,
    },
    data: {
      password: hashPassword,
    },
  });
  
  return {
    message: "Password changed successfully!",
  };
};

const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      isActive: true,
    },
  });

  const resetToken = jwtHelpers.generateToken(
    {
      id: userData.id,
      email: userData.email,
    },
    config.jwt.reset_pass_secret as Secret,
    config.jwt.refresh_token_expires_in as string
  );

  return {
    message: "Reset token generated successfully",
    resetToken,
    userId: userData.id
  };
};

const resetPassword = async (
  token: string,
  payload: ResetPasswordPayload
) => {
  let decodedData;
  try {
    // FIXED: Use verifyToken instead of generateToken
    decodedData = jwtHelpers.verifyToken(
      token,
      config.jwt.reset_pass_secret as Secret
    );
  } catch (err: any) {
    throw new ApiError(httpStatus.FORBIDDEN, "Invalid or expired reset token");
  }

  // Verify the token belongs to the correct user
  if (decodedData.id !== payload.id) {
    throw new ApiError(httpStatus.FORBIDDEN, "Invalid reset token");
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id: payload.id,
      isActive: true,
    },
  });

  // Hash password
  const password = await bcrypt.hash(payload.password, 12);

  // Update in database
  await prisma.user.update({
    where: {
      id: payload.id,
    },
    data: {
      password,
    },
  });

  return {
    message: "Password reset successfully!",
  };
};

export const AuthServices = {
  loginUser,
  refreshToken,
  changePassword,
  resetPassword,
  forgotPassword, // Added forgotPassword to exports
};