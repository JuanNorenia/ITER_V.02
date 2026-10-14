import { eq } from "drizzle-orm";
import { getDb } from "./connection";
import { leads, type NewLead } from "@db/schema";

export async function insertLead(lead: NewLead): Promise<number> {
  const db = getDb();
  const result = await db.insert(leads).values(lead);
  const id = Number(result[0]?.insertId ?? 0);
  return id;
}

export async function markForwarded(id: number) {
  if (!id) return;
  const db = getDb();
  await db.update(leads).set({ forwarded: true }).where(eq(leads.id, id));
}
