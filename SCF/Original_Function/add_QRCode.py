import qrcode
from PIL import Image, ImageFont, ImageDraw

im = Image.open('/home/caesar/Repository/FaaS/SCF/Figure/xiaoshi.png')
imageW, imageH = im.size
QRcode_size = min(imageW/4, imageH/4)

QRcode_text = "http://sustc.edu.cn/"
QRcode_size = (QRcode_size, QRcode_size)
QRcode = qrcode.make(QRcode_text)
QRcode = QRcode.resize(QRcode_size, Image.ANTIALIAS)
QRcodeW, QRcodeH = QRcode.size

im.paste(QRcode, (imageW - QRcodeW, imageH - QRcodeH))
im.show()
