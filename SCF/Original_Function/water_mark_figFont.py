# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw, ImageFont
import math

fileName = "/home/caesar/Repository/FaaS/SCF/Figure/xiaoshi.png"
text = " 6666 "
im = Image.open(fileName)
imageW, imageH = im.size

textImageW = int(imageW*1.5)
textImageH = int(imageH*1.5)
blank = Image.new("RGB", (textImageW, textImageH), "white")
d = ImageDraw.Draw(blank)
if imageW < 400:
    k = 32
elif imageW < 600:
    k = 48
elif imageW < 800:
    k = 64
elif imageW < 1000:
    k = 80
elif imageW < 1200:
    k = 100
elif imageW < 1400:
    k = 128
elif imageW < 1800:
    k = 156
elif imageW < 2200:
    k = 192
elif imageW < 2600:
    k = 256
elif imageW < 3100:
    k = 300
else:
    k = 300
Font = ImageFont.truetype(
    "/home/caesar/Repository/FaaS/SCF/Figure/Ubuntu-M.ttf", k, encoding="unic")
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
waterImage = Image.blend(im, textBlank, 0.2)
waterImage.show()
