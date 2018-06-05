# -*- coding=utf-8
from qcloud_cos import CosConfig
from qcloud_cos import CosS3Client
from qcloud_cos import CosServiceError
from qcloud_cos import CosClientError

import json
import sys
import logging

# logging.basicConfig(level=logging.INFO, stream=sys.stdout)

# 设置用户属性, 包括secret_id, secret_key, region
# appid已在配置中移除,请在参数Bucket中带上appid。Bucket由bucketname-appid组成
secret_id = 'AKIDpZDyBK6BpMj1DD8USJgO9kHeppeHwy45'  # 替换为用户的secret_id
secret_key = '1ymkYBmFWcXHzVuBIEzd7PabeWDjrtkP'  # 替换为用户的secret_key
region = 'ap-guangzhou'  # 替换为用户的region
token = ''  # 使用临时秘钥需要传入Token，默认为空,可不填


def get_filename_list(response):
    names = []
    contents = response['Contents']
    for c in contents:
        key = c['Key']
        names.append({'Key': key})
    return names


def empty_bucket(Bucket, Client):
    files = Client.list_objects(Bucket=Bucket)
    print("---------------------")
    print(files)
    print("---------------------")
    if 'Contents' not in files:
        return "EMPTY"
    while 'Contents' in files:
        del_objects = {
            "Quiet": "true",
            "Object": get_filename_list(files)
        }
        print("---------------------")
        print(del_objects)
        print("---------------------")
        response = Client.delete_objects(
            Bucket=Bucket,
            Delete=del_objects
        )
        files = Client.list_objects(Bucket=Bucket)
    return "FINISHED"


def main_handler(event, context):
    config = CosConfig(Region=region, Secret_id=secret_id, Secret_key=secret_key, Token=token)  # 获取配置对象
    client = CosS3Client(config)
    img_src = "imgps-1254095611"
    img_pro = "imgp-1254095611"

    response = {
        "src": empty_bucket(img_src, client),
        "pro": empty_bucket(img_pro, client)
    }
    return json.dumps(response)
