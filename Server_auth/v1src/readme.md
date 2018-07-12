# COS临时密钥授权服务器配置

## COS桶配置

* 上传地址

  ```
  http://imgps-1254095611.cosgz.myqcloud.com/{}
  // 括号内为文件名
  ```

* 下载地址
  ```
  http://imgp-1254095611.cosgz.myqcloud.com/{}.png
  // 括号内为上传文件名除去后缀部分
  ```

## SDK

使用[tencentyun/cos-js-sdk-v5](https://github.com/tencentyun/cos-js-sdk-v5)

## 后端配置

* Apache, php
  
  直接将html文件夹放入Apache文件夹下（`/var/www/`），配置`./html/server/sts-post-object.php`里面的腾讯云密钥和COS桶名称。
