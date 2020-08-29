export const numeric = function (number, locale = "id-ID") {
    const formatNumbering = new Intl.NumberFormat(locale);
    return formatNumbering.format(number);
}

export const reverseNumeric = function (val, locale = "id-ID") {
    const group = new Intl.NumberFormat(locale).format(1111).replace(/1/g, '');
    const decimal = new Intl.NumberFormat(locale).format(1.1).replace(/1/g, '');
    let reversedVal = String(val).replace(new RegExp('\\' + group, 'g'), '');
    reversedVal = reversedVal.replace(new RegExp('\\' + decimal, 'g'), '.');
    return Number.isNaN(reversedVal) ? '' : +reversedVal;
}

export const getDecimalSeparator = function (locale = "id-ID") {
    const numberWithDecimalSeparator = 1.1;
    return Intl.NumberFormat(locale)
        .formatToParts(numberWithDecimalSeparator)
        .find(part => part.type === 'decimal')
        .value || '';
}

export const formatDate = function (date) {
    const d = new Date(date);
    const dtf = new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "short",
        day: "2-digit"
    });
    const [{value: mo}, , {value: da}] = dtf.formatToParts(d);
    return `${da} ${mo}`;
}
