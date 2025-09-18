# Zone2Run - Complete Codebase Analysis

## 🏃‍♂️ Project Overview

Zone2Run is a sophisticated Next.js e-commerce application for running gear, built with a modern tech stack and following best practices for performance and user experience.

---

## 🏗️ Architecture & Tech Stack

### Core Technologies

- **Framework**: Next.js 15.3.0 with App Router
- **Language**: TypeScript with strict configuration
- **Styling**: Tailwind CSS + Styled Components
- **State Management**: Zustand
- **CMS**: Sanity for content management
- **E-commerce**: Shopify Storefront API
- **Package Manager**: pnpm
- **Currency**: SEK (Swedish Krona)

### Key Dependencies

- **UI**: Lucide React icons, Geist font
- **Data Fetching**: GraphQL with graphql-request
- **Image Optimization**: Next.js Image + Sanity Image URL builder
- **Performance**: Optimized webpack config, package imports

---

## 📁 Project Structure

### App Directory (Next.js 15 App Router)

```
src/app/
├── layout.tsx              # Root layout with providers
├── page.tsx                # Homepage
├── globals.css             # Global styles
├── brands/                 # Brand pages
├── mens/                   # Men's product pages
├── womens/                 # Women's product pages
├── products/               # Product pages with complex routing
└── order-confirmation/     # Checkout completion
```

### Components Architecture

```
src/components/
├── Header.tsx              # Main navigation
├── Footer.tsx              # Site footer
├── Homepage.tsx            # Homepage content
├── ProductCard.tsx         # Product display
├── ProductGrid.tsx         # Product listing
├── CartModal.tsx           # Shopping cart
├── SearchModal.tsx         # Product search
├── menumodal/              # Navigation modal system
│   ├── MenuModal.tsx       # Main modal component
│   ├── MenContent.tsx      # Men's navigation
│   ├── WomenContent.tsx    # Women's navigation
│   └── menuConfig.ts       # Navigation configuration
└── product/                # Product-specific components
    ├── ProductDetails.tsx  # Product information
    ├── ProductGallery.tsx  # Image gallery
    ├── AddToCart.tsx       # Purchase functionality
    └── VariantSelector.tsx # Product variants
```

---

## 🛒 E-commerce Features

### Product Management

- **Dual Data Sources**: Sanity CMS + Shopify Storefront API
- **Product Types**: Combined Sanity + Shopify data structure
- **Image Handling**: Sanity images with Shopify fallbacks
- **Variant Management**: Size, color, and other product options

### Shopping Cart

- **State Management**: Zustand store with persistence
- **Cart Operations**: Add, remove, update quantities
- **UI State**: Separate UI store for modal management
- **Checkout Flow**: Shopify checkout integration

### Navigation & Filtering

- **Hierarchical Categories**: 3-level category system
- **Gender-based Navigation**: Men's and Women's sections
- **Advanced Filtering**: URL-based filters with state persistence
- **Search Functionality**: Product search with modal interface

---

## 🎨 UI/UX Features

### Design System

- **Responsive Design**: Mobile-first approach
- **Component Library**: Reusable UI components
- **Animation**: Smooth transitions and hover effects
- **Accessibility**: Proper ARIA labels and keyboard navigation

### User Experience

- **Modal System**: Overlay navigation and cart
- **Scroll Management**: Modal scroll restoration
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: Graceful error boundaries

---

## 🔧 Technical Implementation

### State Management

- **Zustand Stores**:
  - Cart store for shopping cart state
  - UI store for modal and interface state
  - Variant store for product selection
  - Search store for search functionality

### Data Fetching

- **Sanity Integration**: GROQ queries for content
- **Shopify Integration**: GraphQL for product data
- **Combined Data**: Merged Sanity + Shopify product objects
- **Caching**: Next.js built-in caching strategies

### Performance Optimizations

- **Image Optimization**: Next.js Image component
- **Code Splitting**: Dynamic imports for modals
- **Bundle Optimization**: Tree shaking and package analysis
- **SEO**: Meta tags and structured data

---

