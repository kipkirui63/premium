# CrispAI Marketplace

## Overview

This is a full-stack marketplace application for CrispAI, a company that sells AI-powered business tools and applications. The platform allows users to browse, purchase, and access various AI solutions including business intelligence, writing tools, and recruitment applications.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with custom styling
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context for authentication and subscription state
- **Data Fetching**: TanStack Query for server state management
- **Routing**: React Router for client-side navigation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Session Management**: In-memory storage with extensible interface
- **Development**: Hot module replacement with Vite integration

### Build System
- **Frontend Build**: Vite with React plugin
- **Backend Build**: esbuild for server bundling
- **Development**: Concurrent development with Vite middleware
- **TypeScript**: Strict mode with path mapping

## Key Components

### Authentication System
- JWT-based authentication with external API (api.crispai.ca)
- User registration with email verification
- Context-based user state management
- Protected routes and conditional rendering

### Subscription Management
- Real-time subscription status checking
- App purchase tracking and validation
- Expiration warnings and notifications
- Integration with Stripe for payment processing

### Marketplace Features
- App browsing with category filtering
- Shopping cart functionality
- Star ratings and reviews
- App preview and external linking
- Coming soon apps with disabled purchase

### UI Components
- Comprehensive design system with shadcn/ui
- Responsive layout with mobile-first approach
- Toast notifications for user feedback
- Modal dialogs for authentication
- Sidebar navigation for cart management

## Data Flow

### User Authentication Flow
1. User submits login/registration form
2. Frontend calls external API (api.crispai.ca)
3. JWT token stored in localStorage
4. User context updated across application
5. Protected routes become accessible

### Purchase Flow
1. User adds apps to shopping cart
2. Cart state managed locally
3. Checkout creates Stripe session via API
4. Payment processed externally
5. Subscription context refreshed
6. User gains access to purchased apps

### App Access Flow
1. User subscription status checked on load
2. Purchased apps identified by API response
3. Access controls applied to app features
4. External app URLs opened for verified users

## External Dependencies

### APIs
- **CrispAI API**: https://api.crispai.ca/api
  - User authentication and registration
  - Tool/subscription management
  - Stripe payment processing

### Third-party Services
- **Stripe**: Payment processing integration
- **Neon Database**: PostgreSQL hosting
- **Replit**: Development environment integration

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **React Hook Form**: Form validation
- **TanStack Query**: Data fetching and caching

## Deployment Strategy

### Development
- Local development with Vite dev server
- Hot module replacement for fast iteration
- TypeScript compilation checking
- Database migrations with Drizzle Kit

### Production Build
- Frontend assets built with Vite
- Backend bundled with esbuild
- Static assets served from dist/public
- Express server serves both API and static files

### Environment Configuration
- DATABASE_URL for PostgreSQL connection
- NODE_ENV for environment-specific behavior
- Replit-specific integrations and banners

## Changelog

- July 05, 2025. Initial setup
- July 16, 2025. Added monthly/yearly subscription plans, login-required cart functionality, token expiry handling, and email verification notifications

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (July 16, 2025)

### Authentication & Security Improvements
- **Login-required cart**: Users must log in before adding items to cart
- **Token expiry handling**: Automatic detection of expired sessions with re-login prompt
- **Email verification notifications**: Clear messages when login fails due to unverified email

### Subscription Plans
- **Monthly/Yearly pricing**: Added pricing modal with monthly ($19.99) and yearly ($199.99) plans
- **Savings display**: Shows 17% savings on yearly plans with visual indicators
- **Integrated checkout**: Direct integration with Django backend for Stripe payments

### User Experience
- **Cart checkout flow**: Redirects to pricing modal instead of direct checkout
- **Session management**: Proper handling of expired tokens during checkout
- **Error handling**: Comprehensive error messages for authentication issues

### Technical Architecture
- **PricingPlans component**: New component for subscription plan selection
- **Enhanced AuthContext**: Added checkTokenExpiry function for token validation
- **CartSidebar updates**: Integrated with new pricing modal and login flows
- **Backend integration**: Maintained existing Django API endpoints for payments