from PIL import Image, ImageDraw, ImageFont


def water_mark_fig(input_file_addr, water_mark_fig_addr, ratio, position, fixed):
    """
    Add figure water mark

    When fixed = 0, position have five value:
    1 -> Upper Left
    2 -> Upper Right
    3 -> Center
    4 -> Bottom Left
    5 -> Bottom Right

    When fixed = 1, position = (width, height)

    Parameters
    ----------
    input_file_addr: The address for input figure
    water_mark_fig_addr: The address for water mark
    ratio: How clear the water mark is
    position: When fixed = 0, the position of QR Code (5 for default). When fixed = 1, the position is the pixel point in the original graph (width, height).
    fixed: 0 for using relative position, 1 for using fixed pixel position. (default = 0)

    Returns
    -------
    figure object

    """
    image = Image.open(input_file_addr)
    imageW, imageH = image.size
    water_mark = Image.open(water_mark_fig_addr)
    water_mark_w, water_mark_H = water_mark.size

    water_mark_w, water_mark_H = water_mark.size
    if(fixed == 0):
        if(position == 1):
            pasteBox = (0, 0)
        elif(position == 2):
            pasteBox = (int(imageW - water_mark_w), 0)
        elif(position == 3):
            pasteBox = (int((imageW - water_mark_w) / 2 - 1),
                        int((imageH - water_mark_H) / 2 - 1))
        elif(position == 4):
            pasteBox = (0, imageH - water_mark_H)
        else:
            pasteBox = (imageW - water_mark_w, imageH - water_mark_H)
    else:
        pastedW = min(imageW, position[0])
        pastedH = min(imageH, position[1])
        pasteBox = (pastedW, pastedH)

    Blank = Image.new("RGB", (imageW, imageH), "white")
    Blank.paste(water_mark, pasteBox)
    waterImage = Image.blend(image, Blank, ratio)
    return waterImage


if __name__ == "__main__":
    water_mark_fig("/home/caesar/Repository/FaaS/SCF/Figure/xiaoshi.png",
                   "/home/caesar/Repository/FaaS/SCF/Figure/logo.jpeg", 0.2, (100, 100), 1).show()
