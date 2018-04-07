<?php
// 临时密钥计算样例
session_start();

// 固定密钥
$config = array(
    'Url' => 'https://sts.api.qcloud.com/v2/index.php',
    'Domain' => 'sts.api.qcloud.com',
    'SecretId' => 'AKIDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'SecretKey' => 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'Bucket' => 'test-1250000000',
);

// 缓存缓存临时密钥
//if (!isset($_SESSION['tempKeysCache'])) {
    $_SESSION['tempKeysCache'] = array(
        'policyStr' => '',
        'expiredTime' => 0
    );
//}

// json 转 query string
function json2str($obj, $notEncode = false) {
    ksort($obj);
    $arr = array();
    foreach ($obj as $key => $val) {
        !$notEncode && ($val = urlencode($val));
        array_push($arr, $key . '=' . $val);
    }
    return join('&', $arr);
}

// 计算临时密钥用的签名
function getSignature($opt, $key, $method) {
    global $config;
    $formatString = $method . $config['Domain'] . '/v2/index.php?' . json2str($opt, 1);
    $sign = hash_hmac('sha1', $formatString, $key);
    $sign = base64_encode(hex2bin($sign));
    return $sign;
}

// 获取临时密钥
function getTempKeys() {

    global $config;

    $ShortBucketName = substr($config['Bucket'],0, strripos($config['Bucket'], '-'));
    $AppId = substr($config['Bucket'], 1 + strripos($config['Bucket'], '-'));
    $policy = array(
        'version'=> '2.0',
        'statement'=> array(
            array(
                'action'=> array(
                    // 这里可以从临时密钥的权限上控制前端允许的操作
                     'name/cos:*', // 这样写可以包含下面所有权限

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
                ),
                'effect'=> 'allow',
                'principal'=> array('qcs'=> array('*')),
                'resource'=> array(
                    'qcs::cos:ap-guangzhou:uid/' . $AppId . ':prefix//' . $AppId . '/' . $ShortBucketName . '/',
                    'qcs::cos:ap-guangzhou:uid/' . $AppId . ':prefix//' . $AppId . '/' . $ShortBucketName . '/*'
                )
            )
        )
    );
    $policyStr = str_replace('\\/', '/', json_encode($policy));

    // 有效时间小于 30 秒就重新获取临时密钥，否则使用缓存的临时密钥
    if ($_SESSION['tempKeysCache']['expiredTime'] - time() > 30 && $_SESSION['tempKeysCache']['policyStr'] === $policyStr) {
        return $_SESSION['tempKeysCache'];
    }

    $Action = 'GetFederationToken';
    $Nonce = rand(10000, 20000);
    $Timestamp = time() - 1;
    $Method = 'GET';

    $params = array(
        'Action'=> $Action,
        'Nonce'=> $Nonce,
        'Region'=> '',
        'SecretId'=> $config['SecretId'],
        'Timestamp'=> $Timestamp,
        'durationSeconds'=> 7200,
        'name'=> '',
        'policy'=> $policyStr
    );
    $params['Signature'] = urlencode(getSignature($params, $config['SecretKey'], $Method));

    $url = $config['Url'] . '?' . json2str($params, 1);
    $ch = curl_init($url);
    // curl_setopt($ch, CURLOPT_PROXY, '');
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch,CURLOPT_SSL_VERIFYPEER,0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $result = curl_exec($ch);
    if(curl_errno($ch)) $result = curl_error($ch);
    curl_close($ch);

    $result = json_decode($result, 1);
    $_SESSION['tempKeysCache'] = $result['data'];
    $_SESSION['tempKeysCache']['policyStr'] = $policyStr;

    return $result['data'];
};

// 判断允许的操作
function isActionAllow($method, $pathname, $query, $headers)
{

    $allow = true;

    // // TODO 这里判断自己网站的登录态
    // if ($!logined) {
    //     $allow = false;
    //     return $allow;
    // }

    // 请求可能带有点所有 action
    // acl,cors,policy,location,tagging,lifecycle,versioning,replication,versions,delete,restore,uploads

    // 请求跟路径，只允许获取 UploadId
    if ($pathname === '/' && !($method === 'get' && isset($query['uploads']))) {
        $allow = false;
    }

    // 不允许前端获取和修改文件权限
    if ($pathname !== '/' && isset($query['acl'])) {
        $allow = false;
    }

    // 这里应该根据需要，限制当前站点的用户只允许操作什么样的路径
    if ($method === 'delete' && $pathname !== '/') { // 这里控制是否允许删除文件
        // TODO 这里控制是否允许删除文件
    }
    if ($method === 'put' && $pathname !== '/') { // 这里控制是否允许上传和修改文件
        // TODO 这里控制是否允许上传和修改文件
    }
    if ($method === 'get' && $pathname !== '/') { // 这里控制是否获取文件和文件相关信息
        // TODO 这里控制是否允许获取文件和文件相关信息
    }

    return $allow;

}

