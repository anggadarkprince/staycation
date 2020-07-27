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
    require('startbootstrap-sb-admin-2/js/demo/datatables-demo');

    // loading misc scripts
    require('./scripts/validation');
    require('./scripts/one-touch-submit');
    require('./scripts/delete');
    require('./scripts/date-picker');
    require('./scripts/misc');
} catch (e) {
    console.log(e);
}

// include sass (but extracted by webpack into separated css file)
import '../sass/app.scss';