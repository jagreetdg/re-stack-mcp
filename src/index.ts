// src/index.ts
import { StackExchangeMCPServer } from './server/MCPServer.js';

const server = new StackExchangeMCPServer();
server.run().catch(console.error);