$(function () {
    // Datatable
    $('#dataTable, .data-table').DataTable({
        language: {
            processing: "Loading...",
            searchPlaceholder: "Search data"
        },
    });

    // Tooltip
    $('[data-toggle="tooltip"]').tooltip({
        container: 'body'
    });
});
