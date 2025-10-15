# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Essential Commands
```bash
# Development (with Turbopack enabled)
npm run dev
# or
pnpm dev

# Production build (with Turbopack enabled)  
npm run build
# or
pnpm build

# Start production server
npm start
# or
pnpm start

# Install dependencies
pnpm install
```

### TypeScript & Type Checking
```bash
# Type checking (manual)
npx tsc --noEmit

# Type checking with watch mode
npx tsc --noEmit --watch
```

### Package Management
This project uses `pnpm` as the package manager. Always use `pnpm` commands instead of npm.

## Architecture Overview

### Project Structure
This is a **Next.js 15** application using the **App Router** with the following key architectural decisions:

- **Framework**: Next.js 15.5.0 with Turbopack enabled for faster builds
- **Styling**: Tailwind CSS v4 with custom fonts and animations
- **Animations**: GSAP, Lenis (smooth scrolling), Motion, and custom WebGL shaders
- **3D Graphics**: OGL library for WebGL-based visual effects
- **State Management**: React hooks with custom mobile detection logic
- **Package Manager**: pnpm (lockfile: `pnpm-lock.yaml`)

### Key Components Architecture

#### 1. Layout Structure
- **Root Layout** (`app/layout.tsx`): Wraps entire app with global providers
- **Global Preloader** (`app/components/GlobalPreloader.tsx`): 4-second loading animation
- **Lenis Provider** (`app/components/LenisProvider.tsx`): Smooth scrolling throughout app
- **Navigation** and **Footer**: Persistent UI elements

#### 2. Visual Effects System
- **Aurora** (`app/components/Aurora.tsx`): WebGL-based aurora background using OGL and custom GLSL shaders
- **Noise** (`app/components/Noise.tsx`): Pattern-based noise overlay
- **Orb** (`app/components/Orb.tsx`): Interactive 3D orb effects
- **ChromaHover** (`app/components/ChromaHover.tsx`): Spotlight hover effects with radial gradients
- **ClickSpark** (`app/components/ClickSpark.tsx`): Click animation effects
- **TargetCursor** (`app/components/TargetCursor.tsx`): Custom cursor with scoped targeting

#### 3. Mobile-First Responsive Design
- **Mobile Detection Hook** (`app/hooks/useMobileDetection.ts`): Multi-factor mobile detection
- **Conditional Rendering**: Desktop-only sections hidden on mobile
- **Mobile Popups**: Custom alerts and notifications for mobile users
- **Responsive Pricing**: Different layouts for mobile vs desktop

#### 4. Animation & Interaction Systems
- **Scroll Velocity** (`app/components/ScrollVelocity.tsx`): Velocity-based scroll animations
- **Text Typing Effect** (`app/components/TextType.tsx`): Typewriter animation
- **Back to Top** (`app/components/BackToTop.tsx`): Smooth scroll navigation
- **Cosmic Portal Button** (`app/components/CosmicPortalButton.tsx`): Animated CTA buttons

### Styling Architecture

#### Font System
- **Primary Brand**: `Aviano Future Heavy` (`.font-turcomm`)
- **Menu/Navigation**: `Good Times Rg` (`.font-menu`) 
- **Headings**: `Nasalization Rg` (`.font-heading`)
- **Fallbacks**: Geist Sans and Geist Mono from Google Fonts

#### Custom CSS Features
- **Animated Buttons**: Custom `.animated-button` class with complex hover states
- **Scrollbar Hiding**: Global scrollbar removal for clean design
- **Lenis Integration**: Smooth scrolling CSS configuration
- **Glass Morphism**: Backdrop blur effects throughout UI

### Performance Optimizations
- **Turbopack**: Enabled for both dev and build for faster compilation
- **Font Display Swap**: Prevents layout shift during font loading
- **Styled Components**: SSR-compatible styling with `styledComponents: true` in Next.js config
- **Image Optimization**: Next.js Image component for logo and assets

## Development Guidelines

### Component Development
1. **Client Components**: Most components use `"use client"` directive for interactivity
2. **Props Interface**: Use TypeScript interfaces for all component props
3. **Effect Cleanup**: Always cleanup WebGL contexts, timeouts, and event listeners
4. **Responsive Design**: Mobile-first approach with desktop enhancements

### State Management Patterns
- **Mobile Detection**: Use `useMobileDetection` hook for device-specific logic
- **Animation States**: Local state for hover, loading, and interaction states
- **Effect Dependencies**: Careful dependency management in useEffect hooks

### Styling Conventions
- **Tailwind Classes**: Primary styling method with custom utilities
- **Responsive Breakpoints**: `sm:`, `md:`, `lg:` prefixes for mobile-first design
- **Glass Effects**: `backdrop-blur-xl` with `bg-white/5` for glass morphism
- **Color System**: Consistent use of blue/purple gradients and white text on black backgrounds

### Animation Guidelines
- **Lenis**: Used for all smooth scrolling via `useLenis()` hook - provides `scrollTo()` function
- **WebGL Effects**: Aurora and Orb components handle their own animation loops
- **ScrollVelocity**: Now cooperative with user scrolling - pauses during user interaction
- **Hover States**: Use ChromaHover for consistent spotlight effects
- **User Scroll Detection**: `useIsUserScrolling()` hook detects active user scrolling
- **Mobile Considerations**: Reduced animations on mobile for performance
- **Accessibility**: Respects `prefers-reduced-motion` for ScrollVelocity component

### TypeScript Configuration
- **Path Mapping**: `@/*` points to root directory for clean imports
- **Strict Mode**: Enabled with `strict: true`
- **Target**: ES2017 for broad browser compatibility
- **Module Resolution**: `bundler` for Next.js compatibility

## Key Business Context

This is a **communication platform landing page** called "TruComm" featuring:
- **BYOSS Technology**: Proprietary storage system (main selling point)
- **Military-Grade Security**: Multiple encryption layers and compliance standards
- **Three Pricing Tiers**: XComm ($5), XComm Pro ($15), XComm Elite ($30)
- **Desktop-Focused**: Mobile users see limited functionality with prompts to use desktop
- **Security-First Messaging**: Emphasis on encryption, compliance, and enterprise security

The application prioritizes visual impact over content accessibility, using heavy animations and effects to create a premium, tech-forward brand impression.
