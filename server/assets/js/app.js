try {
    // get jquery ready in global scope
    window.$ = window.jQuery = require('jquery');
    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    $.ajaxSetup({
        headers: {
            "X-CSRF-Token": token,
            "csrf_token": token
        }
    });

    // loading library core
    require('bootstrap');
    require('jquery.easing');
    require('jquery-validation');
    window.moment = require('moment');
    require('daterangepicker');
    require('bs-custom-file-input').init();
    require('datatables.net');
    require('datatables.net-bs4');
    require('startbootstrap-sb-admin-2/js/sb-admin-2');

    // loading misc scripts
    require('./scripts/validation');
    require('./scripts/one-touch-submit');
    require('./scripts/delete');
    require('./scripts/date-picker');
    require('./scripts/text-editor');
    require('./scripts/numeric-value');
    require('./scripts/misc');

    if ($('#document-uploader').length) {
        import("./pages/upload-photo").then(uploadPhoto => uploadPhoto.default());
    }
    if ($('#form-item').length) {
        import("./pages/item").then(item => item.default());
    }
    if ($('#table-booking').length) {
        import("./pages/booking").then(booking => booking.default());
    }
} catch (e) {
    console.log(e);
}

// include sass (but extracted by webpack into separated css file)
import '../sass/app.scss';
