import "server-only";

import { eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { db } from "@/db";
import { users } from "@/db/schema";

export const SESSION_COOKIE = "sa_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  role: "admin" | "author";
};

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET is missing or too short. Set a value of at least 32 characters in .env.local",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
    });
    if (typeof payload.id !== "number" || typeof payload.email !== "string") {
      return null;
    }
    return {
      id: payload.id,
      email: payload.email,
      name: String(payload.name ?? ""),
      role: payload.role === "admin" ? "admin" : "author",
    };
  } catch {
    return null;
  }
}

export async function startSession(user: SessionUser) {
  const token = await createSessionToken(user);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** Throws when there is no signed-in user — use inside admin server code. */
export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  const row = await db.query.users.findFirst({
    where: eq(users.id, session.id),
  });
  return row ?? null;
}
