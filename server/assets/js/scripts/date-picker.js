$(function () {
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
});