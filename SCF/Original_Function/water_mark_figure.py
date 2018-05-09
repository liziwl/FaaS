from PIL import Image, ImageDraw, ImageFont


def water_mark_fig(input_file_addr, water_mark_fig_addr, ratio):
    """
    Add figure water mark
    Parameters
    ----------
    input_file_addr: The address for input figure
    water_mark_fig_addr: The address for water mark
    ratio: The size of water mark (based on size of figure)

    Returns
    -------
    figure object

    """
    im = Image.open(input_file_addr)
    imageW, imageH = im.size
    water_mark = Image.open(water_mark_fig_addr)
    water_mark_w, water_mark_H = water_mark.size
    QRcode_size = min(imageW * ratio, imageH * ratio)

    Blank = Image.new("RGB", (imageW, imageH), "white")
    pasteBox = (int((imageW-water_mark_w)/2-1), int((imageH-water_mark_H)/2-1))
    Blank.paste(water_mark, pasteBox)
    waterImage = Image.blend(im, Blank, 0.2)
    return waterImage
