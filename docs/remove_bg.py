import sys
from PIL import Image

def remove_background(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    # Using a threshold to catch near-white pixels (e.g. 240+)
    threshold = 240
    for item in datas:
        # Check if the pixel is white-ish
        if item[0] >= threshold and item[1] >= threshold and item[2] >= threshold:
            # Change all white-ish pixels to transparent
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python remove_bg.py <input> <output>")
        sys.exit(1)
    remove_background(sys.argv[1], sys.argv[2])
