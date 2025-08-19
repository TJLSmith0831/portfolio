# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev --turbopack` - Start development server with Turbopack for faster builds
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Project Architecture

This is a Next.js 15 portfolio application built with the App Router architecture using TypeScript and Tailwind CSS. The project follows a component-based structure with shadcn/ui components.

### Key Technologies
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **UI Components**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **Fonts**: Geist Sans and Geist Mono
- **Theme**: next-themes for dark/light mode switching
- **Build Tool**: Turbopack (enabled by default in dev)

### Project Structure
- `app/` - Next.js App Router pages and layouts
  - `layout.tsx` - Root layout with theme provider and font setup
  - `page.tsx` - Main portfolio page with section composition
  - `globals.css` - Global styles and Tailwind configuration
- `components/` - Reusable React components
  - `ui/` - shadcn/ui base components (button, card, badge)
  - Section components: hero-section, work-section, personal-section, contact-section
  - `theme-provider.tsx` - Theme context provider
  - `navigation.tsx` - Main navigation component
  - `animated-background.tsx` - Background animation component
- `lib/` - Utility functions
  - `utils.ts` - Common utilities including cn() for className merging
  - `icarusAI.ts` - AI personal assistant functionality

### Component Patterns
- All components use TypeScript with explicit typing
- shadcn/ui components follow the established file structure in `components/ui/`
- Theme switching is handled via `next-themes` with system preference detection
- Animations use CSS classes (likely from `tw-animate-css`)
- Components use `@/` path aliases for clean imports

### Configuration Files
- `components.json` - shadcn/ui configuration with New York style
- `tsconfig.json` - TypeScript configuration with `@/*` path mapping
- Path aliases: `@/components`, `@/lib`, `@/ui`, `@/hooks`

### Development Notes
- Default theme is dark mode with system preference support
- Uses CSS variables for theming (configured in `components.json`)
- Responsive design with mobile-first approach
- Smooth scrolling navigation between portfolio sections