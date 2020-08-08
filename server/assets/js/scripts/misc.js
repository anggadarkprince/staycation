import io from 'socket.io-client';

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

    // Notification with Socket IO
    const userTag = document.querySelector('meta[name="user-id"]');
    const userId = userTag ? userTag.getAttribute('content') : null;
    if (userId) {
        if ('Notification' in window) {
            function displayNotification(title, data) {
                let options = {
                    body: data.message,
                    icon: '/dist/img/favicon.png',
                };
                const notification = new Notification(title, options);
                notification.onclick = function () {
                    window.open(data.url || '/');
                };
            }

            if (Notification.permission !== "granted") {
                Notification.requestPermission(function (result) {
                    console.log('User choice', result);
                    if (result !== 'granted') {
                        console.log('No notification permission granted');
                    } else {
                        displayNotification('Successfully subscribed!', {
                            message: 'You successfully subscribe to our notification service!'
                        });
                    }
                });
            } else {
                const socket = io();
                socket.on('connect', () => {
                    console.log('socket ID: ' + socket.id);
                });
                socket.on('new-booking', function (data) {
                    displayNotification('New Booking Submitted', data);
                });
                socket.on('booking-payment', function (data) {
                    displayNotification('Booking Payment', data);
                });
                socket.on('new-user', function (data) {
                    displayNotification('User Registered', data);
                });
                socket.on('booking-validation', function (data) {
                    displayNotification('Booking Validation', data);
                });
            }
        } else {
            console.log('Not support notification');
        }
    }

});
