export default function () {
    const formItem = $('#form-item');
    const checkFacility = formItem.find('.check-facility');

    checkFacility.on('change', function () {
        const inputQuantity = $(this).closest('.check-facility-wrapper').find('.facility-quantity');
        if($(this).is(':checked')) {
            inputQuantity.prop('disabled', false);
        } else {
            inputQuantity.val('').prop('disabled', true);
        }
    });
};