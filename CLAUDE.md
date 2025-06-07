# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `bun dev` - Start development server
- `bun run build` - Build the project (runs TypeScript compilation and Vite build)
- `bun run lint` - Run ESLint
- `bun run format` - Format code with Prettier
- `bun run shadcn` - Add shadcn/ui components

## Architecture Overview

This is an OCIF (Open Canvas Interchange Format) document viewer and editor built with React, TypeScript, and Vite. The app follows the OCIF spec v0.5 (https://github.com/ocwg/spec/blob/main/spec/v0.5/spec.md).

### Core Structure

- **Split-pane layout**: JSON editor (left) and visual canvas (right)
- **Real-time sync**: Changes in JSON editor immediately reflect on canvas
- **Canvas system**: Interactive 2D canvas with zoom, pan, and selection modes

### Key Components

- `src/ocif/schema.ts` - Generated TypeScript types and validators from OCIF JSON schema
- `src/ocif/contexts/EditorContext.tsx` - Editor state management (position, scale, mode)
- `src/ocif/components/OcifEditor.tsx` - Main canvas rendering component
- `src/ocif/components/NodeContainer.tsx` - Individual node rendering
- `src/components/DocumentJsonEditor.tsx` - Monaco-based JSON editor

### OCIF Document Structure

OCIF documents contain:

- **Nodes**: Visual elements with position, size, and optional resources
- **Resources**: Content (text, images, etc.) that can be referenced by nodes
- **Relations**: Connections between nodes
- **Schemas**: Custom schema definitions for extensions

### Canvas Features

- Pan and zoom functionality
- Multiple interaction modes (select/hand)
- Node positioning and rendering
- Resource display with various fit modes (contain, cover, fill, etc.)

### Development Notes

- Uses Bun as package manager
- Tailwind CSS for styling with shadcn/ui components
- Monaco Editor for JSON editing
- Husky + lint-staged for pre-commit hooks
- Schema generation via `build-schema.ts`
