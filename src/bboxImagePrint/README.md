# BBox Image Print MCP Server

A Model Context Protocol server for drawing bounding boxes on images.

## Features

- Draw bounding boxes on images
- Customize color and line width
- Input/output as base64 encoded images
- Uses Python Pillow for image processing

## Installation

### Using npm

```bash
npm install -g @modelcontextprotocol/server-bbox-image-print
```

### Using Docker

```bash
docker run -it mcp/bbox-image-print
```

## Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "bbox-image-print": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-bbox-image-print"
      ]
    }
  }
}
```

## Usage with VS Code

Open the Command Palette (`Ctrl + Shift + P`) and run `MCP: Open User Configuration`. Add:

```json
{
  "servers": {
    "bbox-image-print": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-bbox-image-print"]
    }
  }
}
```

## API

### draw_bbox_on_image

Draws a bounding box on an image.

**Parameters:**

- `imageBase64` (string, required): Base64 encoded image data
- `bbox` (object, required): Bounding box coordinates
  - `x1` (number): Top-left x coordinate
  - `y1` (number): Top-left y coordinate
  - `x2` (number): Bottom-right x coordinate
  - `y2` (number): Bottom-right y coordinate
- `color` (string, optional): Color of the bounding box (default: "red")
- `lineWidth` (number, optional): Width of the bounding box line (default: 2)

**Returns:**

- `imageBase64` (string): Base64 encoded image with bounding box drawn

## Development

```bash
cd src/bboxImagePrint
npm install
npm run build
```

### Running locally

```bash
npm run watch
```

## License

MIT License
