# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an unofficial Node.js API driver for Firefly Schools Virtual Learning Environment. It provides both a reusable driver module and example implementations showing how to interact with the Firefly API.

## Architecture

### Two Main Components:
- **Driver/** - The main Node.js API driver (`firefly-api.js`) with authentication, GraphQL queries, and data export/import functionality
- **Examples/** - Standalone example scripts showing various API operations using older request/xml2js libraries

### Key Design Patterns:
- **Class-based API wrapper** in `Driver/firefly-api.js` with promise-based methods
- **Authentication flow** requires manual browser interaction to obtain XML token, then uses device ID + secret for subsequent requests
- **GraphQL integration** for data queries (events, messages, bookmarks, groups)
- **XML parsing** for initial authentication and school lookup responses
- **State management** via export/import JSON functionality

## Development Commands

### Driver Module:
```bash
cd Driver/
npm install
npm test               # Runs comprehensive unit tests (no credentials needed)
npm run test:integration  # Runs integration test with environment variables
```

### Examples:
```bash
cd Examples/
npm install
node auth.js       # Test authentication and token verification
node misc.js       # Get school instance info and API version
```

## Configuration

All components require `environment.json` configuration files:
- Copy `Examples/environment.example.json` to create local config
- Required fields: `schoolCode`, `host`, `deviceID`, `secret`
- The Driver uses dotenv for environment variables instead

## Authentication Flow

1. Use `Firefly.getHost(code)` to resolve school code to host URL
2. Generate device ID and get authentication URL
3. Manual browser login required - user must extract XML token from DOM
4. Complete authentication with `completeAuthentication(xmlResponse)`
5. Store credentials via `export` property for future sessions

## API Structure

The main Firefly class provides:
- **Static methods**: `getHost()` for school resolution  
- **Authentication**: `authenticate()`, `completeAuthentication()`, `verifyCredentials()`
- **Data access**: `getEvents()`, `getTasks()`, `messages`, `bookmarks`, `groups`, `classes`, `configuration`
- **Session management**: `export`/`import()` for credential persistence
- **Low-level**: `graphQuery()` for custom GraphQL queries