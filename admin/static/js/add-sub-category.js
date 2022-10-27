let mediaFiles=[];
$(document).ready(function () {
    const  mediaFilesacceptedExtensions = [ "jpg", "png","jpeg"];
    let mediaFiles=[];
    let file ='';
    $('body').on('click','#saveSite',function () {


        let categoryNameElement=$("#category");
        let category=categoryNameElement.val();
        category=$.trim(category);

        if(category=="" || category == undefined || category == null){
            messageDisplay("Please Select category name");
            return false;
        }


        let subCategoryNameElement=$("#sub_category");
        let subCtegory=subCategoryNameElement.val();
        subCtegory=$.trim(subCtegory);
        if(subCtegory==""){
            messageDisplay("Please Enter sub category name");
            return false;
        }
        var foodType = $("input[name='switch-ones']:checked").val();
        if(foodType==""){
            messageDisplay("Please select food type whether its veg or no-veg");
            return false;
        }


        let element=$(this);
        element.attr("disabled","disabled").html("Please Wait..");
        let formData=new FormData();

        formData.append('upload_file', mediaFiles[0]);
        formData.append('category',category);
        formData.append('subCategory',subCtegory);
        formData.append('foodType',foodType);

        $.ajax({
            type: "POST",
            url: '/admin/add-sub-categories',
            xhr: function() {
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener('progress', progress);
                return xhr;
            },
            data: formData,
            dataType: "json",
            cache: false,
            contentType: false,
            processData: false,
            success: function (data) {
                console.log(data);
                if(data.success == true)
                {
                    messageDisplay(data.message,2000,"success");
                    setTimeout(function () {
                        location.href="/admin/sub-category";
                    },2000);
                }else{
                    element.attr("disabled",false).html('save');
                    messageDisplay(data.message,2000);
                }
            },
            error: function () {
                messageDisplay("sub category not inserted");
            }
        });
        /* postData('/admin/add-categories',{ formData }, function (response){
             messageDisplay(response.message);
             element.attr("disabled",false).html("Save");
             if(response.success){
                 categoryNameElement.val('');
                 messageDisplay("category has been saved succeessfully");
                 setTimeout(function(){
                     location.href= "/admin/category";
                     },2000);
             }else{
                 messageDisplay("category not inserted");
             }
         });*/
    }).on('change','#file-upload',function (e){
        $("#files-wrapper").removeClass("d-none");
        var files = e.target.files;
        var element=$(this);
        var incerement=0;

        if ($(this).get(0).files.length != 0) {
            $.each(files, function (i, file) {
                console.log(files[i].type);

                var FileType = files[i].type;
                var filename = files[i].name;
                console.log(filename);
                var reader = new FileReader();
                reader.onload = function (e) {

                    var fileExtension = FileType.substr((FileType.lastIndexOf('/') + 1));
                    var Extension = fileExtension.toLowerCase();
                    let showFileName = '';
                    let filePath = '/static/img/file.png';
                    if ($.inArray(Extension, mediaFilesacceptedExtensions) === -1) {
                        messageDisplay("Not a valid file");
                        return false;
                    } else {
                        filePath = e.target.result;
                    }
                    incerement++;

                    mediaFiles = [];
                    mediaFiles.push(file);

                    let html = `<div class="attachimage-box" style="background: url(${filePath}) no-repeat center;">
                            <div class="delete-file delete-image">
                                <i class="fas fa-trash-alt"></i>
                                <div>
                                    Delete
                                </div>
                            </div>
                              <div>${showFileName}</div>
                        </div>`;
                    $("#files-wrapper").html(html);

                    if (files.length == incerement) {
                        element.val("");
                    }
                };
                reader.readAsDataURL(file);
            });
        }

    }).on('click','.delete-image',function (e){
        mediaFiles ="";
        $("#files-wrapper").addClass("d-none");
        // $("#files-wrapper").remove().val("");
    });
    // function uploadFile(fileId,file){
    //     let formData=new FormData();
    //     formData.append('upload_file',file);
    //     $.ajax({
    //         type: "POST",
    //         url: window.location.href,
    //         xhr: function() {
    //             var xhr = new window.XMLHttpRequest();
    //             xhr.upload.addEventListener('progress', progress);
    //             return xhr;
    //         },
    //         data: formData,
    //         dataType: "json",
    //         cache: false,
    //         contentType: false,
    //         processData: false,
    //         success: function (data) {
    //             window.location.reload();
    //             if (typeof callback == "function") {
    //                 callback(data);
    //             }
    //         },
    //         error: function () {
    //             if (typeof callback == "function") {
    //                 callback('{"success": false,"message": "Oops..! Something went wrong try again later"}');
    //             }
    //         }
    //     });
    // }
    function progress(e){
        if(e.lengthComputable){
            var max = e.total;
            var current = e.loaded;

            var percentage = (current * 100)/max;
            console.log(percentage,"percentage");
            if(percentage >= 100)
            {
                // process completed
            }
        }
    }


});
