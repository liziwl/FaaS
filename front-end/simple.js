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
var data_json= {
    "file_name": "foo.jpg",
    "op": 2,
    "op_par": {
        "qr_content": {
            "content": "FaaS",
            "position": 3,
            "fixed": 0
        },
        "round_corner": {
            "radius": 10,
            "fixed": 0
        },
        "thumb_size": {
            "height": 123,
            "width": 123
        },
        "mark_text": {
            "content": "FaaS",
            "font_name": "font.ttf",
            "size_ratio": 0.2,
            "rotate_angle": 30,
            "clear_ratio": 0.2,
            "position": 3,
            "fixed": 0
        },
        "mark_img": {
            "patch": "mark.jpg",
            "clear_ratio": 0.2,
            "position": 3,
            "fixed": 0
        },
        "slice": {
            "num": 5,
            "direction": 1
        },
        "rotate": {
            "angle": 30
        },
        "convert_format": {
            "postfix": "png"
        }
    }
}

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
        //圆角input
        // var radius = document.getElementById('round_input').value;
        // var round_fix=document.getElementById('round_fix').value;
        // if(!radius) {
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
        });
        data_json.op_par.round_corner.radius=10;//just for test
        data_json.op=0;
        data_json.file_name=file.name;
        $.ajax({
            type: 'POST', //访问方式
            url: 'http://service-mayhx21s-1254095611.ap-guangzhou.apigateway.myqcloud.com/test/img_pro', //访问地址
            contentType: "application/json;charset=utf-8;",
            dataType: "json", //返回数据的格式 json text xml ...
            data: data_json,
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
                console.log(url);
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
        //角度input
        var percentage = document.getElementById('rotate_input').value;
        if(!percentage || percentage<0 || percentage>360)
        {
            alert(("Please input the percentage! Range[0,360]"));
            return;
        }
        data_json.op_par.rotate.angle=percentage;
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
        data_json.op=1;
        data_json.file_name=file.name;
        $.ajax({
            type: 'POST', //访问方式
            url: 'http://service-mayhx21s-1254095611.ap-guangzhou.apigateway.myqcloud.com/test/img-pro', //访问地址
            contentType: "application/json;charset=utf-8;",
            dataType: "json", //返回数据的格式 json text xml ...
            data: data_json,
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
        //qrinput
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
        var qr_content = document.getElementById('qrcode_input').value;
        if(!percentage)
        {
            alert("Please input the qr content");
            return;
        }
        data_json.op_par.qr_content.content=qr_content;
        var qr_fix = document.getElementById('qrcode_fix').value;
        var qr_position={
            width:0,
            height:0,
            type:0
        }
        if(qr_fix==0)
        {
            qr_position.type=document.getElementById('qr_position_type').value;
        }
        else if(qr_fix==1)
        {
            qr_position.height=document.getElementById('qr_position_height').value;
            qr_position.width=document.getElementById('qr_position_width').value;
        }
        data_json.op=2;
        data_json.file_name=file.name;
        data_json.op_par.qr_content.fixed=qr_fix;
        data_json.op_par.qr_content.position.height=qr_position.height;
        data_json.op_par.qr_content.position.width=qr_position.width;
        data_json.op_par.qr_content.position.type=qr_position.type;
        $.ajax({
            type: 'POST', //访问方式
            url: 'http://service-mayhx21s-1254095611.ap-guangzhou.apigateway.myqcloud.com/test/img_pro', //访问地址
            contentType: "application/json;charset=utf-8;",
            dataType: "json", //返回数据的格式 json text xml ...
            data: data_json,
            success: function (response) {
                console.log("response");
                var message = JSON.parse(response);
                qrcode_name = message.download_path;
                qrcode_status_code = 200;
                qrcode_address = "http://imgp-1254095611.cosgz.myqcloud.com/" + qrcode_name+"?t="+Math.random();
                $("#qrcode_preview").css("background-image", 'url(' + qrcode_address + ')');

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
        var shrink_height=document.getElementById('thumbnail_height').value;
        var shrink_width=document.getElementById('thumbnail_width').value;
        data_json.op=3;
        data_json.file_name=file.name;
        data_json.op_par.thumbnaill.size.height=shrink_height;
        data_json.op_par.thumbnaill.size.width=shrink_width;
        $.ajax({
            type: 'POST', //访问方式
            url: 'http://service-mayhx21s-1254095611.ap-guangzhou.apigateway.myqcloud.com/test/img_pro', //访问地址
            contentType: "application/json;charset=utf-8;",
            dataType: "json", //返回数据的格式 json text xml ...
            data: data_json,
            success: function (response) {
                console.log("response");
                var message = JSON.parse(response);
                console.log(message);
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
        data_json.op=4;
        data_json.file_name=file.name;
        data_json.op_par.mark_text.content=document.getElementById('mark_text_content').value;
        data_json.op_par.mark_text.font_name=document.getElementById('mark_text_fontname').value;
        data_json.op_par.mark_text.size_ratio=document.getElementById('mark_text_size').value;
        data_json.op_par.mark_text.rotate_angle=document.getElementById('mark_text_angle').value;
        data_json.op_par.mark_text.clear_ratio=document.getElementById('mark_text_ratio').value;
        data_json.op_par.mark_text.fixed=document.getElementById('mark_text_fixed').value;
        if(document.getElementById('mark_text_fixed').value==0)
        {
            data_json.op_par.mark_text.position.type=document.getElementById('mark_text_type').value;
        }
        else
        {
            data_json.op_par.mark_text.position.width=document.getElementById('mark_text_width').value;
            data_json.op_par.mark_text.position.height=document.getElementById('mark_text_height').value;
        }
        $.ajax({
            type: 'POST', //访问方式
            url: 'http://service-mayhx21s-1254095611.ap-guangzhou.apigateway.myqcloud.com/test/img_pro', //访问地址
            dataType: "json", //返回数据的格式 json text xml ...
            contentType: "application/json;charset=utf-8;",
            data: data_json,
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
        data_json.op=5;
        data_json.file_name=file.name;
        data_json.op_par.mark_img.clear_ratio=document.getElementById()
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


