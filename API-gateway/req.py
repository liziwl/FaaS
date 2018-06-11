# -*- coding: utf8 -*-
import uuid
import json
import os
import logging
import re
import commands
import datetime
from qcloud_cos import CosClient
from qcloud_cos import DownloadFileRequest
from qcloud_cos import UploadFileRequest

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
    print("Try get from [%s] to download file [%s]" % (file_bucket, filename_in_cos))
    try:
        request = DownloadFileRequest(file_bucket, filename_in_cos, file_local_path)
        download_file_ret = cos_client.download_file(request)
    except Exception as e:
        print(e)
        print('Error getting object {} from bucket {}. Make sure the object exists and your bucket is in the same region as this function.'.format(filename_in_cos, file_bucket))
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
    request = UploadFileRequest(file_bucket, filename_in_cos, file_local_path,insert_only=0)
    upload_file_ret = cos_client.upload_file(request)
    logger.info("Upload image, return message: " + str(upload_file_ret))