// 计算 COS API 请求用的签名
function getAuthorization($keys, $method, $pathname, $query, $headers)
{
    // 获取个人 API 密钥 https://console.qcloud.com/capi
    $SecretId = $keys['credentials']['tmpSecretId'];
    $SecretKey = $keys['credentials']['tmpSecretKey'];

    // 整理参数
    !$query && ($query = array());
    !$headers && ($headers = array());
    $method = strtolower($method ? $method : 'get');
    $pathname = $pathname ? $pathname : '/';
    substr($pathname, 0, 1) != '/' && ($pathname = '/' . $pathname);

    // 注意这里要过滤好允许什么样的操作
    if (!isActionAllow($method, $pathname, $query, $headers)) {
        return 'action deny';
    }

    // 工具方法
    function getObjectKeys($obj)
    {
        $list = array_keys($obj);
        sort($list);
        return $list;
    }

    function obj2str($obj)
    {
        $list = array();
        $keyList = getObjectKeys($obj);
        $len = count($keyList);
        for ($i = 0; $i < $len; $i++) {
            $key = $keyList[$i];
            $val = isset($obj[$key]) ? $obj[$key] : '';
            $key = strtolower($key);
            $list[] = rawurlencode($key) . '=' . rawurlencode($val);
        }
        return implode('&', $list);
    }

    // 签名有效起止时间
    $now = time() - 1;
    $expired = $now + 600; // 签名过期时刻，600 秒后

    // 要用到的 Authorization 参数列表
    $qSignAlgorithm = 'sha1';
    $qAk = $SecretId;
    $qSignTime = $now . ';' . $expired;
    $qKeyTime = $now . ';' . $expired;
    $qHeaderList = strtolower(implode(';', getObjectKeys($headers)));
    $qUrlParamList = strtolower(implode(';', getObjectKeys($query)));

    // 签名算法说明文档：https://www.qcloud.com/document/product/436/7778
    // 步骤一：计算 SignKey
    $signKey = hash_hmac("sha1", $qKeyTime, $SecretKey);

    // 步骤二：构成 FormatString
    $formatString = implode("\n", array(strtolower($method), $pathname, obj2str($query), obj2str($headers), ''));

    // 步骤三：计算 StringToSign
    $stringToSign = implode("\n", array('sha1', $qSignTime, sha1($formatString), ''));

    // 步骤四：计算 Signature
    $qSignature = hash_hmac('sha1', $stringToSign, $signKey);

    // 步骤五：构造 Authorization
    $authorization = implode('&', array(
        'q-sign-algorithm=' . $qSignAlgorithm,
        'q-ak=' . $qAk,
        'q-sign-time=' . $qSignTime,
        'q-key-time=' . $qKeyTime,
        'q-header-list=' . $qHeaderList,
        'q-url-param-list=' . $qUrlParamList,
        'q-signature=' . $qSignature
    ));

    return $authorization;
}


// 获取前端过来的参数
$params = json_decode(file_get_contents("php://input"), 1);
$pathname = isset($params['pathname']) ? $params['pathname'] : '/';
$method = isset($params['method']) ? $params['method'] : 'get';
$query = isset($params['query']) ? $params['query'] : array();
$headers = isset($params['headers']) ? $params['headers'] : array();

// 获取临时密钥，计算签名
$tempKeys = getTempKeys();
$data = array(
    'authorization' => getAuthorization($tempKeys, $method, $pathname, $query, $headers),
    'sessionToken' => $tempKeys['credentials']['sessionToken'],
);
if ($data['authorization'] === 'action deny') {
    $data = array('error'=> 'action deny');
}

// 返回数据给前端
header('Content-Type: application/json');
header('Allow-Control-Allow-Origin: http://127.0.0.1'); // 这里修改允许跨域访问的网站
header('Allow-Control-Allow-Headers: origin,accept,content-type');
echo json_encode($data);
