$(document).ready(function () {
    const  mediaFilesacceptedExtensions = [ "jpg", "png","jpeg"];
    let mediaFiles=[];
    $('body').on('click', '.rightsection-queuedchat', function () {
        $('.rightsection-queuedchat').removeClass('rightsection-queuedchat--active');
        $(this).addClass('rightsection-queuedchat--active');
    }).on('click','#saveSite',function () {
        let siteNameElement=$("#siteName");
        let siteUrlElement=$("#siteUrl");
        let siteName=siteNameElement.val();
        let siteUrl=siteUrlElement.val();
        siteName=$.trim(siteName);
        if(siteName==""){
            messageDisplay("Please Enter site name");
            return false;
        }
        if(siteUrl==''){
            messageDisplay("Please Enter site url");
            return  false;
        }
        if(!validURL(siteUrl)){
            messageDisplay("Please Enter Valid url");
            return  false;
        }
        let element=$(this);
        element.attr("disabled","disabled").html("Please Wait..");
        postData('/admin/add-site',{ siteName:siteName,siteUrl:siteUrl }, function (response){
            messageDisplay(response.message);
            element.attr("disabled",false).html("Save");
            if(response.success){
                siteNameElement.val('');
                siteUrlElement.val('');
                $("#widgetCodeWrapper").removeClass('d-none');
                $("#widgetCode").val(`<script>
(function(d, s, id, ref){
var js, fjs = d.getElementsByTagName(s)[0];
if (d.getElementById(id)) {return;}
js = d.createElement(s); js.id = id;
js.src = '${siteBaseUrl}/chat-widget/${response.site_token}';
js.type = 'text/javascript';
fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'sodlan'));
</script>`);
                $("#customizeWidget").attr('href','/admin/chat-customization?site_token='+response.site_token)
                //setTimeout(function(){window.location.reload()},2000);
            }else{

            }
        });
    }).on("change",'#file-upload',function (e) {
        var files = e.target.files;
        var element=$(this);
        var incerement=0;
        $.each(files, function (i, file) {
            var FileType = files[i].type;
            var filename = files[i].name;
            var reader = new FileReader();
            reader.onload = function (e)
            {
                var fileExtension = FileType.substr((FileType.lastIndexOf('/') + 1));
                var Extension = fileExtension.toLowerCase();
                if ($.inArray(Extension, mediaFilesacceptedExtensions) === -1)
                {
                    files=[];
                    element.val("");
                    messageDisplay("Invalid File");
                    return false;
                }
                incerement++;
                mediaFiles=[];
                mediaFiles.push(file);
                $('#file-name').val(filename);
                if(files.length == incerement)
                {
                    element.val("");
                }
            };
            reader.readAsDataURL(file);
        })
    }).on('click','#copyCode',function(){
        copyToClipboard('#widgetCode');
        messageDisplay("Code Copied to ClipBoard",1500,"success");
    });
    function copyToClipboard(element) {
        var $temp = $("<input>");
        $("body").append($temp);
        $temp.val($(element).val()).select();
        document.execCommand("copy");
        $temp.remove();
    }
});
