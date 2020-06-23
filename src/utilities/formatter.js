export const numeric = function(number) {
    const formatNumbering = new Intl.NumberFormat("id-ID");
    return formatNumbering.format(number);
}

export const formatDate = function(date) {
    const d = new Date(date);
    const dtf = new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "short",
        day: "2-digit"
    });
    const [{value: mo}, , {value: da}] = dtf.formatToParts(d);
    return `${da} ${mo}`;
}