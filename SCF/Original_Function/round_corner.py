from PIL import Image, ImageFont, ImageDraw


def round_corner(input_file_addr, radius=0.15, fixed=0):
    """
    Rounding corner to figure

    Parameters
    ----------
    input_file_addr: The address of input figure
    radius: If fixed = 0, radius represent in ratio; If fixed = 1, radius represent in pixel;
    fixed: 0 for using relative position, 1 for using fixed pixel position. (default = 0)

    Returns
    -------
    figure object

    """
    image = Image.open(input_file_addr)
    imageW, imageH = image.size
    if fixed == 0:
        if radius >= 0.5:
            radius = 0.5
        radius = (int)(min(imageW, imageH) * radius)
    else:
        radius = min(radius, imageW / 2, imageH / 2)

    circle = Image.new('L', (radius * 2, radius * 2), 0)
    draw = ImageDraw.Draw(circle)
    draw.ellipse((0, 0, radius * 2, radius * 2), fill=255)
    alpha = Image.new('L', image.size, "white")
    w, h = image.size
    alpha.paste(circle.crop((0, 0, radius, radius)), (0, 0))
    alpha.paste(circle.crop((0, radius, radius, radius * 2)), (0, h - radius))
    alpha.paste(circle.crop((radius, 0, radius * 2, radius)), (w - radius, 0))
    alpha.paste(circle.crop((radius, radius, radius * 2,
                             radius * 2)), (w - radius, h - radius))
    image.putalpha(alpha)
    return image


if __name__ == "__main__":
    round_corner(
        "/home/caesar/Desktop/1.jpg", 100, fixed=0).show()
