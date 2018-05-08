# 实现步骤（草稿）

## 方案一

1. 获取签名，使用[签名算法](https://cloud.tencent.com/document/product/436/6054)
    
    * 需要考虑对象存储的`secret_id` 和 `secret_key ` 的安全性问题，解决方案？
    * 还没想好这个放在哪里。
2. [简单上传文件](https://cloud.tencent.com/document/api/436/6066) 
    
    这里限制到了20M，更大文件需要分片上传。这个是对象存储的API

3. 上传后API gatway调用SCF函数

## 方案二

[Web 端直传实践](https://cloud.tencent.com/document/product/436/9067)
[快速搭建移动应用传输服务](https://cloud.tencent.com/document/product/436/9068)