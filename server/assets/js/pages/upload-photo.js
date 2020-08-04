require('jquery-ui');
require('blueimp-file-upload');
import 'jquery-ui/ui/widgets/sortable';

export default function () {
    /**
     * Document Uploader
     * @type {void|jQuery|HTMLElement}
     */
    const documentUploader = $('#document-uploader');
    const inputFile = documentUploader.find('#input-file');
    const uploadedFile = documentUploader.find('#uploaded-file');
    const uploadedItemTemplate = $('#upload-item-template').html();

    documentUploader.sortable({
        items: ".uploaded-item",
        handle: ".upload-file-preview-link",
        stop: function () {
            documentUploader.find('.uploaded-item').each(function (index) {
                $(this).find('.input-uploaded-file').each(function () {
                    const pattern = new RegExp("input_photos[([0-9]*\\)?]", "i");
                    const attributeName = $(this).attr('name').replace(pattern, 'input_photos[' + index + ']');
                    $(this).attr('name', attributeName);
                });
            });
        }
    });

    /**
     * Delete uploaded file (persisted to database)
     */
    const modalConfirm = $('#modal-confirm');
    modalConfirm.find('.modal-title').text('Delete File');
    let activeUploadedItem = null;

    documentUploader.on('click', '.btn-delete-uploaded-file', function (e) {
        e.preventDefault();

        activeUploadedItem = $(this).closest('.uploaded-item');
        const fileName = activeUploadedItem.find('.input-uploaded-file').val().replace(/_/g, ' ');
        modalConfirm.find('.modal-message').html(`Are you sure want to delete uploaded file <strong>${fileName}</strong>?`);
        modalConfirm.find('#btn-yes').data('url', $(this).data('url'));

        modalConfirm.modal({
            backdrop: 'static',
            keyboard: false
        });
    });

    modalConfirm.find('#btn-yes').on('click', function () {
        let buttonYes = $(this);
        buttonYes.prop('disabled', true).text('DELETING...');
        $.ajax({
            url: $(this).data('url'),
            type: 'POST',
            data: {_method: 'delete'},
            accepts: {text: "application/json"},
            success: function (data) {
                buttonYes.prop('disabled', false).text('YES');
                if (data || data.status) {
                    modalConfirm.modal('hide');
                    if (activeUploadedItem.find('.input-primary').is(':checked')) {
                        uploadedFile.find('.uploaded-item').not(activeUploadedItem).first().find('.input-primary').prop('checked', true);
                    }
                    activeUploadedItem.remove();
                } else {
                    alert('Failed delete uploaded file');
                }
            },
            error: function (xhr, status, error) {
                buttonYes.prop('disabled', false).text('YES');
                console.log(xhr.responseText, status, error);
            }
        });
    });
    modalConfirm.find('#btn-no').on('click', function () {
        modalConfirm.modal('hide');
    });

    /**
     * Handle heavy process to upload, abort multiple files.
     */
    inputFile.fileupload({
        url: '/upload/upload-temp',
        dataType: 'json',
        add: function (e, data) {
            const uploadErrors = [];
            const acceptFileTypes = /(gif|jpe?g|png)/i;

            // validate each added file
            if (data.files[0]['type'].length && !acceptFileTypes.test(data.files[0]['type'])) {
                uploadErrors.push('Not an accepted file type ' + data.files[0]['name']);
            }
            if (data.files[0]['size'] && data.files[0]['size'] > 2000000) {
                uploadErrors.push('File ' + data.files[0]['name'] + ' size max 2MB');
            }

            if (uploadErrors.length > 0) {
                alert(uploadErrors.join("\n"));
            } else {
                compress(data.files[0], 700, 'auto', .80, function (file) {
                    data.files = [file];

                    // set preview ready
                    const item = $.parseHTML(uploadedItemTemplate);
                    const primaryLabelId = Math.ceil(Math.random() * 1000);
                    $(item).find('.input-primary').prop('id', 'is_primary_' + primaryLabelId);
                    $(item).find('.label-primary').prop('for', 'is_primary_' + primaryLabelId);
                    if (uploadedFile.find('.uploaded-item').length === 0) {
                        $(item).find('.input-primary').prop('checked', true);
                    }
                    if (data.files && data.files[0]) {
                        const reader = new FileReader();
                        reader.onload = function (e) {
                            $(item).find('.upload-file-preview').css('background', `url("${e.target.result}") center center / cover no-repeat`);
                        };
                        reader.readAsDataURL(data.files[0]);
                    }

                    // add upload to list
                    $(item).addClass('uploading');
                    $(item).find('.btn-delete-file').on('click', function () {
                        if ($(item).hasClass('uploading')) {
                            data.abort();
                            data.context.remove();
                        }
                    });
                    data.context = $(item).insertBefore($('#file-chooser'));
                    data.submit();
                    $('.btn-defer-upload').prop('disabled', true);
                });
            }
        },
        done: function (e, data) {
            const context = $(data.context);
            const result = data.result;
            if (result && result.status === 'success') {
                context.find('.progress-bar').text('UPLOADED');
                context.find('.progress-bar').removeClass('progress-bar-danger');
                context.removeClass('uploading');
                context.find('.btn-delete-file').removeClass('btn-warning').addClass('btn-danger').text('DELETE');

                const photo = result.data;
                context.find('.upload-file-preview').css('background', `url(${photo.fileUrl}) center center / cover no-repeat`);
                context.find('.upload-file-preview-link').attr('href', photo.path);
                context.find('.card-img-top').prop('alt', photo.originalName);
                context.find('.input-primary').val(photo.fileName);
                context.find('.input-uploaded-file').val(photo.fileName);

                $('.uploaded-item').each(function (index) {
                    $(this).find('.input-uploaded-file').each(function () {
                        const pattern = new RegExp("input_photos[([0-9]*\\)?]", "i");
                        const attributeName = $(this).attr('name').replace(pattern, 'input_photos[' + index + ']');
                        $(this).attr('name', attributeName);
                    });
                });
            } else {
                $(context).find('.upload-file-name').html($(result.error).addClass('text-danger'));
            }
        },
        progress: function (e, data) {
            const progress = parseInt(data.loaded / data.total * 100, 10);
            const progressBar = $(data.context).find('.progress-bar');
            progressBar.css('width', progress + '%').text(progress + '%');
        },
        fail: function (e, data) {
            console.log(e);
            console.log(data.textStatus);
        },
        stop: function (e) {
            $('.btn-defer-upload').prop('disabled', false);
        },
    });

    /**
     * Delete temporary file before persist to database (recent upload file).
     */
    uploadedFile.on('click', '.btn-delete-file', function (e) {
        e.preventDefault();
        const buttonDelete = $(this);
        const uploadedItem = buttonDelete.closest('.uploaded-item');
        const file = uploadedItem.find('.input-uploaded-file').val();
        if (file) {
            buttonDelete.prop('disabled', true).text('DELETING...');
            $('.btn-defer-upload').prop('disabled', true);
            $.ajax({
                url: '/upload/delete-temp',
                type: 'POST',
                data: {_method: 'delete', file: file},
                accepts: {text: "application/json"},
                success: function (data) {
                    if (data || data.status) {
                        if (uploadedItem.find('.input-primary').is(':checked')) {
                            uploadedFile.find('.uploaded-item').not(uploadedItem).first().find('.input-primary').prop('checked', true);
                        }
                        uploadedItem.remove();
                    } else {
                        buttonDelete.prop('disabled', false).text('DELETE');
                        alert('Failed delete uploaded file');
                    }
                    $('.btn-defer-upload').prop('disabled', false);
                },
                error: function (xhr, status, error) {
                    buttonDelete.prop('disabled', false).text('DELETE');
                    $('.btn-defer-upload').prop('disabled', false);
                    console.log(xhr.responseText, status, error);
                }
            });
        } else {
            // already handled by abort upload event, so this is not necessary
            // buttonDelete.closest('.uploaded-item').remove();
        }
    });

    /**
     * Compress image from source.
     *
     * @param sourceFile instance of File object (input file)
     * @param resizeWidth resize width base, input 'auto' if you want to constraint with height
     * @param resizeHeight resize height base, input 'auto' if you want to constraint with width
     * @param quality range 0-1 (100%) quality of image
     * @param callback function that called after compress
     */
    function compress(sourceFile, resizeWidth, resizeHeight, quality, callback) {
        //toBlob polyfill
        if (!HTMLCanvasElement.prototype.toBlob) {
            Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
                value: function (callback, type, quality) {
                    const dataURL = this.toDataURL(type, quality).split(',')[1];
                    setTimeout(function () {
                        const binStr = atob(dataURL),
                            len = binStr.length,
                            arr = new Uint8Array(len);
                        for (let i = 0; i < len; i++) {
                            arr[i] = binStr.charCodeAt(i);
                        }
                        callback(new Blob([arr], {type: type || 'image/png'}));
                    });
                }
            });
        }

        const fileName = sourceFile.name;
        const reader = new FileReader();
        reader.readAsDataURL(sourceFile);
        reader.onload = event => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const elem = document.createElement('canvas');

                let width = img.width;
                let height = img.height;

                if (resizeWidth) {
                    if (resizeWidth !== 'auto' && img.width > resizeWidth) {
                        width = resizeWidth;
                        if (resizeHeight === 'auto') {
                            const scaleFactor = width / img.width;
                            height = img.height * scaleFactor;
                        }
                    }
                }

                if (resizeHeight) {
                    if (resizeHeight !== 'auto' && img.height > resizeHeight) {
                        height = resizeHeight;
                        if (resizeWidth === 'auto') {
                            const scaleFactor = height / img.height;
                            width = img.width * scaleFactor;
                        }
                    }
                }

                elem.width = width;
                elem.height = height;

                const ctx = elem.getContext('2d');
                // img.width and img.height will contain the original dimensions
                ctx.drawImage(img, 0, 0, elem.width, elem.height);
                ctx.canvas.toBlob((blob) => {
                    const file = new File([blob], fileName, {
                        type: blob.type,
                        lastModified: Date.now()
                    });
                    callback(file, blob);
                }, sourceFile.type, quality);
            };
            reader.onerror = error => console.log(error);
        };
    }
};