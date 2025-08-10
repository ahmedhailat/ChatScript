# Overview

MedVision AI is a surgical visualization platform that uses artificial intelligence to predict and visualize potential outcomes of medical procedures. The application allows medical professionals to upload patient images, select procedure types (rhinoplasty, dental restoration, facial contouring, scar removal), and generate AI-powered before/after visualizations. It's designed as a HIPAA-compliant, secure platform specifically for medical professionals to help patients visualize potential surgical outcomes.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built as a single-page application using React with TypeScript. The component structure follows a modular design with reusable UI components:

- **Main Application**: React Router (Wouter) with route-based navigation
- **UI Framework**: shadcn/ui components with Radix UI primitives providing accessible, customizable components
- **Styling**: Tailwind CSS with custom medical-themed color scheme and responsive design
- **State Management**: React Query (@tanstack/react-query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

## Backend Architecture
The backend follows a REST API pattern built on Express.js:

- **Server Framework**: Express.js with TypeScript for type safety
- **File Upload**: Multer middleware for handling image uploads with size limits and type validation
- **Storage Layer**: Abstracted storage interface (IStorage) with in-memory implementation for development
- **Development Setup**: Vite integration for hot reloading during development

## Data Storage Solutions
The application uses a dual approach for data persistence:

- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Well-defined database schemas for users, patients, and consultations with proper relationships
- **File Storage**: Local file system for image storage during development (configurable for cloud storage)
- **Session Management**: PostgreSQL session store for user authentication

## Authentication and Authorization
Currently implements a basic structure for user management:

- **User Schema**: Defined in the database schema with username/password fields
- **Session Handling**: Express session middleware with PostgreSQL backing store
- **Security**: Prepared for HIPAA compliance with secure session management

## Core Features
The application provides several key medical visualization features:

- **Image Capture**: Camera integration and file upload capabilities with validation
- **Procedure Selection**: Radio group interface for selecting procedure types (rhinoplasty, dental, facial contouring, scar removal)
- **AI Processing**: Mock AI visualization system that processes before images to generate predicted outcomes
- **Consultation Management**: Form-based patient data collection and consultation note management
- **Gallery**: Sample transformations showcase for reference

## Design Patterns
The codebase follows several architectural patterns:

- **Component Composition**: Modular React components with clear separation of concerns
- **Repository Pattern**: Storage abstraction layer allowing for easy swapping of data persistence implementations
- **Factory Pattern**: Query client setup with configurable request handling
- **Observer Pattern**: React Query for reactive data fetching and caching

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL database via @neondatabase/serverless
- **Drizzle**: Type-safe ORM with PostgreSQL dialect for database operations

## UI and Styling
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom medical theme configuration
- **Lucide Icons**: Icon library for consistent medical and UI iconography

## Development Tools
- **Vite**: Fast build tool and development server with React plugin
- **TypeScript**: Type safety across the entire application stack
- **ESBuild**: Fast bundling for production builds

## File Handling
- **Multer**: Middleware for handling multipart/form-data for image uploads
- **File Type Validation**: Built-in validation for image formats (JPEG, PNG, GIF)

## State Management
- **React Query**: Server state management with caching, background updates, and error handling
- **React Hook Form**: Performance-focused form library with minimal re-renders
- **Zod**: Runtime type validation for forms and API responses

## Deployment Platform
- **Replit**: Development and hosting platform with integrated development tools and runtime error handling