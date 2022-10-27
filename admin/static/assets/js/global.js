var emailExpr = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

var mobileExpr = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/;
var loadingHtml = "<i class='fa fa-spinner fa-spin' aria-hidden='true'></i>";
$(function (){
    $('#toggle-btn').on('click', function (e) {

        e.preventDefault();

        if ($(window).outerWidth() > 1194) {
            $('nav.side-navbar').toggleClass('shrink');
            $('.page').toggleClass('active');
        } else {
            $('nav.side-navbar').toggleClass('show-sm');
            $('.page').toggleClass('active-sm');
        }
    });
})


var loadingHtml = "<i class='fa fa-spinner fa-spin' aria-hidden='true'></i>";

function messageDisplay2(message, timeOut, type) {

    type = $.trim(type);
    if (type == "") {
        type = "error";
    }

    if ($.trim(timeOut) == "") {
        timeOut = 1500;
    }

    var element = $("#feedbackSection");
    var color = "#f06b7c";
    if (type == "success") {
        color = "#4caf50";
    } else if (type == "error") {
        color = "#f06b7c";
    }
    element.attr("style", "background-color:" + color);
    $("div#feedbackSection span").html(message);
    element.animate({
        height: 70
    }, 300).show();

    if (timeOut != -1) {
        setTimeout(function () {
            element.animate({
                height: 0
            }, 300, function () {
                element.hide();
            });
        }, timeOut);
    }

}


function parseJsonData(data) {
    return $.parseJSON(JSON.stringify(data));
}

function ajaxData(url, parameters, callback) {
    if(!url.includes(BASE_URL)){
        url = BASE_URL + url;
    }
    $.ajax({
        type: "POST",
        url: url,
        data: parameters,
        dataType: "json",
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
            if (typeof callback == "function") {
                callback(data);
            }
        },
        error: function () {
            if (typeof callback == "function") {
                callback('{"success": false,"message": "Oops..! Something went wrong try again later"}');
            }
        }
    });
}
function isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode;
    if ((charCode < 48 || charCode > 57))
        return false;

    return true;
}
function postData(url, parameters, callback) {
    url = BASE_URL + url;
    $.post(url, parameters, function (data) {
        if (typeof callback == "function") {
            callback(data);
        }
    });
}

function buttonLoading(loadingElement) {
    loadingElement.append(loadingHtml);
    loadingElement.prop('disabled', true);

}
function removeButtonLoading(loadingElement) {
    loadingElement.prop('disabled', false);
    $("i").removeClass("fa-spinner");
}

