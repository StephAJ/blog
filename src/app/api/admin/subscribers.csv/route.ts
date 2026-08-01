import { NextResponse } from "next/server";

import { getSubscribers } from "@/db/queries";
import { getSession } from "@/lib/auth";

/** Wraps a value so it cannot break out of its CSV cell or be read as a formula. */
function csvCell(value: string) {
  const escaped = value.replace(/"/g, '""');
  const safe = /^[=+\-@]/.test(escaped) ? `'${escaped}` : escaped;
  return `"${safe}"`;
}

export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const list = await getSubscribers();
  const rows = [
    ["email", "source", "subscribed_at"],
    ...list.map((row) => [
      row.email,
      row.source,
      row.createdAt.toISOString(),
    ]),
  ];

  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="subscribers-${stamp}.csv"`,
    },
  });
}
