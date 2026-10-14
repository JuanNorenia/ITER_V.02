import {
  mysqlTable,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/mysql-core";

/**
 * Leads captados por el formulario de contacto.
 * La base de datos es la confirmación real de recepción; el reenvío
 * a un proveedor de correo (webhook/Resend) es opcional y adicional.
 */
export const leads = mysqlTable("leads", {
  id: serial("id").primaryKey(),
  nombre: varchar("nombre", { length: 80 }).notNull(),
  email: varchar("email", { length: 120 }).notNull(),
  empresa: varchar("empresa", { length: 120 }),
  mensaje: text("mensaje").notNull(),
  tipoNecesidad: varchar("tipo_necesidad", { length: 40 }),
  presupuesto: varchar("presupuesto", { length: 40 }),
  forwarded: boolean("forwarded").notNull().default(false),
  userAgent: varchar("user_agent", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
