# -*- coding: utf8 -*-
import uuid
import json
import os
import logging
import re
import commands
import datetime
import credential
import math
from image_processing import *
from qcloud_cos import CosClient
from qcloud_cos import DownloadFileRequest
from qcloud_cos import UploadFileRequest
from PIL import Image, ImageDraw, ImageFont


def round_image(input_path, output_path, rad):
    #op == 0
    image = round_corner(input_path, rad)
    image.save(output_path)
    print("-----{}-----".format(output_path))


def rotate_image(input_path, output_path, angle):
    #op == 1
    image = rotate(input_path, angle)
    image.save(output_path)
    print("-----{}-----".format(output_path))


def qrcode_image(input_path, output_path, text):
    #op == 2
    image = add_QRCode(input_path, text)
    image.save(output_path)
    print("-----{}-----".format(output_path))


def thumbnail_image(input_path, output_path, size):
    #op == 3
    image = thumbnail(input_path, size)
    image.save(output_path)
    print("-----{}-----".format(output_path))


def text_watermark_image(input_path, output_path, text, ttf_addr, ratio):
    #op == 4
    image = water_mark_text(input_path, ttf_addr, text, ratio)
    image.save(output_path)
    print("-----{}-----".format(output_path))


def img_watermark_image(input_path, output_path, patch_addr, ratio):
    #op == 5
    image = water_mark_fig(input_path, patch_addr)
    image.save(output_path)
    print("-----{}-----".format(output_path))


def convert_format_image(input_path, output_path, img_format):
    #op == 6
    """
    Convert image format
    img_format should be str
    img_format can be png, jpg, etc....
    For the detail see: https://pillow.readthedocs.io/en/3.1.x/handbook/image-file-formats.html
    """
    image = Image.open(input_path)
    image.save(output_path, img_format)
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
            itemsrc = os.path.join(src, item)
            delete_local_file(itemsrc)
        try:
            os.rmdir(src)
        except:
            pass


def real_handler(event, context):
    print('Loading function')
    print "event==={}===".format(event)
    print "context==={}===".format(context)
    if "requestContext" not in event.keys():
        logger.info("event is not come from api gateway")
        return json.dumps({"errorCode": 410, "errorMsg": "event is not come from api gateway"})
    print('Start parse json')
    jdat = json.loads(event['body'])  # load json string to python dict
    print(jdat)
    print('End parse json')
    return jdat


def download(file_bucket, filename_in_cos, file_local_path, cos_client):
    """download file from cos bucket

    Args:
        file_bucket (str): bucket name.
        filename_in_cos (str): file name in the bucket, which should be started with "/".
        file_local_path (str): local path in the unix path format, for example "/tmp/xxx.jpg".
        cos_client (object): cos client created by Tencent COS SDK

    Returns:
        int: 0 if successful, 1 is failed.

    Raises:
        Error: Make sure the object exists and your bucket is in the same region as this function.
    """
    print("Try get from [%s] to download file [%s]" %
          (file_bucket, filename_in_cos))
    try:
        request = DownloadFileRequest(
            file_bucket, filename_in_cos, file_local_path)
        download_file_ret = cos_client.download_file(request)
    except Exception as e:
        print(e)
        print('Error getting object {} from bucket {}. Make sure the object exists and your bucket is in the same region as this function.'.format(
            filename_in_cos, file_bucket))
        raise e
    if download_file_ret['code'] != 0:
        logger.info("Fail Download file [%s]" % filename_in_cos)
        return -1
    else:
        logger.info("SUC Download file [%s]" % filename_in_cos)
        return 0


def upload(file_bucket, filename_in_cos, file_local_path, cos_client):
    """upload file to cos bucket and it will replace the file with the same name.

    Args:
        file_bucket (str): bucket name.
        filename_in_cos (str): file name in the bucket, which should be started with "/".
        file_local_path (str): local path in the unix path format, for example "/tmp/xxx.jpg".
        cos_client (object): cos client created by Tencent COS SDK

    """
    request = UploadFileRequest(
        file_bucket, filename_in_cos, file_local_path, insert_only=0)
    upload_file_ret = cos_client.upload_file(request)
    logger.info("Upload image, return message: " + str(upload_file_ret))


print('Loading function')

appid = credential.appid
secret_id = credential.secret_id
secret_key = credential.secret_key
region = credential.region

cos_client = CosClient(appid, secret_id, secret_key, region)
logger = logging.getLogger()
file_name_p = re.compile(r'.+\.')

def main_handler(event, context):
    print(event)
    print(context)

    # Process json from input
    try:
        input_json = real_handler(event, context)
    except Exception as e:
        print(e)
        print("Error in processing input")
        raise e
    logger.info("start main handler")
    download_bucket = u'imgps'
    upload_bucket = u'imgp'
    file_local_path = "/temp/{}".format(input_json["file_name"])

    try:
        if(download(download_bucket, input_json["file_name"], file_local_path, cos_client) == -1):
            raise e
    except Exception as e:
        print(e)
        print("Error in downloading")
        raise e

    if op == 0:
        logger.info("Image round_corner function start")
        starttime = datetime.datetime.now()
        # round corner for image here
        # rad = event['queryStringParameters']['rad']
        rad = 0.15
        round_image(download_path, upload_path, rad)
    elif op == 1:
        logger.info("Image rotate function start")
        starttime = datetime.datetime.now()
        angle = 90
        rotate_image(download_path, upload_path, angle)
    elif op == 2:
        logger.info("Image add_QRCode function start")
        starttime = datetime.datetime.now()
        text = "www.sustc.edu.cn"
        qrcode_image(download_path, upload_path, text)
    elif op == 3:
        logger.info("Image thumbnail function start")
        starttime = datetime.datetime.now()
        size = (128, 128)
        thumbnail_image(download_path, upload_path, size)
    elif op == 4:
        logger.info("Image water_mark_text function start")
        starttime = datetime.datetime.now()
        text = " SUSTech "
        ratio = 0.2
        # download ttf
        try:
            ttf_bucket = u'stuff'
            ttf_name = input_json["op_par"]["mark_text"]["font_name"]
            ttf_path = '/tmp/{}'.format(ttf_name)
            print("font is " + ttf_name)  # file name in bucket
            if(download(ttf_bucket, ttf_name, ttf_path, cos_client) == -1):
                raise e
        except Exception as e:
            print(e)
            print("Error in downloading font")
            raise e
        text_watermark_image(download_path, upload_path, text, ttf_path, ratio)
    elif op == 5:
        logger.info("Image water_mark_img function start")
        starttime = datetime.datetime.now()
        ratio = 0.2
        # download patch
        try:
            patch_bucket = u'imgps'
            patch_name = input_json["op_par"]["mark_img"]["patch"]
            patch_path = '/tmp/{}'.format(patch_name)
            print("patch is " + patch_name)  # file name in bucket
            if(download(patch_bucket, patch_name, patch_path, cos_client) == -1):
                raise e
        except Exception as e:
            print(e)
            print("Error in downloading patch")
            raise e
        img_watermark_image(download_path, upload_path, patch_path, ratio)
    else:
        print("Error operation!")
        raise e

    endtime = datetime.datetime.now()
    logger.info("processing image take " + str((endtime - starttime).microseconds / 1000) + "ms")