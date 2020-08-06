import compress from '../scripts/compresor';

export default function () {
    const formItem = $('#form-item');
    const checkFacility = formItem.find('.check-facility');
    const btnAddActivity = formItem.find('#btn-add-activity');
    const tableActivity = formItem.find('#table-activity');
    const modalActivity = $('#modal-activity');
    const uploadRequests = {};

    $("head").append($('<style>.is-loading .activity-photo-wrapper:after { content: ""; background: rgba(255, 255, 255, .5); width: 100%; height: 100%; display: block; top: 0; position: absolute; }</style>'));

    checkFacility.on('change', function () {
        const inputQuantity = $(this).closest('.check-facility-wrapper').find('.facility-quantity');
        if ($(this).is(':checked')) {
            inputQuantity.prop('disabled', false);
        } else {
            inputQuantity.val('').prop('disabled', true);
        }
    });

    btnAddActivity.on('click', function () {
        modalActivity.modal({
            backdrop: 'static',
            keyboard: false
        });
    });

    modalActivity.on('hidden.bs.modal', function () {
        modalActivity.find('#activity').val('');
        modalActivity.find('#description').val('');
        modalActivity.find('input[name=is_popular]').prop('checked', false);
        modalActivity.find('#image').val('').change();
        modalActivity.find('.custom-file-label').text('Pick Image');
    });

    modalActivity.on('submit', function (e) {
        e.preventDefault();

        const activity = modalActivity.find('#activity').val();
        const description = modalActivity.find('#description').val();
        const isPopular = modalActivity.find("input[name=is_popular]:checked").val();
        const image = modalActivity.find('#image').get(0);

        if (image.files && image.files[0]) {
            compress(image.files[0], 700, 'auto', .80, function (file) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function (e) {
                    // append activity to table
                    const rowId = (new Date()).getTime();
                    const row = $.parseHTML(`
                        <tr class="text-muted is-loading" data-id="${rowId}">
                            <td class="font-weight-bold">
                                <div class="d-inline-block position-relative mr-2 activity-photo-wrapper">
                                    <img src="${e.target.result}" alt="${activity}" class="img-fluid" style="max-width: 75px">
                                    <div style="left: calc(50% - 0.5rem); top: calc(50% - 0.8rem); z-index: 1;" class="loading-wrapper position-absolute">
                                        <div class="spinner-border spinner-border-sm text-primary">
                                            <span class="sr-only">Loading...</span>
                                        </div>
                                    </div>
                                </div>
                                ${activity}
                            </td>
                            <td style="max-width: 600px; min-width: 300px">${description.substr(0, 200)}${description.length > 200 ? '...' : ''}</td>
                            <td>${isPopular ? 'Popular' : 'Regular'}</td>
                            <td style="width: 60px">
                                <input type="hidden" name="activities[][activity]" value="${activity}">
                                <input type="hidden" name="activities[][description]" value="${description}">
                                <input type="hidden" name="activities[][isPopular]" value="${isPopular}">
                                <input type="hidden" class="input-uploaded-file" name="activities[][image]" value="">
                                <button type="button" class="btn btn-warning btn-sm btn-delete-activity">
                                    <i class="fas fa-times"></i>
                                </button>
                            </td>
                        </tr>        
                    `);
                    tableActivity.find('tbody').append(row);

                    // set order input
                    tableActivity.find('tbody tr').not('.row-placeholder').each(function (index) {
                        $(this).find('input[type=hidden]').each(function () {
                            const pattern = new RegExp("activities[([0-9]*\\)?]", "i");
                            const attributeName = $(this).attr('name').replace(pattern, 'activities[' + index + ']');
                            $(this).attr('name', attributeName);
                        });
                    });

                    // collect data and prepare ajax post request
                    let formData = new FormData();
                    formData.append("input_files", file);
                    uploadRequests[rowId] = $.ajax({
                        type: "POST",
                        url: '/upload/upload-temp',
                        data: formData,
                        processData: false,
                        contentType: false,
                        beforeSend: function () {
                            formItem.find('button[type=submit]').prop('disabled', true);
                        },
                        success: function (result) {
                            if (result.status === 'success') {
                                $(row).removeClass('text-muted is-loading');
                                $(row).find('.loading-wrapper').remove();
                                $(row).find('.btn-delete-activity').addClass('btn-danger').removeClass('btn-warning');
                                $(row).find('.btn-delete-activity i').addClass('fa-trash-alt').removeClass('fa-times');
                                $(row).find('.input-uploaded-file').val(result.data.fileName);
                            } else {
                                alert('Upload failed, try again later');
                            }
                        },
                        error: function (xhr, status, error) {
                            if (xhr.statusText === 'abort') {
                                return;
                            }
                            alert('Upload failed, try again later');
                        },
                        complete: function() {
                            formItem.find('button[type=submit]').prop('disabled', false);
                            delete uploadRequests[rowId];
                        }
                    });
                };
            });
        }

        tableActivity.find('.row-placeholder').hide();
        modalActivity.modal('hide');
    });

    tableActivity.on('click', '.btn-delete-activity', function () {
        const currentRow = $(this).closest('tr');
        const fileName = currentRow.find('.input-uploaded-file').val();

        if (currentRow.hasClass('is-loading')) {
            uploadRequests[currentRow.data('id')].abort();
            delete uploadRequests[currentRow.data('id')];
        } else if (!fileName.includes('uploads')) {
            $.ajax({
                url: '/upload/delete-temp',
                type: 'POST',
                data: {_method: 'delete', file: fileName},
                accepts: {text: "application/json"},
            });
        }

        currentRow.remove();

        if (tableActivity.find('tbody tr').not('.row-placeholder').length === 0) {
            tableActivity.find('.row-placeholder').show();
        }
    });

};
