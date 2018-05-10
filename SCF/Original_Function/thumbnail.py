from PIL import Image, ImageFont, ImageDraw


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
    thumbnail("/home/caesar/Repository/FaaS/SCF/Figure/xiaoshi.png").show()
