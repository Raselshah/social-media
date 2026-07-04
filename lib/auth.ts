import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";
const ACCESS_TOKEN_TTL = "15m";

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(user: AuthUser) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

export function signRefreshToken(): string {
  return randomBytes(32).toString("hex");
}

export function createAccessToken(user: AuthUser) {
  return signAccessToken(user);
}

export function createRefreshToken(): string {
  return signRefreshToken();
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { sub: string; email: string };
}

export async function createRefreshTokenRecord() {
  const value = createRefreshToken();
  const hash = createHash("sha256").update(value).digest("hex");

  const userId = ""; // This will be passed from caller context

  await prisma.refreshToken.create({
    data: {
      tokenHash: hash,
      userId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });

  return value;
}

export async function revokeRefreshToken(tokenValue: string) {
  const hash = createHash("sha256").update(tokenValue).digest("hex");
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hash },
    data: { revoked: true },
  });
}

export function parseCookies(cookieHeader: string | null) {
  return new Map(
    (cookieHeader || "")
      .split(";")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [key, ...valueParts] = entry.split("=");
        return [key, valueParts.join("=")];
      }),
  );
}

export function getAccessTokenFromRequest(request: Request | NextResponse) {
  const cookieHeader = request.headers.get("cookie");
  const cookies = parseCookies(cookieHeader);
  return cookies.get("accessToken") || null;
}

export async function getCurrentUserFromRequest(
  request: Request | NextResponse,
) {
  const token = getAccessTokenFromRequest(request);

  if (!token) {
    return null;
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
) {
  response.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 15,
    path: "/",
  });

  response.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set("accessToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  response.cookies.set("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}
