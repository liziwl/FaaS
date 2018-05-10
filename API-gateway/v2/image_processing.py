import qrcode
from PIL import Image, ImageFont, ImageDraw
import math


def add_QRCode(input_file_addr, QRCode_text, position=5):
    """
    position have five value:
    1 -> Upper Left
    2 -> Upper Right
    3 -> Center
    4 -> Bottom Left
    5 -> Bottom Right

    Parameters
    ----------
    input_file_addr: The file address of input figure
    QRCode_text: The text of QR Code (To generate QR Code)
    position: The position of QR Code (5 for default)

    Returns
    -------
    The image object

    """
    image = Image.open(input_file_addr)
    imageW, imageH = image.size
    QRcode_size = min(imageW/4, imageH/4)
    QRcode_size = (QRcode_size, QRcode_size)
    QRcode = qrcode.make(QRCode_text)
    QRcode = QRcode.resize(QRcode_size, Image.ANTIALIAS)
    QRcodeW, QRcodeH = QRcode.size
    if(position == 1):
        image.paste(QRcode, (0, 0))
    elif(position == 2):
        image.paste(QRcode, (imageW - QRcodeW, 0))
    elif(position == 3):
        image.paste(QRcode, ((imageW - QRcodeW)/2, (imageH - QRcodeH)/2))
    elif(position == 4):
        image.paste(QRcode, (0, imageH - QRcodeH))
    else:
        image.paste(QRcode, (imageW - QRcodeW, imageH - QRcodeH))

    return image


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

    textImageW = int(imageW*1.5)
    textImageH = int(imageH*1.5)
    blank = Image.new("RGB", (textImageW, textImageH), "white")
    d = ImageDraw.Draw(blank)
    k = (int)(min(imageH, imageW) * ratio)
    Font = ImageFont.truetype(font_style_addr, k, encoding="unic")
    textW, textH = Font.getsize(text)
    d.ink = 0 + 0 * 256 + 0 * 256 * 256
    d.text([(textImageW-textW)/2, (textImageH-textH)/2], text, font=Font)

    textRotate = blank.rotate(30)
    rLen = math.sqrt((textW/2)**2+(textH/2)**2)
    oriAngle = math.atan(textH/textW)
    cropW = rLen*math.cos(oriAngle + math.pi/6) * 2
    cropH = rLen*math.sin(oriAngle + math.pi/6) * 2
    box = [int((textImageW-cropW)/2-1), int((textImageH-cropH)/2-1)-50,
           int((textImageW+cropW)/2+1), int((textImageH+cropH)/2+1)]
    textIm = textRotate.crop(box)
    pasteW, pasteH = textIm.size
    textBlank = Image.new("RGB", (imageW, imageH), "white")
    pasteBox = (int((imageW-pasteW)/2-1), int((imageH-pasteH)/2-1))
    textBlank.paste(textIm, pasteBox)
    waterImage = Image.blend(image, textBlank, 0.2)
    return waterImage


def water_mark_fig(input_file_addr, water_mark_fig_addr, ratio):
    """
    Add figure water mark
    Parameters
    ----------
    input_file_addr: The address for input figure
    water_mark_fig_addr: The address for water mark
    ratio: The size of water mark (based on size of figure)

    Returns
    -------
    figure object

    """
    im = Image.open(input_file_addr)
    imageW, imageH = im.size
    water_mark = Image.open(water_mark_fig_addr)
    water_mark_w, water_mark_H = water_mark.size

    Blank = Image.new("RGB", (imageW, imageH), "white")
    pasteBox = (int((imageW-water_mark_w)/2-1), int((imageH-water_mark_H)/2-1))
    Blank.paste(water_mark, pasteBox)
    waterImage = Image.blend(im, Blank, 0.2)
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
