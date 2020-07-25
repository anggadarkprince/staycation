$(function () {
    $('form').each(function (index, form) {
        $(form).validate({
            submitHandler: function(form) {
                setTimeout(function() {
                    $(form).find('fieldset').attr('disabled', true);
                    $(form).find('button[type=submit]').text('Submitting...');
                }, 50);
                return true;
            }
        });
    });
});