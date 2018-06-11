import qrcode
from PIL import Image, ImageFont, ImageDraw
import math


def add_QRCode(input_file_addr, QRCode_text, position=5, fixed=0):
    """
    When fixed = 0, position have five value:
    1 -> Upper Left
    2 -> Upper Right
    3 -> Center
    4 -> Bottom Left
    5 -> Bottom Right

    When fixed = 1, position = (width, height)

    Parameters
    ----------
    input_file_addr: The file address of input figure
    QRCode_text: The text of QR Code (To generate QR Code)
    position: When fixed = 0, the position of QR Code (5 for default). When fixed = 1, the position is the pixel point in the original graph (width, height).
    fixed: 0 for using relative position, 1 for using fixed pixel position. (default = 0)

    Returns
    -------
    The image object

    """
    image = Image.open(input_file_addr)
    imageW, imageH = image.size
    QRcode_size = min(imageW / 4, imageH / 4)
    QRcode_size = (QRcode_size, QRcode_size)
    QRcode = qrcode.make(QRCode_text)
    QRcode = QRcode.resize(QRcode_size, Image.ANTIALIAS)
    QRcodeW, QRcodeH = QRcode.size
    if(fixed == 0):
        if(position == 1):
            image.paste(QRcode, (0, 0))
        elif(position == 2):
            image.paste(QRcode, (imageW - QRcodeW, 0))
        elif(position == 3):
            image.paste(QRcode, ((imageW - QRcodeW) /
                                 2, (imageH - QRcodeH) / 2))
        elif(position == 4):
            image.paste(QRcode, (0, imageH - QRcodeH))
        else:
            image.paste(QRcode, (imageW - QRcodeW, imageH - QRcodeH))
    else:
        pastedW = min(imageW, position[0])
        pastedH = min(imageH, position[1])
        image.paste(QRcode, (pastedW, pastedH))

    return image


def slice(input_file_addr, slice_number, direction):
    """
    Slice the image to many pieces

    Parameters
    ----------
    input_file_addr: The address of original image
    slice_number: The number of pieces wanted
    direction: 1 for slice vertical, 0 for slice horizontal

    Returns
    -------
    Image array that contain all the image after slice. In order.
    If slice vertically, the array sort from up to down
    If slice horizontally, the array sort from left to right

    """
    image = Image.open(input_file_addr)
    imageW, imageH = image.size
    sliced_image = []
    if direction == 1:
        # Slice Vertically
        upper = 0
        left = 0
        right = imageW
        lower = 0
        every_slice_height = math.floor(imageH / slice_number)
        for i in range(slice_number):
            upper = lower
            if i == slice_number - 1:
                lower = imageH
            else:
                lower = (i + 1) * every_slice_height
            box = (left, upper, right, lower)
            sliced_image.append(image.crop(box))
    elif direction == 0:
        # Slice Horizontally
        upper = 0
        left = 0
        right = 0
        lower = imageH
        every_slice_weight = math.floor(imageW / slice_number)
        for i in range(slice_number):
            left = right
            if i == slice_number - 1:
                right = imageW
            else:
                right = (i + 1) * every_slice_weight
            box = (left, upper, right, lower)
            sliced_image.append(image.crop(box))
    else:
        print("Error direction")

    return sliced_image


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