function stringSlug(string) {

    string = string.replace(/[/#+)(&^!@$~%,?`*:;{}'".\\=/|]/g, '-');
    string = string.replace(/\s+/g, '-');
//string = string.replace(/-+$/g,"");
    string = string.replace(/(-){2}/g, "");
    return string;

}

var Emailregex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

$(document).ready(function () {
    $("body").on("click", ".delete_btn", function () {


        var imageId = $(this).attr("data-id");

        if (imageId === "") {
            messageDisplay("Something went wrong please try again after some time", 2000);
            return false;
        }
        $.post(BASE_URL + "/updateImg", {image_id: imageId}, function (response) {

            if (response.success) {


                $("#" + imageId).remove();
                messageDisplay("Image removed successfully", 2000);
                setTimeout(function () {
                    window.location.reload();
                }, 2500);

            } else {

                console.log("fail");
            }

        });
    }).on("click", "#subscribe-newsletter", function () {
        var element = $(this);
        var email = $.trim($("#news-letter-email").val());


        var emailExpr = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (email == "") {
            messageDisplay("Please enter email Id", 1500, "error");
            $("#news-letter-email").focus();
            return false;
        } else if (!emailExpr.test(email)) {
            messageDisplay("Please enter valid email", 1500, "error");
            $("#news-letter-email").focus();
            return false;
        }
        element.attr("disabled",true);
        $.post(BASE_URL+"/news-letter",{
            email:email
        },function (data) {
            element.attr("disabled",false);
            data = parseJsonData(data);
            if(data.success){
                messageDisplay(data.message,1500,"success");
                setTimeout(function () {
                    window.location.reload();
                },2000);
            }else{
                messageDisplay(data.message,1800,"error");
            }
        })

    }).on("click", "#contactusform-submitbtn", function () {

        var first_name = $.trim($("#contactusform-firstname").val());
        var contactusform_lastname = $("#contactusform-lastname").val();
        var contactusform_email = $("#contactusform-email").val();
        var contactusform_number = $("#contactusform-number").val();
        var contactusform_information = $("#contactusform-information").val();


        if (first_name == "" || first_name == null) {
            messageDisplay("Please Enter First Name", 1500, "error");
            return false;
        }
        if (contactusform_lastname == "" || contactusform_lastname == null) {
            messageDisplay("Please Enter Last Name", 1500, "error");
            return false;
        }
        if (contactusform_email == "" || contactusform_email == null) {
            messageDisplay("Please Enter Email", 1500, "error");
            return false;
        }
        if (contactusform_number == "" || contactusform_number == null) {
            messageDisplay("Please Enter Mobile Number", 1500, "error");
            return false;
        }
        if (contactusform_information == "" || contactusform_information == null) {
            messageDisplay("Please Enter Information", 1500, "error");
            return false;
        }

        $.post(BASE_URL + "/contactus", {
            first_name: first_name,
            contactusform_lastname: contactusform_lastname,
            contactusform_email: contactusform_email,
            contactusform_number: contactusform_number,
            contactusform_information: contactusform_information,
        }, function (response) {
            console.log(response);
            if (response.success) {
                messageDisplay(response.message, 2000, "success");

                setTimeout(function () {
                    window.location.reload();

                }, 2000)

            }
            else {
                messageDisplay(response.message, 2000, "error");

            }
        });
    })
        .on("click", "#enquiry-submit", function () {

            var user_name = $.trim($("#enquiry-username").val());
            var user_email = $.trim($("#enquiry-useremail").val());
            var user_number = $.trim($("#enquiry-usernumber").val());
            var selected_safari = $.trim($("#enquiry-userchoosesafari").text());

            if (user_name == "" || user_name == null) {
                messageDisplay("Please Enter User Name", 1500, "error");
                $("#enquiry-username").focus();
                return false;
            }


            if (user_email == "") {
                messageDisplay("Please Enter Email", 1500, "error");
                $("#enquiry-useremail").focus();
                return false;
            }

            if (!Emailregex.test(user_email)) {

                messageDisplay("Please  Enter  Valid Email", 1500, "error")
                return false;

            }


            if (user_number == "" || user_number == null) {
                messageDisplay("Please Enter Mobile Number", 1500, "error");
                $("#enquiry-usernumber").focus();
                return false;
            }
            if (selected_safari == "" || selected_safari == null) {
                messageDisplay("Please Select Safari Name", 1500, "error");
                $("#enquiry-userchoosesafari").focus();
            }

            $.post(BASE_URL + "/enquiryForm", {
                user_name: user_name,
                user_number: user_number,
                user_email: user_email,
                selected_safari: selected_safari,

            }, function (response) {
                console.log(response);
                if (response.success) {
                    messageDisplay(response.message, 2000, "success");

                    setTimeout(function () {
                        window.location.reload();

                    }, 2000)

                }
                else {
                    messageDisplay(response.message, 2000, "error");

                }
            });


        }).on("change", "#file", function (e) {
        if ($(this).get(0).files.length !== 0) {
            var files = e.target.files;
            $.each(files, function (i, file) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var FileType = files[i].type;
                    var filename = files[i].name;
                    var fileExtension = FileType.substr((FileType.lastIndexOf('/') + 1));
                    var Extension = fileExtension.toLowerCase();

                    $("#feature_img").attr("src", e.target.result);

                };
                reader.readAsDataURL(file);
            });

        }

    }).on("click", ".select_safari", function () {
        var days = $(this).text();
        $("#enquiry-userchoosesafari").text(days);
    });

});


function messageDisplay(message, timeOut, type) {

    if ($.trim(timeOut) == "") {
        timeOut = 2500;
    }
    var element = $("#wTdOl5MnWz");
    element.removeClass("error").removeClass("success").addClass(type);
    $("div#wTdOl5MnWz span").html(message);
    element.animate({
        height: 70
    }, 300).show();
    setTimeout(function () {
        element.animate({
            height: 0
        }, 300, function () {
            element.hide();
        });
    }, timeOut);
}








