# Overview

MedVision AI is a comprehensive surgical visualization platform that combines OpenAI-powered artificial intelligence with local image processing to predict and visualize potential outcomes of medical procedures. The application allows medical professionals to upload patient images, select precise face areas (nose, lips, teeth, chin), and generate realistic before/after visualizations with granular control over surgical adjustments. Features include real AI processing, precise area selection tools, live makeup application, and fallback local processing when API quotas are exceeded. It's designed as a HIPAA-compliant, secure platform specifically for medical professionals to help patients visualize potential surgical outcomes with life-like precision.

**LATEST UPDATE**: Complete Arabic RTL interface implementation with full authentication system including user registration, login, subscription management, payment processing, and interactive Arabic tutorial video system.

# User Preferences

Preferred communication style: Simple, everyday language.
Language: Complete Arabic interface - user requires 100% Arabic RTL interface without any English text mixing.
Authentication: User requested full authentication system with login, registration, subscription management, and payment processing.
Video Tutorial: User requested comprehensive Arabic tutorial video system with interactive step-by-step guide.

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
The application provides comprehensive medical visualization capabilities:

- **Image Capture**: Camera integration and file upload capabilities with validation
- **Procedure Selection**: Radio group interface for selecting procedure types (rhinoplasty, dental, facial contouring, scar removal)
- **AI Processing**: Real OpenAI integration for authentic surgical previews with fallback to local Sharp-based image processing
- **Precise Area Selection**: Interactive face area selector allowing users to select specific regions (nose, lips, teeth, chin) with pixel-perfect control
- **Live Makeup Application**: Real-time makeup overlay tool with brush controls, color palette, and intensity adjustment
- **Surgical Adjustments**: Granular controls for nose width/length, teeth whitening/straightening, lip size, and chin shape with slider-based precision
- **Dual Processing Methods**: Automatic failover from AI to local processing ensuring 100% uptime regardless of API availability
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