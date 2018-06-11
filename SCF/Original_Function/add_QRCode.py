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


if __name__ == "__main__":
    add_QRCode("/home/caesar/Desktop/1.jpg", "sustc.edu.cn", position=(15, 15), fixed=1).show()
