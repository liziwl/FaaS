from PIL import Image, ImageDraw, ImageFont
import math


def slice(input_file_addr, slice_number, direction):
    """
    Slice the image to many pieces

    Parameters
    ----------
    input_file_addr: The address of original image
    slice_number: The number of pieces wanted
    direction: 1 for slice vertical, 0 for slice horizontal

    Returns
    -------
    Image array that contain all the image after slice. In order.
    If slice vertically, the array sort from up to down
    If slice horizontally, the array sort from left to right

    """
    image = Image.open(input_file_addr)
    imageW, imageH = image.size
    sliced_image = []
    if direction == 1:
        # Slice Vertically
        upper = 0
        left = 0
        right = imageW
        lower = 0
        every_slice_height = math.floor(imageH / slice_number)
        for i in range(slice_number):
            upper = lower
            if i == slice_number - 1:
                lower = imageH
            else:
                lower = (i + 1) * every_slice_height
            box = (left, upper, right, lower)
            sliced_image.append(image.crop(box))
    elif direction == 0:
        # Slice Horizontally
        upper = 0
        left = 0
        right = 0
        lower = imageH
        every_slice_weight = math.floor(imageW / slice_number)
        for i in range(slice_number):
            left = right
            if i == slice_number - 1:
                right = imageW
            else:
                right = (i + 1) * every_slice_weight
            box = (left, upper, right, lower)
            sliced_image.append(image.crop(box))
    else:
        print("Error direction")

    return sliced_image


if __name__ == "__main__":
    sliced = slice("/home/caesar/Desktop/1.jpg", 10, 0)
    for s in sliced:
        s.show()
