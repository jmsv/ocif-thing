# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo for OCIF (Open Canvas Interchange Format) tools, implementing the OCIF Spec v0.5. The project uses Bun as the package manager and Turbo for monorepo orchestration.

### Architecture

The project is structured as a monorepo with:

- **apps/playground**: React + Vite playground app demonstrating OCIF editing capabilities
- **packages/ocif-thing-schema**: TypeScript types and schemas for OCIF documents
- **packages/ocif-thing-validate**: AJV-based validation for OCIF documents
- **packages/ocif-thing-editor**: React component library for editing OCIF documents

The packages have interdependencies: editor depends on schema, validate depends on schema, and playground uses all three packages.

## Common Commands

### Development

- `bun i` - Install dependencies
- `bun dev` - Start development servers for all apps
- `bun build` - Build all packages and apps
- `bun check-types` - Type check all packages

### Code Quality

- `bun lint` - Run ESLint across the codebase
- `bun format` - Format code with Prettier

### Package-specific Development

- Individual packages can be developed with `bun dev` in their directories
- Packages use tsup for building with watch mode support

## Reference

OCIF Spec: https://github.com/ocwg/spec/blob/main/spec/v0.5/spec.md
