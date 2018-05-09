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
            XCosSecurityToken: data.sessionToken,
        });
    };
    xhr.onerror = function (e) {
        callback('获取签名出错');
    };
    xhr.send();
};

var address;

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
}
$(document).ready(function () {
    $('#fullpage').fullpage({
        sectionsColor: ['#f2f2f2', '#4BBFC3', '#7BAABE', 'whitesmoke', '#ccddff']
        //anchors:['firstPage', 'secondPage', 'thirdPage','fourthPage']
    });
    var round_status_code;
    $('#round_upload').click(function () {
        file=document.getElementById('round_file').files[0];

        //圆角input
        var radius = document.getElementById('round_input').value;
        if(!file)
        {
            alert("Please choose a picture");
            // document.getElementById('slide1').innerText='Do not choose the upload file';
            return;
        }
        file && uploadFile(file, function (err,data) {
            console.log(err||data);
            uploadFile(file, callback());
            alert("function");
            alert('Upload Successfully');
            // document.getElementById('slide1').innerText=err?err:('Upload Successfully'+data.ETag);

        });
        var round_name;
        $.ajax({
            type: 'POST', //访问方式
            url: 'http://service-mayhx21s-1254095611.ap-guangzhou.apigateway.myqcloud.com/test/round', //访问地址
            dataType : "json", //返回数据的格式 json text xml ...
            data: {
                "path": file.name,
                "rad": radius,
            },
            success: function (response) {
                var message = JSON.parse(response.message);
                round_name=message.download_path;
                round_status_code = 200;
                address="http://imgp-1254095611.cosgz.myqcloud.com"+round_name;
                alert(address);
                $("#round_preview").attr("src", address);
                alert("Finish Process");
            },
            error: function (error) {
                console.log("访问出现错误 ")
            }
        });



    });

    $('#round_download').click(function () {
        if(round_status_code == 200 )
        {


            downloadURI(address, file.name);
            // address="'"+address+"'";

        }
        else
        {

            alert("The process do not finish yet.");
        }


    });



    var shrink_status_code;
    $('#shrink_upload').click(function () {
        file=document.getElementById('shrink_file').files[0];
        var percentage = document.getElementById('shrink_input').value;
        if(percentage>1 || percentage<0)

            if(!file)
            {
                alert("Please choose a picture");
                // document.getElementById('slide1').innerText='Do not choose the upload file';
                return;
            }
        file && uploadFile(file, function (err,data) {
            console.log(err||data);
            uploadFile(file, callback());
            alert("function");
            alert('Upload Successfully');
            // document.getElementById('slide1').innerText=err?err:('Upload Successfully'+data.ETag);

        });

        $.ajax({
            url: address,
            success: function () {
                shrink_status_code = 200;
                $("#shrink_preview").attr("src", address);
                alert("Finish Process");
            },

        });

    });

    $('#shrink_download').click(function () {
        if(shrink_status_code == 200 )
        {


            downloadURI(address, file.name);
            // address="'"+address+"'";

        }
        else
        {
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


