"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";
import { endSession, startSession } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export type LoginState = { error?: string };

const schema = z.object({
  email: z.email(),
  password: z.string().min(1),
  next: z.string().optional(),
});

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const ip = clientIp(await headers());
  if (!rateLimit(`login:${ip}`, 8, 300_000).ok) {
    return { error: "Too many attempts. Wait five minutes and try again." };
  }

  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });

  if (!parsed.success) return { error: "Enter a valid email and password." };

  const user = await db.query.users.findFirst({
    where: eq(users.email, parsed.data.email.toLowerCase()),
  });

  // Same message either way so the form cannot be used to enumerate accounts.
  const invalid = { error: "Email or password is incorrect." };
  if (!user) {
    await bcrypt.compare(parsed.data.password, "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
    return invalid;
  }

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) return invalid;

  await startSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  const target = parsed.data.next;
  redirect(target?.startsWith("/admin") ? target : "/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}
