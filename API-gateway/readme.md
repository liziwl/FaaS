# API网关接入

## round_corners

![config](./pic/api_cogfig.png)
    
源码: [source](./round_corners_api.py)

### 注意事项
* CORS为跨域访问：有2个地方需要配置：对象存储，API网关
* 在Body中的特殊字符会urlencode或者Unicode编码。

## image_process

![config2](./pic/api_cogfigv2.png)

源码: [source](./v2)