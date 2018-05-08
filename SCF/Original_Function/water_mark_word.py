from PIL import Image, ImageDraw, ImageFont


def add_num(img):
    draw = ImageDraw.Draw(img)
    width, height = img.size
    font_size = 40
    water_text = "666666"
    position = (width/2, height/2)
    font = ImageFont.truetype(font='/home/caesar/Repository/FaaS/SCF/Original_Function/OpenSans-Regular.ttf', size=font_size, encoding="unic")
    fillcolor = "#ff0000"
    draw.textsize('66666')
    draw.text(position, water_text, font=font, fill=fillcolor)
    img.save('result.jpg', 'jpeg')

    return 0


if __name__ == '__main__':
    image = Image.open('/home/caesar/Repository/FaaS/SCF/Figure/xiaoshi.png')
    add_num(image)
    image.show()
