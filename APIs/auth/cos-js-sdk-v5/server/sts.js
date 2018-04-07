var http = require('http');
var crypto = require('crypto');
var request = require('request');

// 固定分配给CSG的密钥
var config = {
    Url: 'https://sts.api.qcloud.com/v2/index.php',
    Domain: 'sts.api.qcloud.com',
    SecretId: 'AKIDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    SecretKey: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    Bucket: 'test-1250000000', // 这里指定 bucket
};

// 缓存缓存临时密钥
var tempKeysCache = {
    policyStr: '',
    expiredTime: 0
};

var util = {
    // 获取随机数
    getRandom: function (min, max) {
        return Math.round(Math.random() * (max - min) + min);
    },
    // json 转 query string
    json2str: function (obj, notEncode) {
        var arr = [];
        Object.keys(obj).sort().forEach(function (item) {
            var val = obj[item] || '';
            !notEncode && (val = val);
            arr.push(item + '=' + val);
        });
        return arr.join('&');
    },
    // 计算签名
    getSignature: function (opt, key, method) {
        var formatString = method + config.Domain + '/v2/index.php?' + util.json2str(opt, 1);
        var hmac = crypto.createHmac('sha1', key);
        var sign = hmac.update(new Buffer(formatString, 'utf8')).digest('base64');
        return sign;
    },
};

// 拼接获取临时密钥的参数
var getTempKeys = function (key, callback) {

    var ShortBucketName = config.Bucket.substr(0 , config.Bucket.lastIndexOf('-'));
    var AppId = config.Bucket.substr(1 + config.Bucket.lastIndexOf('-'));
    var policy = {
        'version': '2.0',
        'statement': [{
            'action': [
                // 这里可以从临时密钥的权限上控制前端允许的操作
                // 'name/cos:*', // 这样写可以包含下面所有权限

                // // 列出所有允许的操作
                // // ACL 读写
                // 'name/cos:GetBucketACL',
                // 'name/cos:PutBucketACL',
                // 'name/cos:GetObjectACL',
                // 'name/cos:PutObjectACL',
                // // 简单 Bucket 操作
                // 'name/cos:PutBucket',
                // 'name/cos:HeadBucket',
                // 'name/cos:GetBucket',
                // 'name/cos:DeleteBucket',
                // 'name/cos:GetBucketLocation',
                // // Versioning
                // 'name/cos:PutBucketVersioning',
                // 'name/cos:GetBucketVersioning',
                // // CORS
                // 'name/cos:PutBucketCORS',
                // 'name/cos:GetBucketCORS',
                // 'name/cos:DeleteBucketCORS',
                // // Lifecycle
                // 'name/cos:PutBucketLifecycle',
                // 'name/cos:GetBucketLifecycle',
                // 'name/cos:DeleteBucketLifecycle',
                // // Replication
                // 'name/cos:PutBucketReplication',
                // 'name/cos:GetBucketReplication',
                // 'name/cos:DeleteBucketReplication',
                // // 删除文件
                // 'name/cos:DeleteMultipleObject',
                // 'name/cos:DeleteObject',
                // 简单文件操作
                'name/cos:PutObject',
                'name/cos:AppendObject',
                'name/cos:GetObject',
                'name/cos:HeadObject',
                'name/cos:OptionsObject',
                'name/cos:PutObjectCopy',
                'name/cos:PostObjectRestore',
                // 分片上传操作
                'name/cos:InitiateMultipartUpload',
                'name/cos:ListMultipartUploads',
                'name/cos:ListParts',
                'name/cos:UploadPart',
                'name/cos:CompleteMultipartUpload',
                'name/cos:AbortMultipartUpload',
            ],
            'effect': 'allow',
            'principal': {'qcs': ['*']},
            'resource': [
                'qcs::cos:ap-guangzhou:uid/' + AppId + ':prefix//' + AppId + '/' + ShortBucketName,
                'qcs::cos:ap-guangzhou:uid/' + AppId + ':prefix//' + AppId + '/' + ShortBucketName + '/*'
            ]
        }]
    };
    var policyStr = JSON.stringify(policy);

    // 有效时间小于 30 秒就重新获取临时密钥，否则使用缓存的临时密钥
    if (tempKeysCache.expiredTime - Date.now() / 1000 > 30 && tempKeysCache.policyStr === policyStr) {
        callback(null, tempKeysCache);
        return;
    }

    var Action = 'GetFederationToken';
    var Nonce = util.getRandom(10000, 20000);
    var Timestamp = parseInt(+new Date() / 1000);
    var Method = 'GET';

    var params = {
        Action: Action,
        Nonce: Nonce,
        Region: '',
        SecretId: config.SecretId,
        Timestamp: Timestamp,
        durationSeconds: 7200,
        name: '',
        policy: policyStr,
    };
    params.Signature = encodeURIComponent(util.getSignature(params, config.SecretKey, Method));

    var opt = {
        method: Method,
        url: config.Url + '?' + util.json2str(params),
        rejectUnauthorized: false,
        headers: {
            Host: config.Domain
        }
    };
    request(opt, function (err, response, body) {
        body = body && JSON.parse(body);
        var data = body.data;
        tempKeysCache = data;
        tempKeysCache.policyStr = policyStr;
        callback(err, data);
    });
};

function camSafeUrlEncode(str) {
    return encodeURIComponent(str)
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\*/g, '%2A');
}

