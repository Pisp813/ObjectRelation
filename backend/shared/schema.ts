import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const objects = pgTable("objects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'Item' | 'Document'
  attributes: jsonb("attributes").default({}),
  tables: jsonb("tables").default([]),
  created_date: timestamp("created_date").defaultNow(),
  modified_date: timestamp("modified_date").defaultNow(),
  revision: integer("revision").default(1),
});

export const relations = pgTable("relations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  primary_object_id: varchar("primary_object_id").notNull(),
  secondary_object_ids: jsonb("secondary_object_ids").default([]),
  relation_type: text("relation_type").notNull(),
  description: text("description"),
});

export const hierarchies = pgTable("hierarchies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parent_object_id: varchar("parent_object_id"),
  child_object_ids: jsonb("child_object_ids").default([]),
  level: integer("level").default(0),
  properties: jsonb("properties").default({}),
});

export const chat_sessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messages: jsonb("messages").default([]),
  created_date: timestamp("created_date").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertObjectSchema = createInsertSchema(objects).omit({
  id: true,
  created_date: true,
  modified_date: true,
  revision: true,
});

export const insertRelationSchema = createInsertSchema(relations).omit({
  id: true,
});

export const insertHierarchySchema = createInsertSchema(hierarchies).omit({
  id: true,
});

export const insertChatSessionSchema = createInsertSchema(chat_sessions).omit({
  id: true,
  created_date: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertObject = z.infer<typeof insertObjectSchema>;
export type ObjectType = typeof objects.$inferSelect;

export type InsertRelation = z.infer<typeof insertRelationSchema>;
export type Relation = typeof relations.$inferSelect;

export type InsertHierarchy = z.infer<typeof insertHierarchySchema>;
export type Hierarchy = typeof hierarchies.$inferSelect;

export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatSession = typeof chat_sessions.$inferSelect;

// Additional types for API responses
export type SearchResult = {
  object: ObjectType;
  relevance: number;
  reasoning: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export type AISearchResponse = {
  results: SearchResult[];
  query: string;
  reasoning: string;
};
