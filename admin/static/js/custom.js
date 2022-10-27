var rowNum = 1;
$(".fa-plus").click(function () {
    rowNum++;
    let ae = `<div class="remove-element mb-2">
            <label for="plan-features">Question <span class="iteration">${rowNum}</span></label>
                <div class="form-row mt-2">
                    <div class="col-11">
                        <input type="text" name="questions[]" class="form-control">
                    </div>
                    <div class="col-1 d-flex justify-content-center align-items-center">
                        <i class="fa fa-minus"></i>
                    </div>
                </div>
            </div>`;
    $(".appending-elements").append(ae);
});
$(".appending-elements").on("click", ".fa-minus", function () {
    $(this).closest(".remove-element").remove();
});

//field settings
$(".fa-plus").click(function () {
    let fs = `<div class="form-row mt-2 remove-element">
                <div class="col-11">
                    <input type="text" name="fieldname[]" class="form-control" placeholder="Field Name">
                </div>
                <div class="col-1 d-flex justify-content-center align-items-center">
                    <i class="fa fa-minus"></i>
                </div>
            </div>`;
    $(".appending-fe-elements").append(fs);
});
$(".appending-fe-elements").on("click", ".fa-minus", function () {
    $(this).closest(".remove-element").remove();
});
//iris color
// loop the iris wrappers
$('.iris-wrapper', '#form').each(function () {

    // set up current object vars
    var $input = $('INPUT', this);
    var $inputGroup = $('.input-group', this);
    var $inputIndicator = $('.input-group-text', this);

    // set our input color indicator to default color
    $inputIndicator.css('background-color', $input.val());

    // init iris
    $input.iris({
        // on iris change
        change: function (event, ui) {
            // update input value on change
            $input.attr('value', ui.color.toString());
            // load the current value
            $inputIndicator.css('background-color', ui.color.toString());
        }
    });

    // move iris color picker after the input group
    $('.iris-picker', this).insertAfter($inputGroup);

    // input blur function
    $input.blur(function () {
        setTimeout(function () {
            if (!$(document.activeElement).closest(".iris-picker").length)
                $input.iris('hide');
            else
                $input.focus();
        }, 0);
    });

    // when input is focused
    $input.focus(function () {
        // input iris show
        $input.iris('show');
    });

});
