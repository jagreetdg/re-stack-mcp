"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
var MCPServer_1 = require("./server/MCPServer");
var server = new MCPServer_1.StackExchangeMCPServer();
server.run().catch(console.error);
