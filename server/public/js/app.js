$(function () {
    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    $.ajaxSetup({
        headers: {"X-CSRF-Token": token }
    });

    bsCustomFileInput.init();

    $.validator.setDefaults({
        submitHandler: function (form) {
            return true;
        },
        invalidHandler: function (event, validator) {
            $(this).addClass('was-validated');
        },
        highlight: function (element) {
            $(element).addClass('is-invalid');
        },
        unhighlight: function (element) {
            $(element).removeClass('is-invalid');
        },
        ignore: ":hidden, .ignore-validation",
        errorElement: "span",
        errorClass: "invalid-feedback",
        validClass: "valid-feedback",
        errorPlacement: function (error, element) {
            if (element.hasClass('select2') || element.hasClass("select2-hidden-accessible")) {
                error.insertAfter(element.next('span.select2'));
            }
            else if (element.parent(".input-group").length || element.parent(".custom-control").length) {
                error.insertAfter(element.parent());
            }
            else if (element.parent(".input-group-prepend").length || element.parent(".input-group-append").length) {
                error.insertAfter(element.parent().parent());
            }
            else if (element.parent(".form-check-label").length) {
                element.closest('.form-group').append(error);
            }
            else {
                error.insertAfter(element);
            }
        }
    });
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


    const modalDelete = $('#modal-delete');
    const formDelete = modalDelete.find('form');
    $(document).on('click', '.btn-delete', function() {
        formDelete.attr('action', $(this).data('url'));
        modalDelete.find('.delete-title').text($(this).data('title'));
        modalDelete.find('.delete-label').text($(this).data('label'));
        modalDelete.modal({
            backdrop: 'static',
            keyboard: false
        });
    });

    // initialize date picker
    const dateFormat = 'DD MMMM YYYY';
    const fullDateFormat = 'DD MMMM YYYY';
    $('.datepicker:not([readonly])').each(function () {
        const options = {
            singleDatePicker: true,
            showDropdowns: true,
            drops: $(this).data('drops') || 'down',
            autoUpdateInput: false,
            autoApply: true,
            locale: {
                format: dateFormat
            },
            parentEl: $(this).closest('div')
        };
        if ($(this).data('min-date')) {
            options.minDate = $(this).data('min-date');
        }
        if ($(this).data('max-date')) {
            options.maxDate = $(this).data('max-date');
        }
        if ($(this).data('parent-el')) {
            options.parentEl = $(this).data('parent-el');
        }
        if ($(this).data('locale-format')) {
            options.locale.format = $(this).data('locale-format');
        }
        $(this).daterangepicker(options)
            .on("apply.daterangepicker", function (e, picker) {
                picker.element.val(picker.startDate.format(picker.locale.format));

                // update another picker element
                const updateTarget = $(picker.element).data('update-target');
                const updateMin = $(picker.element).data('update-min');
                if (updateTarget) {
                    const pickedDate = moment(picker.startDate, picker.locale.format); // must be moment object
                    if (updateMin) {
                        if (Number(updateMin) > 0) {
                            pickedDate.add(Number(updateMin || 0), 'd');
                        } else if (Number(updateMin) < 0) {
                            pickedDate.subtract(Number(updateMin.toString().replace(/[^0-9]/g, "") || 0), 'd');
                        }
                    }
                    $(updateTarget).data('daterangepicker').minDate = pickedDate;

                    // set blank target if minimum date greater than current value
                    if (pickedDate.isAfter(moment($(updateTarget).val(), dateFormat))) {
                        $(updateTarget).val('').focus();
                    }
                }
            })
            .on("hide.daterangepicker", function (e, picker) {
                setTimeout(function () {
                    const formattedDate = $(picker.element).closest('.form-group').find('.formatted-date');
                    if (picker.element.val()) {
                        formattedDate.text(picker.startDate.format(fullDateFormat));
                    } else {
                        formattedDate.text('(Pick a date)');
                    }
                }, 150);
            });
    });

    $('form .datepicker').keydown(function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            return false;
        }
    });

    // Tooltip
    $('[data-toggle="tooltip"]').tooltip({
        container: 'body'
    });
});