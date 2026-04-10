#!/usr/bin/env python3
"""Python script to draw bounding box on image and output base64."""

import sys
import base64
import io
import json
from PIL import Image, ImageDraw


def draw_bbox_on_image(image_base64: str, bbox: dict, color: str = "red", line_width: int = 2) -> str:
    """Draw a bounding box on an image and return the result as base64."""
    image_data = base64.b64decode(image_base64)
    image = Image.open(io.BytesIO(image_data))
    
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    draw = ImageDraw.Draw(image)
    draw.rectangle(
        [bbox['x1'], bbox['y1'], bbox['x2'], bbox['y2']],
        outline=color,
        width=line_width
    )
    
    output = io.BytesIO()
    image.save(output, format='PNG')
    return base64.b64encode(output.getvalue()).decode('utf-8')


def main():
    if len(sys.argv) < 5:
        print("Usage: bbox_drawer.py <image_base64> <bbox_json> <color> <line_width>", file=sys.stderr)
        sys.exit(1)
    
    image_base64 = sys.argv[1]
    bbox = json.loads(sys.argv[2])
    color = sys.argv[3]
    line_width = int(sys.argv[4])
    
    result = draw_bbox_on_image(image_base64, bbox, color, line_width)
    print(result)


if __name__ == "__main__":
    main()
