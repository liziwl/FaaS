// 请求用到的参数
var Bucket = 'imgps-1254095611';
var Region = 'ap-guangzhou';
var protocol = location.protocol === 'https:' ? 'https:' : 'http:';
var prefix = protocol + '//' + Bucket + '.cos.' + Region + '.myqcloud.com/';
var file;
// 计算签名
var getAuthorization = function (options, callback) {
    var method = (options.Method || 'get').toLowerCase();
    var key = options.Key || '';
    var url = 'http://111.230.168.122/server/sts-post-object.php' +
        '?method=' + method +
        '&pathname=' + encodeURIComponent('/') +
        '&key=' + encodeURIComponent(key);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function (e) {
        var data = JSON.parse(e.target.responseText);
        if (data.authorization === '') {

        }
        callback(null, {
            Authorization: data.authorization,
            XCosSecurityToken: data.sessionToken
        });
    };
    xhr.onerror = function (e) {
        callback('获取签名出错');
    };
    xhr.send();
};

var round_address;
var rotate_address;
var qrcode_address;
var shrink_address;
var watermark1_address;
var watermark2_address;

var uploadFile=function (file, callback) {
    var Key = file.name;
    getAuthorization({Method:'POST',Key:Key},function (err,info) {
        var auth = info.Authorization;
        var XCosSecurityToken=info.XCosSecurityToken;
        var fd=new FormData();
        fd.append('key',Key);
        fd.append('Signature',auth);
        XCosSecurityToken && fd.append('x-cos-security-token', XCosSecurityToken);
        fd.append('file',file);
        var url=prefix;
        var xhr=new XMLHttpRequest();
        xhr.open('POST',url,true);
        xhr.onload=function () {
            if(Math.floor(xhr.status/100)===2){
                var ETag=xhr.getResponseHeader('etag');
                callback(null,{url:url,ETag:ETag});
            }
            else
            {
                callback('File'+Key+'Upload Failed, status code:'+xhr.status);
            }
        };
        xhr.onerror=function () {
            callback('File'+Key+'Upload failed. Please check if CORS cross domain rules are not configured.')
        };
        xhr.send(fd);
    });
};
$(document).ready(function () {
    $('#fullpage').fullpage({
        sectionsColor: ['#f2f2f2', '#4BBFC3']
        //anchors:['firstPage', 'secondPage', 'thirdPage','fourthPage']
    });
    /*
    裁剪圆角
     */
    var round_status_code;
    var round_name;
    $('#round_upload').click(function () {
        file = document.getElementById('round_file').files[0];
        // //圆角input
        // var radius = document.getElementById('round_input').value;
        // if(!radius)
        // {
        //     alert(("Please input the radius!"));
        //     return;
        // }
        if (!file) {
            alert("Please choose a picture");
            // document.getElementById('slide1').innerText='Do not choose the upload file';
            return;
        }
        file && uploadFile(file, function (err, data) {
            console.log(err || data);
            uploadFile(file, callback());
            alert("function");
            alert('Upload Successfully');
            // document.getElementById('slide1').innerText=err?err:('Upload Successfully'+data.ETag);
        });
        $.ajax({
            type: 'POST', //访问方式
            url: 'http://service-mayhx21s-1254095611.ap-guangzhou.apigateway.myqcloud.com/prepub/image_process?op=0', //访问地址
            dataType: "json", //返回数据的格式 json text xml ...
            data: {
                "path": file.name,
            },
            success: function (response) {
                console.log("response");
                var message = JSON.parse(response);
                round_name = message.download_path;
                round_status_code = 200;
                round_address = "http://imgp-1254095611.cosgz.myqcloud.com/" + round_name+"?t="+Math.random();
                $("#round_preview").css("background-image", 'url(' + round_address + ')');
                alert("Finish Process");
            },
            error: function (error) {
                console.log("访问出现错误 ")
            }
        });
    });

    $('#round_download').click(function () {
        if (round_status_code === 200) {
            downloadURI(round_address, round_name);
            // address="'"+address+"'";
        }
        else {
            alert("The process do not finish yet.");
        }
    });

    /*
    rotate
     */
    var rotate_status_code;
    var rotate_name;
    $('#rotate_upload').click(function () {
        file = document.getElementById('rotate_file').files[0];
        // //圆角input
        // var percentage = document.getElementById('shrink_input').value;
        // if(!percentage || percentage<0 || percentage>1)
        // {
        //     alert(("Please input the percentage! Range[0,1]"));
        //     return;
        // }
        if (!file) {
            alert("Please choose a picture");
            // document.getElementById('slide1').innerText='Do not choose the upload file';
            return;
        }
        file && uploadFile(file, function (err, data) {
            console.log(err || data);
            uploadFile(file, callback());
            alert("function");
            alert('Upload Successfully');
            // document.getElementById('slide1').innerText=err?err:('Upload Successfully'+data.ETag);
        });
        $.ajax({
            type: 'POST', //访问方式
            url: 'http://service-mayhx21s-1254095611.ap-guangzhou.apigateway.myqcloud.com/prepub/image_process?op=1', //访问地址
            dataType: "json", //返回数据的格式 json text xml ...
            data: {
                "path": file.name,
            },
            success: function (response) {
                console.log("response");
                var message = JSON.parse(response);
                rotate_name = message.download_path;
                rotate_status_code = 200;
                rotate_address = "http://imgp-1254095611.cosgz.myqcloud.com/" + rotate_name+"?t="+Math.random();
                $("#rotate_preview").css("background-image", 'url(' + rotate_address + ')');
                alert("Finish Process");
            },
            error: function (error) {
                console.log("访问出现错误 ")
            }
        });
    });
    $('#rotate_download').click(function () {
        if (rotate_status_code === 200) {
            downloadURI(rotate_address, rotate_name);
            // address="'"+address+"'";
        }
        else {
            alert("The process do not finish yet.");
        }
    });

    /*
    QR_CODE
     */
    var qrcode_status_code;
    var qrcode_name;
    $('#qrcode_upload').click(function () {
        file = document.getElementById('qrcode_file').files[0];
        //圆角input
        // var percentage = document.getElementById('qrcode_input').value;
        // if(!percentage || percentage<0 || percentage>1)
        // {
        //     alert(("Please input the percentage! Range[0,1]"));
        //     return;
        // }
        if (!file) {
            alert("Please choose a picture");
            // document.getElementById('slide1').innerText='Do not choose the upload file';
            return;
        }
        file && uploadFile(file, function (err, data) {
            console.log(err || data);
            uploadFile(file, callback());
            alert("function");
            alert('Upload Successfully');
            // document.getElementById('slide1').innerText=err?err:('Upload Successfully'+data.ETag);
        });

        $.ajax({
            type: 'POST', //访问方式
            url: 'http://service-mayhx21s-1254095611.ap-guangzhou.apigateway.myqcloud.com/prepub/image_process?op=2', //访问地址
            dataType: "json", //返回数据的格式 json text xml ...
            data: {
                "path": file.name,
            },
            success: function (response) {
                console.log("response");
                var message = JSON.parse(response);
                qrcode_name = message.download_path;
                qrcode_status_code = 200;
                qrcode_address = "http://imgp-1254095611.cosgz.myqcloud.com/" + qrcode_name+"?t="+Math.random();
                $("#qrcode_preview").css("background-image", 'url(' + qrcode_address + ')');
                alert("Finish Process");
            },
            error: function (error) {
                console.log("访问出现错误 ")
            }
        });
    });
    $('#qrcode_download').click(function () {
        if (qrcode_status_code === 200) {
            downloadURI(qrcode_address, qrcode_name);
            // address="'"+address+"'";
        }
        else {
            alert("The process do not finish yet.");
        }
    });

    /*
    shrink
     */
    var shrink_status_code;
    var shrink_name;
    $('#shrink_upload').click(function () {
        file = document.getElementById('shrink_file').files[0];
        // //圆角input
        // var percentage = document.getElementById('shrink_input').value;
        // if(!percentage || percentage<0 || percentage>1)
        // {
        //     alert(("Please input the percentage! Range[0,1]"));
        //     return;
        // }
        if (!file) {
            alert("Please choose a picture");
            // document.getElementById('slide1').innerText='Do not choose the upload file';
            return;
        }
        file && uploadFile(file, function (err, data) {
            console.log(err || data);
            uploadFile(file, callback());
            alert("function");
            alert('Upload Successfully');
            // document.getElementById('slide1').innerText=err?err:('Upload Successfully'+data.ETag);
        });
        $.ajax({
            type: 'POST', //访问方式
            url: 'http://service-mayhx21s-1254095611.ap-guangzhou.apigateway.myqcloud.com/prepub/image_process?op=3', //访问地址
            dataType: "json", //返回数据的格式 json text xml ...
            data: {
                "path": file.name,
            },
            success: function (response) {
                console.log("response");
                var message = JSON.parse(response);
                shrink_name = message.download_path;
                shrink_status_code = 200;
                shrink_address = "http://imgp-1254095611.cosgz.myqcloud.com/" + shrink_name+"?t="+Math.random();
                $("#shrink_preview").css("background-image", 'url(' + shrink_address + ')');
                alert("Finish Process");
            },
            error: function (error) {
                console.log("访问出现错误 ")
            }
        });

    });
    $('#shrink_download').click(function () {
        if (shrink_status_code === 200) {
            downloadURI(shrink_address, shrink_name);
            // address="'"+address+"'";
        }
        else {
            alert("The process do not finish yet.");
        }
    });

    /*
    watermark1_character
  */
    var watermark1_status_code;
    var watermark1_name;
    $('#watermark1_upload').click(function () {
        file = document.getElementById('watermark1_file').files[0];
        // //圆角input
        // var percentage = document.getElementById('shrink_input').value;
        // if(!percentage || percentage<0 || percentage>1)
        // {
        //     alert(("Please input the percentage! Range[0,1]"));
        //     return;
        // }
        if (!file) {
            alert("Please choose a picture");
            // document.getElementById('slide1').innerText='Do not choose the upload file';
            return;
        }
        file && uploadFile(file, function (err, data) {
            console.log(err || data);
            uploadFile(file, callback());
            alert("function");
            alert('Upload Successfully');
            // document.getElementById('slide1').innerText=err?err:('Upload Successfully'+data.ETag);
        });
        $.ajax({
            type: 'POST', //访问方式
            url: 'http://service-mayhx21s-1254095611.ap-guangzhou.apigateway.myqcloud.com/prepub/image_process?op=4', //访问地址
            dataType: "json", //返回数据的格式 json text xml ...
            data: {
                "path": file.name,
            },
            success: function (response) {
                console.log("response");
                var message = JSON.parse(response);
                watermark1_name = message.download_path;
                watermark1_status_code = 200;
                watermark1_address = "http://imgp-1254095611.cosgz.myqcloud.com/" + watermark1_name+"?t="+Math.random();
                $("#watermark1_preview").css("background-image", 'url(' + watermark1_address + ')');
                alert("Finish Process");
            },
            error: function (error) {
                console.log("访问出现错误 ")
            }
        });
    });
    $('#watermark1_download').click(function () {
        if (watermark1_status_code === 200) {
            downloadURI(watermark1_address, watermark1_name);
            // address="'"+address+"'";
        }
        else {
            alert("The process do not finish yet.");
        }
    });


    /*
    watermark_picture
     */
    var watermark2_status_code;
    var watermark2_name;
    $('#watermark2_upload').click(function () {
        file = document.getElementById('watermark2_file').files[0];
        // //圆角input
        // var percentage = document.getElementById('shrink_input').value;
        // if(!percentage || percentage<0 || percentage>1)
        // {
        //     alert(("Please input the percentage! Range[0,1]"));
        //     return;
        // }
        if (!file) {
            alert("Please choose a picture");
            // document.getElementById('slide1').innerText='Do not choose the upload file';
            return;
        }
        file && uploadFile(file, function (err, data) {
            console.log(err || data);
            uploadFile(file, callback());
            alert("function");
            alert('Upload Successfully');
            // document.getElementById('slide1').innerText=err?err:('Upload Successfully'+data.ETag);
        });
        $.ajax({
            type: 'POST', //访问方式
            url: 'http://service-mayhx21s-1254095611.ap-guangzhou.apigateway.myqcloud.com/prepub/image_process?op=5', //访问地址
            dataType: "json", //返回数据的格式 json text xml ...
            data: {
                "path": file.name,
            },
            success: function (response) {
                console.log("response");
                var message = JSON.parse(response);
                watermark2_name = message.download_path;
                watermark2_status_code = 200;
                watermark2_address = "http://imgp-1254095611.cosgz.myqcloud.com/" + watermark2_name;
                $("#watermark2_preview").css("background-image", 'url(' + watermark2_address + ')');
                alert("Finish Process");
            },
            error: function (error) {
                console.log("访问出现错误 ")
            }
        });
    });
    $('#watermark2_download').click(function () {
        if (watermark2_status_code === 200) {
            downloadURI(watermark2_address, watermark2_name);
            // address="'"+address+"'";
        }
        else {
            alert("The process do not finish yet.");
        }
    });
});

function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
}