def water_mark_text(input_file_addr, font_style_addr, text, ratio=0.2):
    """
    Add text water mark

    Parameters
    ----------
    input_file_addr: The address of input figure
    font_style_addr: The address of font style
    text: The water mark text
    ratio: The size of water mark based on input figure

    Returns
    -------
    figure object
    """
    image = Image.open(input_file_addr)
    imageW, imageH = image.size

    textImageW = int(imageW * 1.5)
    textImageH = int(imageH * 1.5)
    blank = Image.new("RGB", (textImageW, textImageH), "white")
    d = ImageDraw.Draw(blank)
    k = (int)(min(imageH, imageW) * ratio)
    Font = ImageFont.truetype(font_style_addr, k, encoding="unic")
    textW, textH = Font.getsize(text)
    d.ink = 0 + 0 * 256 + 0 * 256 * 256
    d.text([(textImageW - textW) / 2, (textImageH - textH) / 2], text, font=Font)

    textRotate = blank.rotate(30)
    rLen = math.sqrt((textW / 2)**2 + (textH / 2)**2)
    oriAngle = math.atan(textH / textW)
    cropW = rLen * math.cos(oriAngle + math.pi / 6) * 2
    cropH = rLen * math.sin(oriAngle + math.pi / 6) * 2
    box = [int((textImageW - cropW) / 2 - 1), int((textImageH - cropH) / 2 - 1) - 50,
           int((textImageW + cropW) / 2 + 1), int((textImageH + cropH) / 2 + 1)]
    textIm = textRotate.crop(box)
    pasteW, pasteH = textIm.size
    textBlank = Image.new("RGB", (imageW, imageH), "white")
    pasteBox = (int((imageW - pasteW) / 2 - 1), int((imageH - pasteH) / 2 - 1))
    textBlank.paste(textIm, pasteBox)
    waterImage = Image.blend(image, textBlank, 0.2)
    return waterImage


def water_mark_fig(input_file_addr, water_mark_fig_addr, clear, position, fixed):
    """
    Add figure water mark

    When fixed = 0, position have five value:
    1 -> Upper Left
    2 -> Upper Right
    3 -> Center
    4 -> Bottom Left
    5 -> Bottom Right

    When fixed = 1, position = (width, height)

    Parameters
    ----------
    input_file_addr: The address for input figure
    water_mark_fig_addr: The address for water mark
    clear: How clear the water mark is
    position: When fixed = 0, the position of QR Code (5 for default). When fixed = 1, the position is the pixel point in the original graph (width, height).
    fixed: 0 for using relative position, 1 for using fixed pixel position. (default = 0)

    Returns
    -------
    figure object

    """
    image = Image.open(input_file_addr)
    imageW, imageH = image.size
    water_mark = Image.open(water_mark_fig_addr)
    water_mark_w, water_mark_H = water_mark.size

    water_mark_w, water_mark_H = water_mark.size
    if(fixed == 0):
        if(position == 1):
            pasteBox = (0, 0)
        elif(position == 2):
            pasteBox = (int(imageW - water_mark_w), 0)
        elif(position == 3):
            pasteBox = (int((imageW - water_mark_w) / 2 - 1),
                        int((imageH - water_mark_H) / 2 - 1))
        elif(position == 4):
            pasteBox = (0, imageH - water_mark_H)
        else:
            pasteBox = (imageW - water_mark_w, imageH - water_mark_H)
    else:
        pastedW = min(imageW, position[0])
        pastedH = min(imageH, position[1])
        pasteBox = (pastedW, pastedH)

    Blank = Image.new("RGB", (imageW, imageH), "white")
    Blank.paste(water_mark, pasteBox)
    waterImage = Image.blend(image, Blank, clear)
    return waterImage


def thumbnail(input_file_addr, size=(128, 128)):
    """
    Create thumbnail for figure

    Parameters
    ----------
    input_file_addr: The input figure address
    size: The size of thumbnail (defaule (128, 128))

    Returns
    -------
    image object
    """
    image = Image.open(input_file_addr)
    image.thumbnail(size)
    return image


if __name__ == "__main__":
    water_mark_text("/home/caesar/Desktop/1.png",
                    "/home/caesar/Repository/FaaS/SCF/Figure/Ubuntu-M.ttf", " 6666 ", ratio=0.2).show()
    # water_mark_fig("/home/caesar/Desktop/12.jpg", "/home/caesar/Repository/FaaS/SCF/Figure/logo.jpeg", 0.15).show()
