function setNumericValue(value, prefix = '', ths = '.', dec = ',', thsTarget = '.', decTarget = ',') {
    const signed = value.toString().match(/-/);
    const pattern = new RegExp("[^" + dec + "\\\d]", 'g');
    let number_string = value.toString().replace(pattern, '').toString(),
        splitDecimal = number_string.split(dec),
        groupThousand = splitDecimal[0].length % 3,
        currency = splitDecimal[0].substr(0, groupThousand),
        thousands = splitDecimal[0].substr(groupThousand).match(/\d{3}/gi);
    if (thousands) {
        let separator = groupThousand ? thsTarget : '';
        currency += separator + thousands.join(thsTarget);
    }
    currency = splitDecimal[1] !== undefined ? currency + decTarget + splitDecimal[1] : currency;
    return prefix + (signed ? '-' : '') + currency;
}

$(document).on('keyup', '.numerical', function () {
    const value = $(this).val();
    const prefix = $(this).data('prefix') || '';
    $(this).val(setNumericValue(value, prefix));
});