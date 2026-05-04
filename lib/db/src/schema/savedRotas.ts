import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const savedRotas = pgTable("saved_rotas", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  status: text("status").notNull().default("draft"),
  rota: jsonb("rota").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});