# FaaS

快速上手使用，[用 FaaS 实现比优图更灵活的大量图片快速加工能力](https://cloud.tencent.com/developer/article/1011234)的文字版

> 基于Centos

## 准备腾讯云 API 调用工具
安装 Python 和 PIP
Python 环境是腾讯云命令行工具运行时的必要环境。腾讯云的 CentOS 镜像已经包含 Python 的发行版本，可以用下面的命令查看：
```
python --version
```
下面，我们需要安装 Python 的包管理工具 PIP：
```
yum install python-pip -y
```
安装腾讯云 API 命令行工具

命令行工具已经发布到 PIP 中，可以直接用 PIP 进行安装：
```
pip install qcloudcli
```
命令行工具同时提供了一个自动补全的功能，使用下面的命令进行启用：
```
complete -C "$(which qcloud_completer)" qcloudcli
```

## 创建函数目录
我们第一个 SCF 叫做 hello-scf，下面我们创建一个目录来存放它：
```
mkdir -p /data/hello
```
编写 Hello SCF 的内容

创建 hello.py，内容如下：
> hello.py
```python
print('Start Hello World function')
def main_handler(event, context):
    print("value1 = " + event['key1'])
    print("value2 = " + event['key2'])
    return event['key1']  #return the value of key "key1"
```
## 部署 Hello SCF
使用 CreateFunction API 来创建并部署一个 SCF：
 ```
qcloudcli scf CreateFunction \
--functionName "hello" \
--code "@$(cd /data/hello && zip -r - * | base64)" \
--handler "hello.main_handler" \
--description "My first scf"
```
部署成功后，会有 `Success` 的返回，我们也可以使用 ListFunctions
 来查询自己账号下面有哪些 SCF：
```
qcloudcli scf ListFunctions
```

## 用 SCF 处理缩略图生成任务
准备 COS 仓库
我们需要准备两个 COS 仓库，一个用于保存上传的图片，一个用于保存生成的缩略图，COS 提供了一定的免费额度超出额度将产生小额费用。

这个操作需要到 COS 的控制台完成，步骤如下：
1. 点击 创建 `Bucket`，使用下面的配置：
> 名称：填写 `img`
>
> 地域：选择 `华南`
>
> 点击 `返回`，再次点击 `创建 Bucket`，使用下面的配置：
>
> 名称：填写 `imgresized`
>
> 地域：选择 `华南`

2. 准备好 COS 仓库后，请点击下一步。
安装 SCF 任务需要的运行时库, 使用 yum 安装下面的库：
```
yum install python-devel gcc libjpeg-devel zlib-devel python-virtualenv -y
```
安装完成后，可进入下一步。
创建 SCF 工作目录
```
mkdir -p /data/thumbnail
```
编写 Thumbnail SCF 的内容
创建 credential.py，内容请参考：
> credential.py
```python
# -*- coding: utf-8 -*-

# 此处的 API 信息请替换为您的信息，可到 https://console.cloud.tencent.com/capi 获取
appid = 1250000000              # 请替换为您的 APPID
secret_id = u'YOUR_SECRET_ID'   # 请替换为您的 SecretId
secret_key = u'YOUR_SECRET_KEY' # 请替换为您的 SecretKey
region = u'gz'
```
注意替换 credential.py 中的 API 凭据为您的 API 凭据，可到控制台查看。

创建 thumbnail.py，内容如下：
> thumbnail.py
```python
# -*- coding: utf-8 -*-
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
            delete_file_folder(itemsrc)  
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
```

完成后，可进入下一步。

## 准备 Thumbnail SCF 部署环境
创建并使用一个虚拟环境：
```
virtualenv ~/shrink_venv
source ~/shrink_venv/bin/activate
```
在虚拟环境下安装 Pillow 和 COS SDK：
```
pip install Pillow qcloud_cos_v4
```
完成后，进入下一步。

## 准备 Thumbnail SCF 部署包
把虚拟环境中的 lib 和 lib64 相关内容添加到压缩包：
```
cd $VIRTUAL_ENV/lib/python2.7/site-packages
zip -r /data/thumbnail.zip *
cd $VIRTUAL_ENV/lib64/python2.7/site-packages
zip -r /data/thumbnail.zip *
```
把 Thumbnail SCF 源码添加到压缩包：
```
cd /data/thumbnail
zip -r /data/thumbnail.zip *
```

## 部署 Thumbnail SCF
>由于 Thumbnail SCF 的部署包太大，无法使用命令行部署。我们把准备好的部署包下载到本地通过控制台进行部署。
>
>在 `thumbnail.zip` 上右击，点击保存到本地。
>
>打开 SCF 控制台
>
>点击 新建，创建一个 SCF
>
>函数名填写 `thumbnail`，点击 下一步
>
>代码输入种类选择 本地上传 `zip` 包
>
>执行方法填写为 `thumbnail.main_handler`
>
>函数代码包选择刚才保存到本地的 `thumbnail.zip`，点击 下一步
>
>触发器先不配置，点击 完成
>
>部署完成后，请点击下一步。

## 测试 Thumbnail SCF
> 进入 COS 控制台，打开之前创建的 img bucket，上传一张本地的照片到根目录，如 photo.png。
>
> 进入 SCF 控制台，打开 thumbnail 函数，点击右上角的测试按钮。
>
> 选择 COS 事件模板进行修改。注意要改动的部分是 `cosBucket` 和 `cosObject`，包括：
>
> `cosBucket.name` 需要修改为上面创建的 `img`
>
> `cosBucket.appid` 需要修改为您的 `AppId` 
>
> `cosObject.key` 需要修改为您上传的图片的名称（如上面的 /photo.png）
>
> 修改完成后，点击 测试 查看函数运行日志。
>
> 进入 `COS 控制台`，打开之前创建的 `imgresized` bucket，查看缩略图是否已经生成。

## 配置 Thumbnail SCF 触发器
> 进入 `SCF 控制台`，打开 `thumbnail` 函数，点击 `触发方式` 选项卡。
>
> 点击 `添加触发方式`
>
> 选择 `COS 触发`
>
> `COS Bucket` 选择 `img`
>
> 时间类型选择 `文件上传`
>
> 点击保存
> 
> 完成后，进入 COS 控制台，再上传一张图片到 img bucket，观察 SCF 是否自动运行，并在 imgresized bucekt 观察是否已经生成了缩略图。
