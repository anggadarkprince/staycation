$(function () {
    $('form').each(function (index, form) {
        $(form).validate({
            submitHandler: function(form) {
                setTimeout(function() {
                    $(form).find('fieldset').attr('disabled', true);
                    $(form).find('button[type=submit]').not('[data-one-touch=false]').text('Submitting...');
                }, 50);
                return true;
            }
        });
    });
});