# -*- coding: utf-8 -*-
import uuid
import json
import os
import logging
import re
from PIL import Image
from PIL import ImageDraw
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

def add_corners(src_image, r):
    circle = Image.new('L', (r * 2, r * 2), 0)
    draw = ImageDraw.Draw(circle)
    draw.ellipse((0, 0, r * 2, r * 2), fill=255)
    alpha = Image.new('L', src_image.size, "white")
    w, h = src_image.size
    alpha.paste(circle.crop((0, 0, r, r)), (0, 0))
    alpha.paste(circle.crop((0, r, r, r * 2)), (0, h - r))
    alpha.paste(circle.crop((r, 0, r * 2, r)), (w - r, 0))
    alpha.paste(circle.crop((r, r, r * 2, r * 2)), (w - r, h - r))
    src_image.putalpha(alpha)
    logger.info("Process successfully")
    return src_image
    
def round_image(image_path, rounded_path, rad):
    with Image.open(image_path) as image:
        image = add_corners(image, rad)
        image.save(rounded_path)
        print("-----{}-----".format(rounded_path))

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
    print(event)
    print(context)
    if "requestContext" not in event.keys():
        logger.info("event is not come from api gateway")
        return json.dumps({"errorCode":410,"errorMsg":"event is not come from api gateway"})
    if event["requestContext"]["path"] == "/round" and event["requestContext"]["httpMethod"] == "POST": 
        logger.info("start main handler")
        record = event['pathParameters']
        print(event['body'])
        body = event['body']
        body = body.replace("\\u0026","&").split("&")
        c = dict()
        for item in body:
            if "path" in item:
                c["path"]="/"+item.split("=")[-1]
                continue
            if "rad" in item:
                c["rad"]=int(item.split("=")[-1])
                continue
        try:
            bucket = 'imgps'
            key = c['path']
            download_path = '/tmp/{}{}'.format(uuid.uuid4(), key.split('/')[-1])
            upload_name = '{}{}'.format(file_name_p.findall(key.split('/')[-1])[0], 'png')
            upload_path = '/tmp/rounded-{}'.format(upload_name)
            print("Key is " + key) # file name in bucket
            print("Get from [%s] to download file [%s]" %(bucket, key))

            # download image from cos
            request = DownloadFileRequest(bucket, key, download_path)
            download_file_ret = cos_client.download_file(request)
            if download_file_ret['code'] == 0:
                rad = c['rad']
                logger.info("Download file [%s] Success" % key)
                logger.info("Image compress function start")
                starttime = datetime.datetime.now()

                #compress image here
                round_image(download_path, upload_path, rad)
                endtime = datetime.datetime.now()
                logger.info("compress image take " + str((endtime-starttime).microseconds/1000) + "ms")

                #upload the compressed image to resized bucket
                u_key = '{}{}'.format(file_name_p.findall(key)[0], 'png')
                request = UploadFileRequest(u'imgp', u_key.decode('utf-8'), upload_path.decode('utf-8'),insert_only=0)
                # 0 mean overwrite
                print("key: ",u_key)
                upload_file_ret = cos_client.upload_file(request)
                logger.info("upload image, return message: " + str(upload_file_ret))

                #delete local file
                delete_local_file(str(download_path))
                delete_local_file(str(upload_path))
                return json.dumps({"download_path":u_key})
            else:
                logger.error("Download file [%s] Failed, err: %s" % (key, download_file_ret['message']))
                return -1
        except Exception as e:
            print(e)
            print('Error getting object {} from bucket {}. Make sure the object exists and your bucket is in the same region as this function.'.format(key, bucket))
            raise e