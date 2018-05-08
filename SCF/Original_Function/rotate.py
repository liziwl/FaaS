from PIL import Image, ImageFont, ImageDraw
import math

angle = 30
file_addr = "/home/caesar/Repository/FaaS/SCF/Figure/xiaoshi.png"
im = Image.open(file_addr)
out = im.rotate(angle)
# out.show()
