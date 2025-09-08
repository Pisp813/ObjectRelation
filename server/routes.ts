import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertObjectSchema, insertRelationSchema, insertHierarchySchema, insertChatSessionSchema } from "@shared/schema";
import OpenAI from "openai";
import PDFDocument from "pdfkit";

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
  app.get("/api/relations", async (req, res) => {
    try {
      const relations = await storage.getRelations();
      res.json(relations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch relations" });
    }
  });

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
  app.get("/api/hierarchies", async (req, res) => {
    try {
      const hierarchies = await storage.getHierarchies();
      res.json(hierarchies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hierarchies" });
    }
  });

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

  // Reports endpoint - Generate PDF reports
  app.get("/api/reports/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const objects = await storage.getObjects();
      const relations = await storage.getRelations();
      const hierarchies = await storage.getHierarchies();

      // Validate report type
      const validTypes = ["objects", "relations", "hierarchies", "full"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ message: "Invalid report type" });
      }

      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Object Design System - ${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
          Author: 'Object Design System',
          Subject: 'System Report',
          CreationDate: new Date()
        }
      });

      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="object-design-${type}-report-${new Date().toISOString().split('T')[0]}.pdf"`);

      // Pipe PDF to response
      doc.pipe(res);

      // Add title and header
      doc.fontSize(24).font('Helvetica-Bold').text(
        `Object Design System - ${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
        { align: 'center' }
      );
      
      doc.moveDown();
      doc.fontSize(12).font('Helvetica').text(
        `Generated on: ${new Date().toLocaleString()}`,
        { align: 'center' }
      );
      doc.moveDown(2);

      // Add content based on report type
      switch (type) {
        case "objects":
          generateObjectsReport(doc, objects);
          break;
        case "relations":
          generateRelationsReport(doc, relations, objects);
          break;
        case "hierarchies":
          generateHierarchiesReport(doc, hierarchies, objects);
          break;
        case "full":
          generateFullReport(doc, objects, relations, hierarchies);
          break;
      }

      // Add footer
      doc.moveDown(2);
      doc.fontSize(10).font('Helvetica').text(
        'Generated by Object Design System',
        { align: 'center' }
      );

      // Finalize PDF
      doc.end();

    } catch (error) {
      console.error("Report generation error:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions for generating different report sections
function generateObjectsReport(doc: any, objects: any[]) {
  doc.fontSize(18).font('Helvetica-Bold').text('Objects Overview');
  doc.moveDown();
  
  if (objects.length === 0) {
    doc.fontSize(12).font('Helvetica').text('No objects found.');
    return;
  }

  objects.forEach((object, index) => {
    doc.fontSize(14).font('Helvetica-Bold').text(`${index + 1}. ${object.name}`);
    doc.fontSize(12).font('Helvetica').text(`Type: ${object.type}`);
    if (object.description) {
      doc.text(`Description: ${object.description}`);
    }
    if (object.attributes && Object.keys(object.attributes).length > 0) {
      doc.text(`Attributes: ${JSON.stringify(object.attributes, null, 2)}`);
    }
    doc.moveDown();
  });
}

function generateRelationsReport(doc: any, relations: any[], objects: any[]) {
  doc.fontSize(18).font('Helvetica-Bold').text('Relations Overview');
  doc.moveDown();
  
  if (relations.length === 0) {
    doc.fontSize(12).font('Helvetica').text('No relations found.');
    return;
  }

  relations.forEach((relation, index) => {
    const primaryObject = objects.find(obj => obj.id === relation.primary_object_id);
    doc.fontSize(14).font('Helvetica-Bold').text(`${index + 1}. ${primaryObject?.name || 'Unknown'} → ${relation.relation_type.replace('_', ' ')}`);
    
    if (relation.secondary_object_ids && relation.secondary_object_ids.length > 0) {
      doc.fontSize(12).font('Helvetica').text('Related Objects:');
      relation.secondary_object_ids.forEach((objId: string) => {
        const relatedObject = objects.find(obj => obj.id === objId);
        doc.text(`  • ${relatedObject?.name || 'Unknown'} (${relatedObject?.type || 'Unknown'})`);
      });
    }
    
    if (relation.description) {
      doc.text(`Description: ${relation.description}`);
    }
    doc.moveDown();
  });
}

function generateHierarchiesReport(doc: any, hierarchies: any[], objects: any[]) {
  doc.fontSize(18).font('Helvetica-Bold').text('Hierarchies Overview');
  doc.moveDown();
  
  if (hierarchies.length === 0) {
    doc.fontSize(12).font('Helvetica').text('No hierarchies found.');
    return;
  }

  // Group hierarchies by parent
  const parentGroups = hierarchies.reduce((acc, hierarchy) => {
    const parentId = hierarchy.parent_object_id;
    if (!acc[parentId]) acc[parentId] = [];
    acc[parentId].push(hierarchy);
    return acc;
  }, {} as Record<string, any[]>);

  (Object.entries(parentGroups) as [string, any[]][]).forEach(([parentId, hierarchyList]) => {
    const parentObject = objects.find(obj => obj.id === parentId);
    doc.fontSize(14).font('Helvetica-Bold').text(`Parent: ${parentObject?.name || 'Unknown'}`);
    
    hierarchyList.forEach((hierarchy: any, index: number) => {
      if (hierarchy.child_object_ids && hierarchy.child_object_ids.length > 0) {
        doc.fontSize(12).font('Helvetica').text(`Level ${hierarchy.level || 1} Children:`);
        hierarchy.child_object_ids.forEach((childId: string) => {
          const childObject = objects.find(obj => obj.id === childId);
          doc.text(`  • ${childObject?.name || 'Unknown'} (${childObject?.type || 'Unknown'})`);
        });
      }
    });
    doc.moveDown();
  });
}

function generateFullReport(doc: any, objects: any[], relations: any[], hierarchies: any[]) {
  generateObjectsReport(doc, objects);
  doc.addPage();
  generateRelationsReport(doc, relations, objects);
  doc.addPage();
  generateHierarchiesReport(doc, hierarchies, objects);
}
