from PIL import Image, ImageDraw, ImageFont

file_addr = "/home/caesar/Repository/FaaS/SCF/Figure/xiaoshi.png"
water_mark_addr = "/home/caesar/Repository/FaaS/SCF/Figure/logo.jpeg"
im = Image.open(file_addr)
imageW, imageH = im.size
water_mark = Image.open(water_mark_addr)
water_mark_w, water_mark_H = water_mark.size
QRcode_size = min(imageW/4, imageH/4)

Blank = Image.new("RGB", (imageW, imageH), "white")
pasteBox = (int((imageW-water_mark_w)/2-1), int((imageH-water_mark_H)/2-1))
Blank.paste(water_mark, pasteBox)
waterImage = Image.blend(im, Blank, 0.2)
waterImage.show()
