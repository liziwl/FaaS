from PIL import Image, ImageFont, ImageDraw

def rotate(input_file_addr, angle):
    """
    Rotate figure

    Parameters
    ----------
    input_file_addr: The input file address
    angle: The angle to rotate. Counter clock

    Returns
    -------
    figure object
    """
    image = Image.open(input_file_addr)
    image = image.rotate(angle, expand=1)
    image = image.convert("RGBA")

    pixdata = image.load()
    width, height = image.size
    for y in xrange(height):
        for x in xrange(width):
            if pixdata[x, y] == (0, 0, 0, 255):
                pixdata[x, y] = (255, 255, 255, 0)
    return image


if __name__ == "__main__":
    rotate("/home/caesar/Desktop/1.jpg", 45).show()
