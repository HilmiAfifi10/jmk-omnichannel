# EasyCatalog - Multi-Channel Product Catalog Management SaaS

A comprehensive SaaS platform designed for SMEs (Small and Medium Enterprises) to manage product catalogs digitally and synchronize them across multiple channels including WhatsApp, Instagram, TikTok Shop, and custom websites.

## 🌟 Features

### Core Features
- **Product Management**: Comprehensive product catalog with variants, images, and detailed specifications
- **Category Organization**: Hierarchical category structure with parent-child relationships
- **Stock Management**: Real-time inventory tracking with stock movement history
- **Multi-Variant Support**: Handle products with multiple variants (size, color, etc.) with individual pricing and stock levels
- **Barcode Generation**: GTIN/EAN support with barcode image generation via Supabase storage
- **AI-Powered Descriptions**: Generate professional product descriptions using Gemini AI

### OmniChannel Integration
- **TikTok Shop Integration**: OAuth2 authentication and product synchronization with TikTok Shop
- **Supabase Storage**: Cloud-based image and barcode storage
- **API-Ready Architecture**: RESTful design for future integrations (WhatsApp, Instagram, etc.)

### Store Management
- **Multi-Store Support**: Each user can manage their own store with customizable settings
- **Store Configuration**: Customize store name, description, logo, currency, contact information
- **Dashboard Analytics**: Overview of products, categories, stock levels, and inventory value

### Security & Authentication
- **NextAuth.js Integration**: Secure authentication with credential-based login
- **Session Management**: JWT-based session handling
- **Protected Routes**: Role-based access control for dashboard and API endpoints

## 🛠 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - Latest React version
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Modern icon library
- **React Hook Form + Zod** - Form handling and validation

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Primary database
- **NextAuth.js** - Authentication solution
- **bcrypt** - Password hashing

### External Services
- **Supabase** - Object storage for images and barcodes
- **OpenAI (Gemini)** - AI-powered product description generation
- **TikTok Shop API** - E-commerce platform integration

## 📁 Project Structure

```
jmk-omnichannel/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── api/                    # API routes
│   │   │   ├── auth/               # NextAuth endpoints
│   │   │   └── tiktok/             # TikTok OAuth callbacks
│   │   ├── dashboard/              # Dashboard pages
│   │   │   ├── products/           # Product management
│   │   │   ├── categories/         # Category management
│   │   │   ├── stock/              # Stock management
│   │   │   └── settings/           # Store settings
│   │   ├── sign-in/                # Login page
│   │   └── sign-up/                # Registration page
│   ├── components/                 # React components
│   │   ├── dashboard/              # Dashboard-specific components
│   │   └── ui/                     # Reusable UI components
│   ├── lib/                        # Utility libraries
│   │   ├── auth.ts                 # NextAuth configuration
│   │   ├── prisma.ts               # Prisma client
│   │   └── supabase.ts             # Supabase client
│   ├── repositories/               # Data access layer
│   │   ├── product.repository.ts
│   │   ├── category.repository.ts
│   │   ├── stock.repository.ts
│   │   ├── store.repository.ts
│   │   └── tiktok.repository.ts
│   ├── services/                   # Business logic
│   │   ├── ai.service.ts           # AI description generation
│   │   └── tiktok.service.ts       # TikTok API integration
│   ├── types/                      # TypeScript type definitions
│   └── validation/                 # Zod schemas
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── migrations/                 # Database migrations
└── public/                         # Static assets
```

## 🗄 Database Schema

### Core Models
- **User**: User accounts with email/password authentication
- **Account**: OAuth provider accounts (for NextAuth)
- **Session**: User session management
- **Store**: Store information and configuration
- **Category**: Hierarchical product categories
- **Product**: Product information with status (DRAFT/ACTIVE/ARCHIVED)
- **ProductVariant**: Product variants with pricing, stock, and GTIN
- **ProductImage**: Product images with positioning
- **StockMovement**: Inventory transaction history
- **TikTokIntegration**: TikTok Shop OAuth tokens and configuration

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database
- pnpm (recommended) or npm
- Supabase account
- TikTok Shop developer account (for integration)
- Gemini API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/HilmiAfifi10/jmk-omnichannel.git
   cd jmk-omnichannel
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your credentials:
   ```env
   # Database
   DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public

   # Authentication
   AUTH_SECRET=your-super-secret-key
   SALT_ROUNDS=10

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

   # AI Service
   GEMINI_API_KEY=your-gemini-ai-api-key

   # TikTok Shop
   TIKTOK_APP_KEY=your-tiktok-app-key
   TIKTOK_APP_SECRET=your-tiktok-app-secret
   TIKTOK_REDIRECT_URI=https://your-domain.com/api/tiktok/callback
   ```

4. **Set up the database**
   ```bash
   pnpm prisma generate
   pnpm prisma migrate deploy
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## 🔐 Authentication Flow

1. Users register with email and password
2. Passwords are hashed using bcrypt
3. JWT tokens are issued upon successful login
4. Protected routes verify session tokens
5. Store is automatically created for new users

## 🛒 TikTok Shop Integration

1. Navigate to Settings page
2. Click "Connect TikTok Shop"
3. Authorize the application via TikTok OAuth
4. Access and refresh tokens are securely stored
5. Products can be synced to TikTok Shop (future feature)

## 🎨 UI Components

Built with **Radix UI** and **Tailwind CSS**, providing:
- Responsive data tables with pagination
- Modal dialogs for create/edit operations
- Toast notifications (via Sonner)
- Form validation with real-time feedback
- Dark mode support (default)
- Accessible components following WAI-ARIA standards