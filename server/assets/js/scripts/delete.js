$(function () {
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
});