function isActionAllow(method, pathname, query, headers) {

    var allow = true;

    // // TODO 这里判断自己网站的登录态
    // if (!logined) {
    //     allow = false;
    //     return allow;
    // }

    // 请求可能带有点所有 action
    // acl,cors,policy,location,tagging,lifecycle,versioning,replication,versions,delete,restore,uploads

    // 请求跟路径，只允许获取 UploadId
    if (pathname === '/' && !(method === 'get' && query['uploads'])) {
        allow = false;
    }

    // 不允许前端获取和修改文件权限
    if (pathname !== '/' && query['acl']) {
        allow = false;
    }

    // 这里应该根据需要，限制当前站点的用户只允许操作什么样的路径
    if (method === 'delete' && pathname !== '/') { // 这里控制是否允许删除文件
        // TODO 这里控制是否允许删除文件
    }
    if (method === 'put' && pathname !== '/') { // 这里控制是否允许上传和修改文件
        // TODO 这里控制是否允许上传和修改文件
    }
    if (method === 'get' && pathname !== '/') { // 这里控制是否获取文件和文件相关信息
        // TODO 这里控制是否允许获取文件和文件相关信息
    }

    return allow;

}

function getAuthorization (keys, method, pathname, query, headers) {

    var SecretId = keys.credentials.tmpSecretId;
    var SecretKey = keys.credentials.tmpSecretKey;

    // 整理参数
    !query && (query = {});
    !headers && (headers = {});
    method = (method ? method : 'get').toLowerCase();
    pathname = pathname ? pathname : '/';
    pathname.indexOf('/') === -1 && (pathname = '/' + pathname);

    // 注意这里要过滤好允许什么样的操作
    if (!isActionAllow(method, pathname, query, headers)) {
        return 'action deny';
    }

    // 工具方法
    var getObjectKeys = function (obj) {
        var list = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                list.push(key);
            }
        }
        return list.sort();
    };

    var obj2str = function (obj) {
        var i, key, val;
        var list = [];
        var keyList = getObjectKeys(obj);
        for (i = 0; i < keyList.length; i++) {
            key = keyList[i];
            val = obj[key] || '';
            key = key.toLowerCase();
            list.push(camSafeUrlEncode(key) + '=' + camSafeUrlEncode(val));
        }
        return list.join('&');
    };

    // 签名有效起止时间
    var now = parseInt(new Date().getTime() / 1000) - 1;
    var expired = now + 600; // 签名过期时刻，600 秒后

    // 要用到的 Authorization 参数列表
    var qSignAlgorithm = 'sha1';
    var qAk = SecretId;
    var qSignTime = now + ';' + expired;
    var qKeyTime = now + ';' + expired;
    var qHeaderList = getObjectKeys(headers).join(';').toLowerCase();
    var qUrlParamList = getObjectKeys(query).join(';').toLowerCase();

    // 签名算法说明文档：https://www.qcloud.com/document/product/436/7778
    // 步骤一：计算 SignKey
    var signKey = crypto.createHmac('sha1', SecretKey).update(qKeyTime).digest('hex');

    // 步骤二：构成 FormatString
    var formatString = [method.toLowerCase(), pathname, obj2str(query), obj2str(headers), ''].join('\n');

    // 步骤三：计算 StringToSign
    var stringToSign = ['sha1', qSignTime, crypto.createHash('sha1').update(formatString).digest('hex'), ''].join('\n');

    // 步骤四：计算 Signature
    var qSignature = crypto.createHmac('sha1', signKey).update(stringToSign).digest('hex');

    // 步骤五：构造 Authorization
    var authorization  = [
        'q-sign-algorithm=' + qSignAlgorithm,
        'q-ak=' + qAk,
        'q-sign-time=' + qSignTime,
        'q-key-time=' + qKeyTime,
        'q-header-list=' + qHeaderList,
        'q-url-param-list=' + qUrlParamList,
        'q-signature=' + qSignature
    ].join('&');

    return authorization;
}

function getBody(req, callback) {
    var body = [];
    req.on('data', function (chunk) {
        body.push(chunk);
    });
    req.on('end', function () {
        try {
            body = Buffer.concat(body).toString();
            body && console.log(body);
            body = JSON.parse(body);
        } catch (e) {
            body = {};
        }
        callback(body);
    });
}


// 启动简单的签名服务
http.createServer(function(req, res){
    if (req.url.indexOf('/sts') === 0) {
        // 获取前端过来的参数
        getBody(req, function (body) {

            // 获取临时密钥，计算签名
            getTempKeys(body.key, function (err, tempKeys) {
                var data = {
                    authorization: getAuthorization(tempKeys, body.method, body.pathname, body.query, body.headers),
                    sessionToken: tempKeys['credentials'] && tempKeys['credentials']['sessionToken'],
                };
                if (data.authorization === 'action deny') {
                    data = {error: 'action deny'};
                }

                // 返回数据给前端
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'http://127.0.0.1',
                    'Access-Control-Allow-Headers': 'origin,accept,content-type',
                });
                res.write(JSON.stringify(data) || '');
                res.end();
            });
        });
    } else {
        res.writeHead(404);
        res.write('404 Not Found');
        res.end();
    }
}).listen(3000);
console.log('app is listening at http://127.0.0.1:3000');
