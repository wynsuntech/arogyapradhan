var emailExpr = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
$(document).ready(function () {
    $("body").on("keypress keyup blur", ".numbers", function (e) {
        $(this).val($(this).val().replace(/[^0-9\.]/g, ''));
        if ((e.which != 46 || $(this).val().indexOf('.') != -1) && (event.which < 48 || event.which > 57)) {
            event.preventDefault();
        }
    });
})

var nameExpr = "^\s*([A-Za-z]{1,}([\.,] |[-']| ))+[A-Za-z]+\.?\s*$";

var MobileExpr = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/;

function acronym(str) {
    str = str.split("@");
    str = str[0];
    let words = (str || "").replace(/[\(\),\|\.\+\-&]/g, " ").split(/[\s\.]/);
    let acronym =
        words.length > 1 ?
        words.reduce((response, word) => (response += word.slice(0, 1)), "") :
        words[0].slice(0, 2);
    return acronym.toUpperCase();
}

function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}

function validEmail(email) {
    return email.match(/^\s*(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))\s*$/) // fragment locator
}

function messageDisplay(message, timeOut, type) {

    type = $.trim(type);
    if (type == "") {
        type = "error";
    }

    if ($.trim(timeOut) == "") {
        timeOut = 1500;
    }

    var element = $("#feedbackSection");
    var color = "#e74a3b";
    if (type == "success") {
        color = "#4caf50";
    } else if (type == "error") {
        color = "#e74a3b";
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

function postData(url, parameters, callback) {
    $.post(url, parameters, function (data) {
        if (typeof callback == "function") {
            callback(data);
        }
    });
}

function ajaxData(url, parameters, callback) {
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

function messageDisplay(message, timeOut, type) {

    type = $.trim(type);
    if (type == "") {
        type = "error";
    }

    if ($.trim(timeOut) == "") {
        timeOut = 1500;
    }

    var element = $(".feedback-section");
    var color = "#f06b7c";
    if (type == "success") {
        color = "#4caf50";
    } else if (type == "error") {
        color = "#f06b7c";
    }
    element.attr("style", "background-color:" + color);
    $("div.feedback-section span").html(message);
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