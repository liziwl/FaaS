from PIL import Image, ImageFont, ImageDraw
import math


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
    image = image.rotate(angle)
    return image


if __name__ == "__main__":
    rotate("/home/caesar/Repository/FaaS/SCF/Figure/xiaoshi.png", 90).show()
