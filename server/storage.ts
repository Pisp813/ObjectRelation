import { 
  type User, 
  type InsertUser, 
  type ObjectType, 
  type InsertObject,
  type Relation,
  type InsertRelation,
  type Hierarchy,
  type InsertHierarchy,
  type ChatSession,
  type InsertChatSession
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Object methods
  getObjects(): Promise<ObjectType[]>;
  getObject(id: string): Promise<ObjectType | undefined>;
  createObject(object: InsertObject): Promise<ObjectType>;
  updateObject(id: string, object: Partial<InsertObject>): Promise<ObjectType | undefined>;
  deleteObject(id: string): Promise<boolean>;

  // Relation methods
  getRelations(): Promise<Relation[]>;
  getObjectRelations(objectId: string): Promise<Relation[]>;
  createRelation(relation: InsertRelation): Promise<Relation>;
  updateRelation(id: string, relation: Partial<InsertRelation>): Promise<Relation | undefined>;
  deleteRelation(id: string): Promise<boolean>;

  // Hierarchy methods
  getHierarchies(): Promise<Hierarchy[]>;
  getObjectHierarchy(objectId: string): Promise<Hierarchy[]>;
  createHierarchy(hierarchy: InsertHierarchy): Promise<Hierarchy>;
  updateHierarchy(id: string, hierarchy: Partial<InsertHierarchy>): Promise<Hierarchy | undefined>;
  deleteHierarchy(id: string): Promise<boolean>;

  // Chat methods
  getChatSession(id: string): Promise<ChatSession | undefined>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  updateChatSession(id: string, session: Partial<InsertChatSession>): Promise<ChatSession | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private objects: Map<string, ObjectType>;
  private relations: Map<string, Relation>;
  private hierarchies: Map<string, Hierarchy>;
  private chatSessions: Map<string, ChatSession>;

  constructor() {
    this.users = new Map();
    this.objects = new Map();
    this.relations = new Map();
    this.hierarchies = new Map();
    this.chatSessions = new Map();

    // Initialize with some sample objects for the tree structure
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    const sampleObjects: ObjectType[] = [
      {
        id: "obj1",
        name: "User Management System",
        description: "Comprehensive user management and authentication system with role-based access control and audit logging capabilities.",
        type: "Item",
        attributes: { status: "Active", version: "2.1.0" },
        tables: [
          {
            name: "User Permissions",
            columns: [
              { name: "User ID", type: "string" },
              { name: "Username", type: "string" },
              { name: "Role", type: "string" },
              { name: "Permissions", type: "string" },
              { name: "Last Login", type: "string" }
            ],
            data: [
              ["USR001", "admin@company.com", "Administrator", "Full Access", "2024-01-15 09:30"],
              ["USR002", "manager@company.com", "Manager", "Read/Write", "2024-01-14 16:45"],
              ["USR003", "user@company.com", "User", "Read Only", "2024-01-13 11:20"]
            ]
          }
        ],
        created_date: new Date("2023-10-15T14:30:00Z"),
        modified_date: new Date("2024-01-15T09:45:00Z"),
        revision: 15
      },
      {
        id: "obj2",
        name: "Product Catalog",
        description: "Complete product information system with pricing and inventory tracking.",
        type: "Document",
        attributes: { status: "Active", itemCount: "1,247" },
        tables: [],
        created_date: new Date("2023-11-01T10:00:00Z"),
        modified_date: new Date("2024-01-12T14:20:00Z"),
        revision: 8
      },
      {
        id: "obj3",
        name: "Configuration",
        description: "System configuration and settings management.",
        type: "Item",
        attributes: { status: "Active", configCount: "87" },
        tables: [],
        created_date: new Date("2023-09-20T16:15:00Z"),
        modified_date: new Date("2024-01-10T11:30:00Z"),
        revision: 23
      },
      {
        id: "obj4",
        name: "API Documentation",
        description: "Complete API reference and integration guides.",
        type: "Document",
        attributes: { status: "Draft", pageCount: "156" },
        tables: [],
        created_date: new Date("2023-12-01T09:00:00Z"),
        modified_date: new Date("2024-01-08T13:45:00Z"),
        revision: 5
      }
    ];

    sampleObjects.forEach(obj => this.objects.set(obj.id, obj));

    // Sample relations
    const sampleRelations: Relation[] = [
      {
        id: "rel1",
        primary_object_id: "obj1",
        secondary_object_ids: ["obj2"],
        relation_type: "Item-to-Document",
        description: "User management connects to product catalog for user-specific product access"
      },
      {
        id: "rel2",
        primary_object_id: "obj1",
        secondary_object_ids: ["obj3"],
        relation_type: "Item-to-Item",
        description: "User management uses system configuration for authentication settings"
      }
    ];

    sampleRelations.forEach(rel => this.relations.set(rel.id, rel));

    // Sample hierarchies
    const sampleHierarchies: Hierarchy[] = [
      {
        id: "hier1",
        parent_object_id: "obj1",
        child_object_ids: ["auth-module", "perm-manager"],
        level: 0,
        properties: { type: "Root", priority: 1 }
      }
    ];

    sampleHierarchies.forEach(hier => this.hierarchies.set(hier.id, hier));
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Object methods
  async getObjects(): Promise<ObjectType[]> {
    return Array.from(this.objects.values());
  }

  async getObject(id: string): Promise<ObjectType | undefined> {
    return this.objects.get(id);
  }

  async createObject(insertObject: InsertObject): Promise<ObjectType> {
    const id = randomUUID();
    const object: ObjectType = {
      ...insertObject,
      id,
      attributes: insertObject.attributes || {},
      tables: insertObject.tables || [],
      created_date: new Date(),
      modified_date: new Date(),
      revision: 1
    };
    this.objects.set(id, object);
    return object;
  }

  async updateObject(id: string, updateData: Partial<InsertObject>): Promise<ObjectType | undefined> {
    const existing = this.objects.get(id);
    if (!existing) return undefined;

    const updated: ObjectType = {
      ...existing,
      ...updateData,
      modified_date: new Date(),
      revision: (existing.revision || 0) + 1
    };
    this.objects.set(id, updated);
    return updated;
  }

  async deleteObject(id: string): Promise<boolean> {
    return this.objects.delete(id);
  }

  // Relation methods
  async getRelations(): Promise<Relation[]> {
    return Array.from(this.relations.values());
  }

  async getObjectRelations(objectId: string): Promise<Relation[]> {
    return Array.from(this.relations.values()).filter(
      rel => rel.primary_object_id === objectId || 
             (Array.isArray(rel.secondary_object_ids) && rel.secondary_object_ids.includes(objectId))
    );
  }

  async createRelation(insertRelation: InsertRelation): Promise<Relation> {
    const id = randomUUID();
    const relation: Relation = { 
      ...insertRelation, 
      id,
      description: insertRelation.description || null,
      secondary_object_ids: insertRelation.secondary_object_ids || []
    };
    this.relations.set(id, relation);
    return relation;
  }

  async updateRelation(id: string, updateData: Partial<InsertRelation>): Promise<Relation | undefined> {
    const existing = this.relations.get(id);
    if (!existing) return undefined;

    const updated: Relation = { ...existing, ...updateData };
    this.relations.set(id, updated);
    return updated;
  }

  async deleteRelation(id: string): Promise<boolean> {
    return this.relations.delete(id);
  }

  // Hierarchy methods
  async getHierarchies(): Promise<Hierarchy[]> {
    return Array.from(this.hierarchies.values());
  }

  async getObjectHierarchy(objectId: string): Promise<Hierarchy[]> {
    return Array.from(this.hierarchies.values()).filter(
      hier => hier.parent_object_id === objectId || 
              (Array.isArray(hier.child_object_ids) && hier.child_object_ids.includes(objectId))
    );
  }

  async createHierarchy(insertHierarchy: InsertHierarchy): Promise<Hierarchy> {
    const id = randomUUID();
    const hierarchy: Hierarchy = { 
      ...insertHierarchy, 
      id,
      parent_object_id: insertHierarchy.parent_object_id || null,
      child_object_ids: insertHierarchy.child_object_ids || [],
      level: insertHierarchy.level || 0,
      properties: insertHierarchy.properties || {}
    };
    this.hierarchies.set(id, hierarchy);
    return hierarchy;
  }

  async updateHierarchy(id: string, updateData: Partial<InsertHierarchy>): Promise<Hierarchy | undefined> {
    const existing = this.hierarchies.get(id);
    if (!existing) return undefined;

    const updated: Hierarchy = { ...existing, ...updateData };
    this.hierarchies.set(id, updated);
    return updated;
  }

  async deleteHierarchy(id: string): Promise<boolean> {
    return this.hierarchies.delete(id);
  }

  // Chat methods
  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = randomUUID();
    const session: ChatSession = {
      ...insertSession,
      id,
      messages: insertSession.messages || [],
      created_date: new Date()
    };
    this.chatSessions.set(id, session);
    return session;
  }

  async updateChatSession(id: string, updateData: Partial<InsertChatSession>): Promise<ChatSession | undefined> {
    const existing = this.chatSessions.get(id);
    if (!existing) return undefined;

    const updated: ChatSession = { ...existing, ...updateData };
    this.chatSessions.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
