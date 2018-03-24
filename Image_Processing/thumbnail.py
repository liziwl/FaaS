# -*- coding: utf-8 -*-
# 示例程序
import uuid
import json
import os
import logging
from PIL import Image
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

def resize_image(image_path, resized_path):
    with Image.open(image_path) as image:
        image.thumbnail(tuple(x / 2 for x in image.size))
        image.save(resized_path)

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
            upload_path = '/tmp/resized-{}'.format(key.split('/')[-1])
            print("Key is " + key)
            print("Get from [%s] to download file [%s]" %(bucket, key))

            # download image from cos
            request = DownloadFileRequest(bucket, key, download_path)
            download_file_ret = cos_client.download_file(request)
            if download_file_ret['code'] == 0:
                logger.info("Download file [%s] Success" % key)
                logger.info("Image compress function start")
                starttime = datetime.datetime.now()

                #compress image here
                resize_image(download_path, upload_path)
                endtime = datetime.datetime.now()
                logger.info("compress image take " + str((endtime-starttime).microseconds/1000) + "ms")

                #upload the compressed image to resized bucket
                request = UploadFileRequest(u'%sresized' % bucket, key.decode('utf-8'), upload_path.decode('utf-8'))
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