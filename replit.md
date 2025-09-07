# Object Explorer System

## Overview

This is a full-stack React application for managing objects, their relationships, and hierarchies with AI-powered search capabilities. The system provides a comprehensive interface for creating, editing, and organizing objects in a hierarchical tree structure, with integrated AI functionality for intelligent search and discovery.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built as a React 18+ SPA using modern patterns:

- **Component Structure**: Modular component-based architecture with shadcn/ui components for consistent UI design
- **State Management**: React Context API for global state management of objects, relationships, and UI state
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack React Query for server state management and caching
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **UI Library**: Radix UI primitives with shadcn/ui component system for accessible, customizable components

### Backend Architecture

Express.js-based REST API server with the following structure:

- **Framework**: Express.js with TypeScript for type-safe API development
- **Development Setup**: Vite integration for development with HMR and fast refresh
- **Storage Layer**: Abstract storage interface with in-memory implementation (easily extensible to database)
- **API Design**: RESTful endpoints for CRUD operations on objects, relations, and hierarchies

### Data Storage Solutions

**Database Configuration**:
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Schema Management**: Shared schema definitions between client and server using Zod validation
- **Migration System**: Drizzle-kit for database migrations and schema management

**Data Models**:
- **Objects**: Core entities with name, description, type, attributes, and tables
- **Relations**: Many-to-many relationships between objects with typed relation types
- **Hierarchies**: Parent-child relationships for organizing objects in tree structures
- **Chat Sessions**: Persistent AI conversation history with message arrays
- **Users**: Authentication entities with username/password (foundation for future auth)

### Authentication and Authorization

Currently implements foundational user schema without active authentication:
- User table with username/password fields prepared for future implementation
- Session management infrastructure ready for integration
- API endpoints prepared for protected routes

### External Service Integrations

**AI Integration**:
- **OpenAI API**: GPT-5 model integration for intelligent search and chat functionality
- **Search Enhancement**: AI-powered object discovery and relationship analysis
- **Chat Interface**: Interactive AI assistant for object exploration and insights

**Development Tools**:
- **Replit Integration**: Development environment integration with runtime error handling
- **Cartographer Plugin**: Development-time code mapping and navigation assistance

### Key Architectural Decisions

**Monorepo Structure**: Single repository with client, server, and shared code for simplified development and deployment

**Type Safety**: Full TypeScript implementation with shared types between frontend and backend, ensuring consistency and reducing runtime errors

**Component Library Approach**: shadcn/ui component system provides consistent design language while maintaining customization flexibility

**Flexible Storage Pattern**: Abstract storage interface allows easy migration from in-memory to database persistence without changing business logic

**AI-First Design**: OpenAI integration built into core search and discovery workflows, enabling intelligent object exploration

**Responsive Design**: Mobile-first approach with collapsible sidebar and adaptive layouts for all screen sizes