// 请求用到的参数
var Bucket = 'imgps-1254095611';
var Region = 'ap-guangzhou';
var protocol = location.protocol === 'https:' ? 'https:' : 'http:';
var prefix = protocol + '//' + Bucket + '.cos.' + Region + '.myqcloud.com/';
var file;
var water_file;
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
var convert_address;
var slice_address;
var slice_number;
var data_json=
    {
        "file_name": "foo.jpg",
        "op": 2,
        "op_par": {
            "qr_content": {
                "content": "FaaS",
                "position": {
                    "width": 123,
                    "height": 123,
                    "type": 1
                },
                "fixed": 0
            },
            "round_corner": {
                "radius": 10,
                "fixed": 0
            },
            "thumbnaill": {
                "size":{
                    "width": 123,
                    "height": 123
                }
            },
            "mark_text": {
                "content": "FaaS",
                "font_name": "font.ttf",
                "size_ratio": 0.2,
                "rotate_angle": 30,
                "clear_ratio": 0.2,
                "position": {
                    "width": 123,
                    "height": 123,
                    "type": 1
                },
                "fixed": 0
            },
            "mark_img": {
                "patch": "mark.jpg",
                "clear_ratio": 0.2,
                "position": {
                    "width": 123,
                    "height": 123,
                    "type": 1
                },
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
    };


var uploadFile=function (file) {
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
        var radius = document.getElementById('round_radius').value;
        var myselect=document.getElementById('round_fixed');
        var index=myselect.selectedIndex;
        var round_fix=parseInt(myselect.options[index].value);
        if(index==0) {
            radius=parseFloat(radius);
        }
        else
        {
            radius=parseInt(radius);
        }


        if (!file) {
            alert("Please choose a picture");
            // document.getElementById('slide1').innerText='Do not choose the upload file';
            return;
        }

        file && uploadFile(file, function (err, data) {
            console.log(err || data);
            uploadFile(file);
        });
        data_json.op_par.round_corner.radius=radius;
        data_json.op=0;
        data_json.op_par.round_corner.fixed=round_fix;
        data_json.file_name=file.name;
        var data=JSON.stringify(data_json);
        console.log(data_json);
        $.ajax({
            type: 'POST', //访问方式
            url: 'http://service-mayhx21s-1254095611.ap-guangzhou.apigateway.myqcloud.com/release/img-pro', //访问地址
            contentType: "application/json;charset=utf-8",
            dataType: "json", //返回数据的格式 json text xml ...
            data: data,
            success: function (response) {
                console.log(data);
                var message = JSON.parse(response);
                console.log("response");
                if(message.file_cnt==1){
                    round_name = message.data[1];
                }
                round_status_code = 200;
                round_address = "http://imgp-1254095611.cosgz.myqcloud.com/" + round_name+"?t="+Math.random();
                console.log(round_address);
                $("#round_preview").css("background-image", 'url(' + round_address + ')');
            },
            error: function () {
                console.log("访问出现错误 ");
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
        var percentage = document.getElementById('rotate_angle').value;
        if(!percentage || percentage<0 || percentage>360)
        {
            alert(("Please input the percentage! Range[0,360]"));
            return;
        }
        data_json.op_par.rotate.angle=parseInt(percentage);
        if (!file) {
            alert("Please choose a picture");
            // document.getElementById('slide1').innerText='Do not choose the upload file';
            return;
        }
        file && uploadFile(file, function (err, data) {
            console.log(err || data);
            uploadFile(file);
            // document.getElementById('slide1').innerText=err?err:('Upload Successfully'+data.ETag);
        });
        data_json.op=1;
        data_json.file_name=file.name;
        console.log(data_json);
        var data=JSON.stringify(data_json);
        $.ajax({
            type: 'POST', //访问方式
            url: 'http://service-mayhx21s-1254095611.ap-guangzhou.apigateway.myqcloud.com/release/img-pro', //访问地址
            contentType: "application/json;charset=utf-8",
            dataType: "json", //返回数据的格式 json text xml ...
            data: data,
            success: function (response) {
                console.log("response");
                var message = JSON.parse(response);
                if(message.file_cnt==1){
                    rotate_name = message.data[1];
                }
                rotate_status_code = 200;
                rotate_address = "http://imgp-1254095611.cosgz.myqcloud.com/" + rotate_name+"?t="+Math.random();
                $("#rotate_preview").css("background-image", 'url(' + rotate_address + ')');
            },
            error: function (error) {
                console.log("访问出现错误 ");
                console.log(data_json);
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
            uploadFile(file);
            alert("function");
            alert('Upload Successfully');
            // document.getElementById('slide1').innerText=err?err:('Upload Successfully'+data.ETag);
        });
        var qr_content = document.getElementById('qrcode_content').value;
        if(!qr_content)
        {
            alert("Please input the qr content");
            return;
        }
        data_json.op_par.qr_content.content=qr_content;
        var qr_fix_select = document.getElementById('qrcode_fixed');
        var qr_fix_index = qr_fix_select.selectedIndex;
        var qr_fix=parseInt(qr_fix_select.options[qr_fix_index].value);
        var qr_position={
            width:0,
            height:0,
            type:0
        }
        if(qr_fix==0)
        {
            var qr_type_select= document.getElementById('qrcode_position');
            var qr_type_index = qr_type_select.selectedIndex;
            qr_position.type=parseInt(qr_type_select.options[qr_type_index].value);
        }
        else if(qr_fix==1)
        {
            qr_position.height=parseInt(document.getElementById('qrcode_height').value);
            qr_position.width=parseInt(document.getElementById('qrcode_width').value);
        }
        data_json.op=2;
        data_json.file_name=file.name;
        data_json.op_par.qr_content.fixed=qr_fix;
        data_json.op_par.qr_content.position.height=qr_position.height;
        data_json.op_par.qr_content.position.width=qr_position.width;
        data_json.op_par.qr_content.position.type=qr_position.type;
        console.log(data_json);
        var data=JSON.stringify(data_json);
        $.ajax({
            type: 'POST', //访问方式
            url: 'http://service-mayhx21s-1254095611.ap-guangzhou.apigateway.myqcloud.com/release/img-pro', //访问地址
            contentType: "application/json;charset=utf-8;",
            dataType: "json", //返回数据的格式 json text xml ...
            data: data,
            success: function (response) {
                console.log("response");
                var message = JSON.parse(response);
                if(message.file_cnt==1){
                    qrcode_name = message.data[1];
                }
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
            uploadFile(file);
            alert("function");
            alert('Upload Successfully');
            // document.getElementById('slide1').innerText=err?err:('Upload Successfully'+data.ETag);
        });
        var shrink_height=document.getElementById('shrink_height').value;
        var shrink_width=document.getElementById('shrink_width').value;
        data_json.op=3;
        data_json.file_name=file.name;
        data_json.op_par.thumbnaill.size.height=parseInt(shrink_height);
        data_json.op_par.thumbnaill.size.width=parseInt(shrink_width);
        console.log(data_json);
        var data=JSON.stringify(data_json);
        $.ajax({
            type: 'POST', //访问方式
            url: 'http://service-mayhx21s-1254095611.ap-guangzhou.apigateway.myqcloud.com/release/img-pro', //访问地址
            contentType: "application/json;charset=utf-8",
            dataType: "json", //返回数据的格式 json text xml ...
            data: data,
            success: function (response) {
                console.log("response");
                var message = JSON.parse(response);
                console.log(message);
                if(message.file_cnt==1){
                    shrink_name = message.data[1];
                }
                shrink_status_code = 200;
                shrink_address = "http://imgp-1254095611.cosgz.myqcloud.com/" + shrink_name+"?t="+Math.random();
                $("#shrink_preview").css("background-image", 'url(' + shrink_address + ')');
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
            uploadFile(file);
            alert("function");
            alert('Upload Successfully');
            // document.getElementById('slide1').innerText=err?err:('Upload Successfully'+data.ETag);
        });
        data_json.op=4;
        data_json.file_name=file.name;
        data_json.op_par.mark_text.content=document.getElementById('watermark1_content').value;
        var mark1_font_select=document.getElementById('watermark1_font');
        var mark1_font_index=mark1_font_select.selectedIndex;
        data_json.op_par.mark_text.font_name=mark1_font_select.options[mark1_font_index].value;
        data_json.op_par.mark_text.size_ratio=parseInt(document.getElementById('watermark1_size').value)/100;
        data_json.op_par.mark_text.rotate_angle=parseFloat(document.getElementById('watermark1_angle').value);
        data_json.op_par.mark_text.clear_ratio=parseFloat(document.getElementById('watermark1_opacity').value);
        data_json.op_par.mark_text.position.fixed=parseInt(document.getElementById('watermark1_fixed').value);
        if(data_json.op_par.mark_text.position.fixed==0)
        {
            var mark1_type_select=document.getElementById('watermark1_position');
            var mark1_type_index=mark1_type_select.selectedIndex;
            console.log("fix=0");
            console.log(mark1_type_index);
            data_json.op_par.mark_text.position.type=parseInt(mark1_type_select.options[mark1_type_index].value);
        }
        else
        {
            data_json.op_par.mark_text.position.width=parseInt(document.getElementById('watermark1_width').value);
            data_json.op_par.mark_text.position.height=parseInt(document.getElementById('watermark1_height').value);
        }
        console.log(data_json);
        var data=JSON.stringify(data_json);
        $.ajax({
            type: 'POST', //访问方式
            url: 'http://service-mayhx21s-1254095611.ap-guangzhou.apigateway.myqcloud.com/release/img-pro', //访问地址
            dataType: "json", //返回数据的格式 json text xml ...
            contentType: "application/json;charset=utf-8",
            data: data,
            success: function (response) {
                console.log("response");
                var message = JSON.parse(response);
                if(message.file_cnt==1){
                    watermark1_name = message.data[1];
                }
                watermark1_status_code = 200;
                watermark1_address = "http://imgp-1254095611.cosgz.myqcloud.com/" + watermark1_name+"?t="+Math.random();
                $("#watermark1_preview").css("background-image", 'url(' + watermark1_address + ')');
            },
            error: function (error) {
                console.log("访问出现错误 ");
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
        water_file=document.getElementById('watermark2_content').files[0];
        if (!file) {
            alert("Please choose a picture");
            // document.getElementById('slide1').innerText='Do not choose the upload file';
            return;
        }
        if (!water_file) {
            alert("Please choose a picture as the watermark");
            // document.getElementById('slide1').innerText='Do not choose the upload file';
            return;
        }

        file && uploadFile(file, function (err, data) {
            console.log(err || data);
            uploadFile(file);
            // document.getElementById('slide1').innerText=err?err:('Upload Successfully'+data.ETag);
        });
        water_file&&uploadFile(water_file,function () {
            uploadFile(water_file);
        });
        data_json.op=5;
        data_json.file_name=file.name;
        data_json.op_par.mark_img.clear_ratio=parseInt(document.getElementById('watermark2_opacity').value)/100;
        var watermark2_select=document.getElementById('watermark2_fixed');
        var watermark2_index=watermark2_select.selectedIndex;
        data_json.op_par.mark_img.fixed=watermark2_select.options[watermark2_index].value;
        if(document.getElementById('watermark2_fixed').value==1)
        {
            data_json.op_par.mark_img.position.width=document.getElementById('watermark2_width').value;
            data_json.op_par.mark_img.position.height=document.getElementById('watermark2_height').value;
        }
        else
        {
            data_json.op_par.mark_img.position.type=document.getElementById('watermark2_position').value;
        }
        var data=JSON.stringify(data_json);
        $.ajax({
            type: 'POST', //访问方式
            url: 'http://service-mayhx21s-1254095611.ap-guangzhou.apigateway.myqcloud.com/release/img-pro', //访问地址
            dataType: "json", //返回数据的格式 json text xml ...
            contentType: "application/json;charset=utf-8",
            data: data,
            success: function (response) {
                console.log("response");
                var message = JSON.parse(response);
                if(message.file_cnt==1){
                    watermark2_name = message.data[1];
                }
                watermark2_status_code = 200;
                watermark2_address = "http://imgp-1254095611.cosgz.myqcloud.com/" + watermark2_name+"?t="+Math.random();
                $("#watermark2_preview").css("background-image", 'url(' + watermark2_address + ')');
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


    /*
    convert format
     */
    var convert_status_code;
    var convert_name;
    $('#convert_format_upload').click(function () {
        file=document.getElementById('convert_file').files[0];
        if(!file){
            alert("Please choose a picture");
            return;
        }
        file&&uploadFile(file,function () {
            uploadFile(file);

        });
        data_json.op=6;
        data_json.file_name=file.name;
        data_json.op_par.convert_format.postfix=document.getElementById('convert_postfix').value;
        var data=JSON.stringify(data_json);
        $.ajax({
            type: 'POST', //访问方式
            url: 'http://service-mayhx21s-1254095611.ap-guangzhou.apigateway.myqcloud.com/release/img-pro', //访问地址
            dataType: "json", //返回数据的格式 json text xml ...
            contentType: "application/json;charset=utf-8",
            data: data,
            success: function (response) {
                console.log("response");
                var message = JSON.parse(response);
                if(message.file_cnt==1){
                    convert_name = message.data[1];
                }
                convert_status_code = 200;
                convert_address = "http://imgp-1254095611.cosgz.myqcloud.com/" + convert_name+"?t="+Math.random();
                $("#convert_preview").css("background-image", 'url(' + convert_address + ')');
            },
            error: function (error) {
                console.log("访问出现错误 ")
            }
        });
    });
    $('#convert_download').click(function () {
        if(convert_status_code==200){
            downloadURI(convert_address,convert_name);
        }
        else {
            alert("The process do not finish yet.");
        }
    });


    /*
    slice
     */
    var slice_status_code;
    var slice_name;
    $('#slice_upload').click(function () {
        file=document.getElementById('slice_file').files[0];
        if(!file){
            alert("Please choose a picture");
            return;
        }
        file&&uploadFile(file,function () {
            uploadFile(file);

        });
        data_json.op=7;
        data_json.file_name=file.name;
        data_json.op_par.slice.num=document.getElementById('slice_num').value;
        data_json.op_par.slice.direction=document.getElementById('slice_direction').value;
        var data=JSON.stringify(data_json);
        $.ajax({
            type: 'POST', //访问方式
            url: 'http://service-mayhx21s-1254095611.ap-guangzhou.apigateway.myqcloud.com/release/img-pro', //访问地址
            dataType: "json", //返回数据的格式 json text xml ...
            contentType: "application/json;charset=utf-8",
            data: data,
            success: function (response) {
                console.log("response");
                var message = JSON.parse(response);
                slice_status_code = 200;
                slice_address = message.op_par.slice.data;
                slice_number = message.op_par.slice.file_cnt;
            },
            error: function (error) {
                console.log("访问出现错误 ")
            }
        });
    });
    $('#slice_download').click(function () {
        if(slice_status_code==200)
        {
            var address;
            for(var i=1;i<=slice_number;i++)
            {
                address="http://imgp-1254095611.cosgz.myqcloud.com/" +slice_address[i]+"?t="+Math.random();
                downloadURI(address,slice_address[i]);
            }
        }
        else
        {
            alert("The process does not finish yet");
        }
    });

    // $('.dropdown p').click(function(){
    //     var ul = $(".dropdown ul");
    //     if(ul.css("display")==="none"){
    //         ul.slideDown("fast");
    //     }else{
    //         ul.slideUp("fast");
    //     }
    // });
    //
    // $(".dropdown ul li").click(function(){
    //     var txt = $(this).text();
    //     $(".dropdown p").html(txt);
    //     $(".dropdown ul").hide();
    //     var value = $(this).attr("value");////////////////////
    //     alert(value + "clicked");
    // });

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

function onClickedQRCodeChangeMode(){
    var opt = $('#qrcode_fixed option:selected').val();
    switch (opt){
        case '0':
            $('#qrcode_position').show();
            $('#qrcode_width').hide();
            $('#qrcode_height').hide();
            break;
        case '1':
            $('#qrcode_position').hide();
            $('#qrcode_width').show();
            $('#qrcode_height').show();
            break;
    }
}

function onClickedWatermark1ChangeMode(){
    var opt = $('#watermark1_fixed option:selected').val();
    switch (opt){
        case '0':
            $('#watermark1_position').show();
            $('#watermark1_width').hide();
            $('#watermark1_height').hide();
            break;
        case '1':
            $('#watermark1_position').hide();
            $('#watermark1_width').show();
            $('#watermark1_height').show();
            break;
    }
}

function onClickedWatermark2ChangeMode(){
    var opt = $('#watermark2_fixed option:selected').val();
    switch (opt){
        case '0':
            $('#watermark2_position').show();
            $('#watermark2_width').hide();
            $('#watermark2_height').hide();
            break;
        case '1':
            $('#watermark2_position').hide();
            $('#watermark2_width').show();
            $('#watermark2_height').show();
            break;
    }
}