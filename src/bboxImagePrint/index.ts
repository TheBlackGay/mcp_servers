#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BboxSchema = z.object({
  x1: z.number().describe("Top-left x coordinate of bounding box"),
  y1: z.number().describe("Top-left y coordinate of bounding box"),
  x2: z.number().describe("Bottom-right x coordinate of bounding box"),
  y2: z.number().describe("Bottom-right y coordinate of bounding box")
});

const DrawBboxOnImageArgsSchema = z.object({
  imageBase64: z.string().describe("Base64 encoded image data"),
  bbox: BboxSchema.describe("Bounding box coordinates"),
  color: z.string().optional().default("red").describe("Color of the bounding box (e.g., 'red', '#FF0000', 'rgb(255,0,0)')"),
  lineWidth: z.number().optional().default(2).describe("Width of the bounding box line")
});

const server = new McpServer({
  name: "bbox-image-print-server",
  version: "0.1.0",
});

async function drawBboxWithPython(imageBase64: string, bbox: { x1: number; y1: number; x2: number; y2: number }, color: string, lineWidth: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, "bbox_drawer.py");
    const pythonPath = process.env.PYTHON_PATH || "python3";
    
    const child = spawn(pythonPath, [pythonScript, imageBase64, JSON.stringify(bbox), color, String(lineWidth)]);
    
    let stdout = "";
    let stderr = "";
    
    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(`Python script failed with code ${code}: ${stderr}`));
      }
    });
  });
}

server.registerTool(
  "draw_bbox_on_image",
  {
    title: "Draw Bounding Box on Image",
    description: "Draw a bounding box on an image and return the result as base64. Accepts a base64-encoded image, bbox coordinates, and optional color/line width parameters.",
    inputSchema: {
      imageBase64: z.string().describe("Base64 encoded image data"),
      bbox: z.object({
        x1: z.number().describe("Top-left x coordinate"),
        y1: z.number().describe("Top-left y coordinate"),
        x2: z.number().describe("Bottom-right x coordinate"),
        y2: z.number().describe("Bottom-right y coordinate")
      }).describe("Bounding box coordinates"),
      color: z.string().optional().default("red").describe("Color of the bounding box (default: red)"),
      lineWidth: z.number().optional().default(2).describe("Width of the bounding box line (default: 2)")
    },
    outputSchema: {
      imageBase64: z.string().describe("Base64 encoded output image")
    }
  },
  async (args: z.infer<typeof DrawBboxOnImageArgsSchema>) => {
    const resultBase64 = await drawBboxWithPython(args.imageBase64, args.bbox, args.color ?? "red", args.lineWidth ?? 2);
    
    return {
      content: [{ type: "text" as const, text: "Successfully drew bounding box on image" }],
      structuredContent: { imageBase64: resultBase64 }
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("BBox Image Print MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
