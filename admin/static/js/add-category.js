let mediaFiles = [];
$(document).ready(function () {




    const mediaFilesacceptedExtensions = ["jpg", "png", "jpeg"];
    let mediaFiles = [];
    let file = '';
    $('body').on('click', '#saveSite', function () {
        let categoryNameElement = $("#category");
        let category = categoryNameElement.val();
        category = $.trim(category);
        if (category == "") {
            messageDisplay("Please enter amenity name");
            return false;
        }

        if (!category.match('^[a-zA-Z ]{0,1000}$')) {
            messageDisplay("Please enter valid amenity name");
            return false;
        }

        if (category.length < 3 || category.length > 20) {
            messageDisplay("Amenity name should be 3 to 20 characters");
            return false;
        }


        let element = $(this);
        element.attr("disabled", "disabled").html("Please Wait..");
        let formData = new FormData();

        formData.append('upload_file', mediaFiles[0]);
        formData.append('category', category);

        $.ajax({
            type: "POST",
            url: '/admin/add-amenities',
            xhr: function () {
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
                if (data.success == true) {
                    messageDisplay(data.message, 2000, "success");
                    setTimeout(function () {
                        location.href = "/admin/amenities";
                    }, 2000);
                } else {
                    element.attr("disabled", false).html('save');
                    messageDisplay(data.message, 2000);
                }
            },
            error: function () {
                messageDisplay("amenity not inserted");
            }
        });

    }).on('change', '#file-upload', function (e) {
        $("#files-wrapper").removeClass("d-none");

        var files = e.target.files;
        var element = $(this);
        var incerement = 0;

        if ($(this).get(0).files.length != 0) {
            $.each(files, function (i, file) {
                console.log(files[i].type);

                var FileType = files[i].type;
                var filename = files[i].name;
                console.log(filename);
                var reader = new FileReader();
                reader.onload = function (e) {

                    var fileExtension = FileType.substr((FileType.lastIndexOf('/') + 1));
                    //alert(fileExtension);return false;
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

                    let html = `<div class="attachimage-box" style="background: url(${filePath}) no-repeat;">
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

    }).on('click', '.delete-image', function (e) {
        mediaFiles = "";
        $("#files-wrapper").addClass("d-none");
        // $("#files-wrapper").remove().val("");
    });

    function progress(e) {
        if (e.lengthComputable) {
            var max = e.total;
            var current = e.loaded;

            var percentage = (current * 100) / max;
            console.log(percentage, "percentage");
            if (percentage >= 100) {
                // process completed
            }
        }
    }


});