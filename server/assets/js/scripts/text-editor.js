import Quill from 'quill';

$(function () {
    const textEditors = $('.text-editor');
    textEditors.each(function () {
        const textEditor = this;
        const quill = new Quill(textEditor, {
            modules: {
                toolbar: '.text-editor-wrapper .toolbar'
            },
            theme: 'snow',
            placeholder: 'Write a text...',
        });
        quill.on('text-change', function (delta, oldDelta, source) {
            const html = quill.container.children[0].innerHTML;
            $(`${$(textEditor).data('change-target')}`).val(html);
        });
        textEditors.closest('.text-editor-wrapper').on('click', function () {
            quill.focus();
        });
    });
});