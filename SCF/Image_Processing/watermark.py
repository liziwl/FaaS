# -*- coding: utf-8 -*-
import uuid
import json
import os
import logging
import re
from PIL import Image
from PIL import ImageDraw
from PIL import ImageFront
import PIL.Image
import commands
import datetime
from qcloud_cos import CosClient
from qcloud_cos import DownloadFileRequest
from qcloud_cos import UploadFileRequest
import credential

print('Loading function')

appid = credential.appid
secret_id = credential.secret_id
secret_key = credential.secret_key
region = credential.region

cos_client = CosClient(appid, secret_id, secret_key, region)
logger = logging.getLogger()
file_name_p = re.compile(r'.+\.')


def watermark_image_with_text(image_path, text, color, fontfamily):
    with Image.open(image_path).convert('RGBA') as image:
	    imageWatermark = Image.new('RGBA', image.size, (255, 255, 255, 0))

	    draw = ImageDraw.Draw(imageWatermark)
	    
	    width, height = image.size
	    margin = 10
	    font = ImageFont.truetype(fontfamily, int(height / 20))
	    textWidth, textHeight = draw.textsize(text, font)
	    x = width - textWidth - margin
	    y = height - textHeight - margin

	    draw.text((x, y), text, color, font)

    return Image.alpha_composite(image, imageWatermark)

def watermark_with_text(src):


def delete_local_file(src):
    logger.info("delete files and folders")
    if os.path.isfile(src):
        try:  
            os.remove(src)  
        except:  
            pass 
    elif os.path.isdir(src):  
        for item in os.listdir(src):  
            itemsrc=os.path.join(src,item)  
            delete_local_file(itemsrc)  
        try:  
            os.rmdir(src)  
        except:  
            pass     

def main_handler(event, context):
    logger.info("start main handler")
    for record in event['Records']:
        try:
            bucket = record['cos']['cosBucket']['name']
            key = record['cos']['cosObject']['key']
            key = key.replace('/' + str(appid) + '/' + bucket, '')
            download_path = '/tmp/{}{}'.format(uuid.uuid4(), key.split('/')[-1])
            upload_name = '{}{}'.format(file_name_p.findall(key.split('/')[-1])[0], 'png')
            upload_path = '/tmp/rounded-{}'.format(upload_name)
            print("Key is " + key) # file name in bucket
            print("Get from [%s] to download file [%s]" %(bucket, key))

            # download image from cos
            request = DownloadFileRequest(bucket, key, download_path)
            download_file_ret = cos_client.download_file(request)
            if download_file_ret['code'] == 0:
                # TODO parameters
                args = []
                logger.info("Download file [%s] Success" % key)
                logger.info("Image processing function start")
                starttime = datetime.datetime.now()

                #process image here
                watermark_with_text(download_path, upload_path, args)
                endtime = datetime.datetime.now()
                logger.info("processing image takes " + str((endtime-starttime).microseconds/1000) + "ms")

                #upload the processed image to output bucket
                u_key = '{}{}'.format(file_name_p.findall(key)[0], 'png')
                request = UploadFileRequest(u'%sresized' % bucket, u_key.decode('utf-8'), upload_path.decode('utf-8'))
                upload_file_ret = cos_client.upload_file(request)
                logger.info("upload image, return message: " + str(upload_file_ret))

                #delete local file
                delete_local_file(str(download_path))
                delete_local_file(str(upload_path))
            else:
                logger.error("Download file [%s] Failed, err: %s" % (key, download_file_ret['message']))
                return -1
        except Exception as e:
            print(e)
            print('Error getting object {} from bucket {}. Make sure the object exists and your bucket is in the same region as this function.'.format(key, bucket))
            raise e