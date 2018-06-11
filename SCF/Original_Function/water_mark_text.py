# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw, ImageFont
import math


def water_mark_text(input_file_addr, font_style_addr, text, size_ratio=0.2, angle=30, clear=0.2, position=3, fixed=0):
    """
    Add text water mark

    When fixed = 0, position have five value:
    1 -> Upper Left
    2 -> Upper Right
    3 -> Center
    4 -> Bottom Left
    5 -> Bottom Right

    When fixed = 1, position = (width, height)

    Parameters
    ----------
    input_file_addr: The address of input figure
    font_style_addr: The address of font style
    text: The water mark text
    size_ratio: The size of water mark based on input figure
    angle: The rotate angle for text
    clear: How clear the water mark is
    position: When fixed = 0, the position of QR Code (5 for default). When fixed = 1, the position is the pixel point in the original graph (width, height).
    fixed: 0 for using relative position, 1 for using fixed pixel position. (default = 0)

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
    k = (int)(min(imageH, imageW) * size_ratio)
    Font = ImageFont.truetype(font_style_addr, k, encoding="unic")
    textW, textH = Font.getsize(text)
    d.ink = 0 + 0 * 256 + 0 * 256 * 256
    d.text([(textImageW - textW) / 2, (textImageH - textH) / 2], text, font=Font)

    textRotate = blank.rotate(angle)
    rLen = math.sqrt((textW / 2)**2 + (textH / 2)**2)
    oriAngle = math.atan(textH / textW)
    cropW = rLen * math.cos(oriAngle + math.pi / 6) * 2
    cropH = rLen * math.sin(oriAngle + math.pi / 6) * 2
    box = [int((textImageW - cropW) / 2 - 1), int((textImageH - cropH) / 2 - 1) - 50,
           int((textImageW + cropW) / 2 + 1), int((textImageH + cropH) / 2 + 1)]
    textIm = textRotate.crop(box)
    pasteW, pasteH = textIm.size
    textBlank = Image.new("RGB", (imageW, imageH), "white")

    pasteW, pasteH = textIm.size
    if(fixed == 0):
        if(position == 1):
            pasteBox = (0, 0)
        elif(position == 2):
            pasteBox = (int(imageW - pasteW), 0)
        elif(position == 3):
            pasteBox = (int((imageW - pasteW) / 2 - 1),
                        int((imageH - pasteH) / 2 - 1))
        elif(position == 4):
            pasteBox = (0, imageH - pasteH)
        else:
            pasteBox = (imageW - pasteW, imageH - pasteH)
    else:
        pastedW = min(imageW, position[0])
        pastedH = min(imageH, position[1])
        pasteBox = (pastedW, pastedH)

    textBlank.paste(textIm, pasteBox)
    waterImage = Image.blend(image, textBlank, clear)
    return waterImage


if __name__ == "__main__":
    water_mark_text("/home/caesar/Repository/FaaS/SCF/Figure/xiaoshi.png",
                    "/home/caesar/Repository/FaaS/SCF/Figure/Ubuntu-M.ttf", " 6666 ", 0.2, 10, 0.2, position=(100, 100), fixed=1).show()
