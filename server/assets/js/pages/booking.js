export default function () {
    const tableBooking = $('#table-booking');
    const modalValidatePayment = $('#modal-validate-payment');

    tableBooking.on('click', '.btn-validate', function (e) {
        e.preventDefault();

        const action = $(this).data('action');
        const title = $(this).data('title');
        const url = $(this).attr('href');

        modalValidatePayment.find('form').prop('action', url);
        modalValidatePayment.find('.validate-label').text(action);
        modalValidatePayment.find('.validate-title').text(title);
        modalValidatePayment.find('button[type=submit]')
            .removeClass('btn-primary btn-danger')
            .addClass(action === 'approve' ? 'btn-primary' : 'btn-danger')
            .text(action.toUpperCase());
        modalValidatePayment.modal({
            backdrop: 'static',
            keyboard: false
        });
    });

};
