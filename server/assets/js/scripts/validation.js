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
    onfocusout: function(element) {
        return false; // prevent error on quill text editor
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