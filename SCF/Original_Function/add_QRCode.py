import qrcode
from PIL import Image, ImageFont, ImageDraw


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


if __name__ == "__main__":
    add_QRCode("/home/caesar/Repository/FaaS/SCF/Figure/xiaoshi.png",
               "sustc.edu.cn", position=5).show()
