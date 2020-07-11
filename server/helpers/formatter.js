function numberFormat(value, prefix = '', ths = ',', dec = '.', thsTarget = '.', decTarget = ',') {
    const pattern = new RegExp("[^" + dec + "\\\d]", 'g');
    let number_string = value.toString().replace(pattern, '').toString(),
        splitDecimal = number_string.split(dec),
        groupThousand = splitDecimal[0].length % 3,
        currency = splitDecimal[0].substr(0, groupThousand),
        thousands = splitDecimal[0].substr(groupThousand).match(/\d{3}/gi);
    if (thousands) {
        const separator = groupThousand ? thsTarget : '';
        currency += separator + thousands.join(thsTarget);
    }
    currency = splitDecimal[1] !== undefined ? currency + decTarget + splitDecimal[1] : currency;
    return prefix + (value < 0 ? '-' : '') + currency;
}

module.exports = {
    numberFormat
};