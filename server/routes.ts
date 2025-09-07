import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertObjectSchema, insertRelationSchema, insertHierarchySchema, insertChatSessionSchema } from "@shared/schema";
import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "demo-key"
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Objects endpoints
  app.get("/api/objects", async (req, res) => {
    try {
      const objects = await storage.getObjects();
      res.json(objects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch objects" });
    }
  });

  app.get("/api/objects/:id", async (req, res) => {
    try {
      const object = await storage.getObject(req.params.id);
      if (!object) {
        return res.status(404).json({ message: "Object not found" });
      }
      res.json(object);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch object" });
    }
  });

  app.post("/api/objects", async (req, res) => {
    try {
      const validatedData = insertObjectSchema.parse(req.body);
      const object = await storage.createObject(validatedData);
      res.status(201).json(object);
    } catch (error) {
      res.status(400).json({ message: "Invalid object data", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.put("/api/objects/:id", async (req, res) => {
    try {
      const validatedData = insertObjectSchema.partial().parse(req.body);
      const object = await storage.updateObject(req.params.id, validatedData);
      if (!object) {
        return res.status(404).json({ message: "Object not found" });
      }
      res.json(object);
    } catch (error) {
      res.status(400).json({ message: "Invalid object data", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.delete("/api/objects/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteObject(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Object not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete object" });
    }
  });

  // Relations endpoints
  app.get("/api/objects/:id/relations", async (req, res) => {
    try {
      const relations = await storage.getObjectRelations(req.params.id);
      res.json(relations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch relations" });
    }
  });

  app.post("/api/relations", async (req, res) => {
    try {
      const validatedData = insertRelationSchema.parse(req.body);
      const relation = await storage.createRelation(validatedData);
      res.status(201).json(relation);
    } catch (error) {
      res.status(400).json({ message: "Invalid relation data", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.delete("/api/relations/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteRelation(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Relation not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete relation" });
    }
  });

  // Hierarchy endpoints
  app.get("/api/objects/:id/hierarchy", async (req, res) => {
    try {
      const hierarchies = await storage.getObjectHierarchy(req.params.id);
      res.json(hierarchies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hierarchy" });
    }
  });

  app.post("/api/hierarchies", async (req, res) => {
    try {
      const validatedData = insertHierarchySchema.parse(req.body);
      const hierarchy = await storage.createHierarchy(validatedData);
      res.status(201).json(hierarchy);
    } catch (error) {
      res.status(400).json({ message: "Invalid hierarchy data", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // AI Search endpoint
  app.post("/api/search", async (req, res) => {
    try {
      const { query } = req.body;
      
      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }

      // Get all objects for search
      const allObjects = await storage.getObjects();
      
      // Use AI to analyze the query and find relevant objects
      const prompt = `
        Analyze this search query: "${query}"
        
        Available objects:
        ${JSON.stringify(allObjects, null, 2)}
        
        Find the most relevant objects based on the query. Consider object names, descriptions, attributes, and content.
        Return your response as JSON in this format:
        {
          "results": [
            {
              "object_id": "string",
              "relevance": number_between_0_and_1,
              "reasoning": "string_explanation"
            }
          ],
          "query_analysis": "string_explanation_of_what_user_is_looking_for"
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are an intelligent search assistant that helps find relevant objects based on user queries. Respond with JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const aiResponse = JSON.parse(response.choices[0].message.content || '{}');
      
      // Map AI results to full objects
      const searchResults = aiResponse.results.map((result: any) => {
        const object = allObjects.find(obj => obj.id === result.object_id);
        return object ? {
          object,
          relevance: result.relevance,
          reasoning: result.reasoning
        } : null;
      }).filter(Boolean);

      res.json({
        results: searchResults,
        query,
        reasoning: aiResponse.query_analysis
      });

    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Search failed", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Get or create chat session
      let session = sessionId ? await storage.getChatSession(sessionId) : null;
      if (!session) {
        session = await storage.createChatSession({ messages: [] });
      }

      // Get context from objects
      const allObjects = await storage.getObjects();
      
      const contextPrompt = `
        You are an AI assistant for an Object Design System. Help users with questions about objects, their relationships, and hierarchies.
        
        Available objects:
        ${JSON.stringify(allObjects, null, 2)}
        
        Previous conversation:
        ${JSON.stringify(session.messages, null, 2)}
        
        Current user message: "${message}"
        
        Provide a helpful response about the objects or system. If the user is asking about specific objects, reference them by name and provide details.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant for an Object Design System. Provide clear, informative responses about objects, their properties, relationships, and hierarchies."
          },
          {
            role: "user",
            content: contextPrompt
          }
        ]
      });

      const assistantMessage = response.choices[0].message.content;
      
      // Update session with new messages
      const updatedMessages = [
        ...(Array.isArray(session.messages) ? session.messages : []),
        {
          id: Date.now().toString() + "-user",
          role: "user" as const,
          content: message,
          timestamp: new Date()
        },
        {
          id: Date.now().toString() + "-assistant",
          role: "assistant" as const,
          content: assistantMessage,
          timestamp: new Date()
        }
      ];

      await storage.updateChatSession(session.id, { messages: updatedMessages });

      res.json({
        message: assistantMessage,
        sessionId: session.id
      });

    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Chat failed", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Reports endpoint
  app.get("/api/reports/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const objects = await storage.getObjects();
      const relations = await storage.getRelations();
      const hierarchies = await storage.getHierarchies();

      let reportData = {};

      switch (type) {
        case "objects":
          reportData = { objects, timestamp: new Date() };
          break;
        case "relations":
          reportData = { relations, objects, timestamp: new Date() };
          break;
        case "hierarchies":
          reportData = { hierarchies, objects, timestamp: new Date() };
          break;
        case "full":
          reportData = { objects, relations, hierarchies, timestamp: new Date() };
          break;
        default:
          return res.status(400).json({ message: "Invalid report type" });
      }

      res.json(reportData);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
