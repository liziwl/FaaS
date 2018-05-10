# -*- coding: utf-8 -*-
import uuid
import json
import os
import logging
import re
from PIL import Image, ImageDraw, ImageFont
import commands
import datetime
from qcloud_cos import CosClient
from qcloud_cos import DownloadFileRequest
from qcloud_cos import UploadFileRequest
import credential
import math
from image_processing import *


print('Loading function')

appid = credential.appid
secret_id = credential.secret_id
secret_key = credential.secret_key
region = credential.region

cos_client = CosClient(appid, secret_id, secret_key, region)
logger = logging.getLogger()
file_name_p = re.compile(r'.+\.')


#op == 0
def round_image(input_path, output_path, rad):
    image = round_corner(input_path, rad)
    image.save(output_path)
    print("-----{}-----".format(output_path))

#op == 1
def rotate_image(input_path, output_path, angle):
    image = rotate(input_path, angle)
    image.save(output_path)
    print("-----{}-----".format(output_path))

#op == 2
def qrcode_image(input_path, output_path, text):
    image = add_QRCode(input_path, text)
    image.save(output_path)
    print("-----{}-----".format(output_path))

#op == 3
def thumbnail_image(input_path, output_path, size):
    image = thumbnail(input_path, size)
    image.save(output_path)
    print("-----{}-----".format(output_path))


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
    if event["requestContext"]["path"] == "/image_process" and event["requestContext"]["httpMethod"] == "POST": 
        logger.info("start main handler")
        body = event['body']
        body = body.replace("\\u0026","&").split("&")
        c = dict()
        for item in body:
            if "path" in item:
                c["path"]="/"+item.split("=")[-1]
                continue
        op = int(event['queryStringParameters']['op'])
        print("op: ",op)
        try:
            download_bucket = u'imgps'
            upload_bucket = u'imgp'
            key = c['path']
            download_path = '/tmp/{}{}'.format(uuid.uuid4(), key.split('/')[-1])
            upload_name = '{}{}'.format(file_name_p.findall(key.split('/')[-1])[0], 'png')
            upload_path = '/tmp/processed-{}'.format(upload_name)
            print("Key is " + key) # file name in bucket
            print("Get from [%s] to download file [%s]" %(download_bucket, key))

            # download image from cos
            request = DownloadFileRequest(download_bucket, key, download_path)
            download_file_ret = cos_client.download_file(request)
            if download_file_ret['code'] == 0:
                logger.info("Download file [%s] Success" % key)
                if op == 0:
                    logger.info("Image round_corner function start")
                    starttime = datetime.datetime.now()
                    #round corner for image here
                    # rad = event['queryStringParameters']['rad']
                    rad = 0.15
                    round_image(download_path, upload_path, rad)
                    endtime = datetime.datetime.now()
                    logger.info("processing image take " + str((endtime-starttime).microseconds/1000) + "ms")
                elif op == 1:
                    logger.info("Image rotate function start")
                    starttime = datetime.datetime.now()
                    angle = 90
                    rotate_image(download_path, upload_path, angle)
                    endtime = datetime.datetime.now()
                    logger.info("processing image take " + str((endtime-starttime).microseconds/1000) + "ms")
                elif op == 2:
                    logger.info("Image add_QRCode function start")
                    starttime = datetime.datetime.now()
                    text = "www.sustc.edu.cn"
                    qrcode_image(download_path, upload_path, text)
                    endtime = datetime.datetime.now()
                    logger.info("processing image take " + str((endtime-starttime).microseconds/1000) + "ms")
                elif op == 3:
                    logger.info("Image thumbnail function start")
                    starttime = datetime.datetime.now()
                    size = (128, 128)
                    thumbnail_image(download_path, upload_path, size)
                    endtime = datetime.datetime.now()
                    logger.info("processing image take " + str((endtime-starttime).microseconds/1000) + "ms")
                #upload the processed image to resized bucket
                up_key = "/"+upload_name
                request = UploadFileRequest(upload_bucket, up_key.decode('utf-8'), upload_path.decode('utf-8'),insert_only=0)
                upload_file_ret = cos_client.upload_file(request)
                logger.info("upload image, return message: " + str(upload_file_ret))

                #delete local file
                delete_local_file(str(download_path))
                delete_local_file(str(upload_path))
                return json.dumps({"download_path":upload_name})
            else:
                logger.error("Download file [%s] Failed, err: %s" % (key, download_file_ret['message']))
                return -1
        except Exception as e:
            print(e)
            print('Error getting object {} from bucket {}. Make sure the object exists and your bucket is in the same region as this function.'.format(key, bucket))
            raise e