## 📊 Data Flow

### Product Data Pipeline

1. **Sanity CMS**: Content management and product metadata
2. **Shopify API**: Product variants, pricing, and inventory
3. **Data Merging**: Combined product objects with helper methods
4. **Component Rendering**: Typed product data in React components

### Navigation Flow

1. **Menu Configuration**: Centralized navigation structure
2. **Dynamic Routing**: Next.js dynamic routes for categories
3. **State Management**: URL-based filtering and sorting
4. **Modal Navigation**: Overlay navigation system

---

## 🚀 Key Features

### Product Catalog

- **Hierarchical Categories**: Main → Sub → Sub-sub categories
- **Gender Filtering**: Men's, Women's, Unisex products
- **Brand Management**: Brand pages and product filtering
- **Product Details**: Rich product information and galleries

### Shopping Experience

- **Cart Management**: Persistent shopping cart
- **Checkout Process**: Shopify-powered checkout
- **Order Confirmation**: Post-purchase experience
- **Search & Filter**: Advanced product discovery

### Content Management

- **Sanity Studio**: Content editing interface
- **Schema Validation**: Type-safe content structure
- **Image Management**: Optimized image handling
- **SEO Management**: Meta data and structured content

---

## 🔍 Code Quality

### TypeScript Usage

- **Strict Configuration**: Full type safety
- **Generated Types**: Sanity TypeGen for schema types
- **Custom Types**: Product and e-commerce specific types
- **Type Safety**: End-to-end type checking

### Code Organization

- **Modular Structure**: Separated concerns
- **Reusable Components**: DRY principle
- **Custom Hooks**: Logic abstraction
- **Utility Functions**: Helper methods and utilities

---

## 📈 Performance Metrics

### Optimization Strategies

- **Image Optimization**: WebP format and responsive images
- **Code Splitting**: Lazy loading for modals and heavy components
- **Bundle Analysis**: Optimized package imports
- **Caching**: Strategic data and asset caching

### Monitoring

- **Vercel Analytics**: Performance tracking
- **Speed Insights**: Core Web Vitals monitoring
- **Error Tracking**: Production error monitoring
- **User Analytics**: Behavior and conversion tracking

---

## 🛠️ Development Workflow

### Git Strategy

- **Branch Structure**: main → staging → feature branches
- **Pull Request Workflow**: Code review and testing
- **Deployment Pipeline**: Automated deployments
- **Version Control**: Semantic versioning

### Development Tools

- **TypeScript**: Type checking and IntelliSense
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality gates

---

## 📋 Key Files & Locations

### Configuration

- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Styling configuration
- `tsconfig.json` - TypeScript configuration
- `sanity.config.ts` - Sanity CMS configuration

### Core Components

- `src/app/layout.tsx` - Root layout and providers
- `src/components/Header.tsx` - Main navigation
- `src/components/Homepage.tsx` - Homepage content
- `src/components/menumodal/MenuModal.tsx` - Navigation modal

### Data Layer

- `src/sanity/lib/getData.ts` - Sanity data fetching
- `src/lib/shopify/products.ts` - Shopify integration
- `src/types/product.ts` - Product type definitions
- `src/store/` - Zustand state management

### Utilities

- `src/lib/utils/formatPrice.ts` - Price formatting
- `src/hooks/` - Custom React hooks
- `src/sanity/lib/image.ts` - Image URL building

---

## 🎯 Future Considerations

### Potential Improvements

- **Type Safety**: Migrate to generated Sanity types
- **Performance**: Further optimization opportunities
- **Testing**: Unit and integration test coverage
- **Accessibility**: Enhanced a11y features
- **Internationalization**: Multi-language support

### Scalability

- **Content Management**: Enhanced Sanity workflows
- **Product Management**: Advanced inventory features
- **User Experience**: Personalization and recommendations
- **Analytics**: Advanced tracking and insights

---

This codebase represents a well-architected, modern e-commerce application with strong foundations for growth and scalability. The combination of Next.js, Sanity, and Shopify provides a robust platform for running gear retail with excellent developer and user experiences.
