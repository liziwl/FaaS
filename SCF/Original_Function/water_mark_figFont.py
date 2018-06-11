# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw, ImageFont
import math


def water_mark_fig(input_file_addr, font_style_addr, text, ratio=0.2):
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


if __name__ == "__main__":
    water_mark_fig("/home/caesar/Repository/FaaS/SCF/Figure/xiaoshi.png",
                   "/home/caesar/Repository/FaaS/SCF/Figure/Ubuntu-M.ttf", " 6666 ", 0.2).show()
