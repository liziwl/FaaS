from PIL import Image, ImageFont, ImageDraw


def round_corner(input_file_addr, ratio=0.15):
    """
    Rounding corner to figure

    Parameters
    ----------
    input_file_addr: The address of input figure
    ratio: The size of round corner

    Returns
    -------
    figure object

    """
    image = Image.open(input_file_addr)
    imageW, imageH = image.size
    radius = (int)(min(imageW, imageH) * ratio)
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
        "/home/caesar/Repository/FaaS/SCF/Figure/xiaoshi.png", 0.15).show()
