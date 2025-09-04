# BonziWORLD Revived 2025 Edition

## Overview
This is a BonziWORLD chat application featuring animated virtual assistants in a retro Windows XP-styled interface. Users can chat in real-time with animated characters (Bonzi, Clippit, Peedy, etc.) that provide text-to-speech functionality.

## Recent Changes
- **2025-09-04**: Initial import and setup for Replit environment
- Configured server to bind to 0.0.0.0:5000 for Replit hosting
- Set up workflow for the Node.js server
- Configured deployment settings for production

## Project Architecture
- **Backend**: Node.js/Express server with Socket.io for real-time communication
- **Frontend**: Static HTML/CSS/JS served from `build/www/` directory
- **Features**: 
  - Real-time chat with multiple rooms
  - Animated virtual assistant characters
  - Text-to-speech functionality
  - Windows XP-style UI/UX
  - Multiple character skins and voices

## Key Configuration
- **Port**: 5000 (configured for Replit)
- **Host**: 0.0.0.0 (allows external connections)
- **Static Files**: Served from `build/www/`
- **Main Entry Point**: `index.js`
- **Deployment**: VM deployment target for stateful chat server

## Dependencies
- express: Web server framework
- socket.io: Real-time communication
- sanitize-html: Input sanitization
- winston: Logging
- Various TTS and AI integration packages

## Current State
✅ **Fully Functional** - The application is running successfully with:
- Server listening on port 5000
- Static file serving working
- Socket.io connections established
- Real-time chat functionality operational
- Deployment configuration complete