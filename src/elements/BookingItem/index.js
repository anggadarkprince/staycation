import React, {useState} from "react";
import {connect} from "react-redux";
import propTypes from 'prop-types';
import Fade from "react-reveal";
import config from 'config';
import axios from 'axios';
import moment from "moment";
import Button from "elements/Button";
import Star from "elements/Star";
import {numeric} from "utilities/formatter";
import {checkoutState, checkoutBooking} from "store/actions/checkout";
import {withRouter} from 'react-router-dom';

const BookingItem = (props) => {
    const [currentItem, setItem] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [isLoadingDownload, setLoadingDownload] = useState(false);

    const bookingStatuses = {
        'BOOKED': 'light',
        'PAID': 'warning',
        'COMPLETED': 'success',
        'REJECTED': 'danger',
    };

    const printInvoice = (booking, download = false) => {
        setItem(booking._id);
        if (download) setLoadingDownload(true);
        else setLoading(true);

        axios(`${config.apiUrl}/api/booking/invoice/${booking._id}`, {
            method: 'GET',
            responseType: 'blob' // Force to receive data in a Blob Format
        })
            .then(response => {
                const file = new Blob([response.data], {type: 'application/pdf'});
                const fileURL = URL.createObjectURL(file);

                if (download) {
                    setLoadingDownload(false);
                    const link = document.createElement('a');
                    link.href = fileURL;
                    link.setAttribute('download', 'invoice.pdf');
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                } else {
                    setLoading(false);
                    window.open(fileURL, "_self");
                }
            })
            .catch(console.log);
    }

    const checkoutPayment = (booking) => {
        props.checkoutBooking({
            _id: booking.item._id,
            duration: booking.duration,
            price: booking.price,
            date: {
                startDate: booking.bookingStartDate,
                endDate: booking.bookingEndDate,
                duration: booking.duration
            },
            booking: booking
        });
        props.checkoutState('payment');
        props.history.push('/checkout');
    }

    const renderItem = (booking) => {
        return (
            <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex flex-row align-items-center">
                    <figure className="img-wrapper mr-3 mb-0" style={{width: 130}}>
                        <img src={booking.item.imageUrl} alt={booking.title} className="img-cover"/>
                    </figure>
                    <div>
                        <h1 className="h6 mb-0 text-info">
                            {booking.transactionNumber}
                        </h1>
                        <p className="mb-0">
                            {booking.item.title}
                            <span className="mx-2">•</span>
                            {booking.item.city}, {booking.item.country}
                        </p>
                        <small className="text-muted mb-0">
                            {moment(booking.createdAt).format('DD MMMM Y HH:mm')}
                        </small>
                        <div>
                            {
                                booking.status === 'BOOKED' && !props.withDetail &&
                                (
                                    <>
                                        <Button type="button" className="btn btn-link p-0" onClick={() => checkoutPayment(booking)}>
                                            Payment
                                        </Button>
                                        <span className="mx-2">•</span>
                                        <Button type="button" className="btn btn-link p-0" isLoading={isLoading && currentItem === booking._id} onClick={() => printInvoice(booking)}>
                                            Print Invoice
                                        </Button>
                                        <span className="mx-2">•</span>
                                        <Button type="link" href={`/properties/${booking.item._id}`}>
                                            View
                                        </Button>
                                    </>
                                )
                            }
                            {
                                booking.status === 'PAID' && !props.withDetail &&
                                (
                                    <>
                                        <Button type="button" className="btn btn-link p-0" isLoading={isLoading && currentItem === booking._id} onClick={() => printInvoice(booking)}>
                                            Print Invoice
                                        </Button>
                                        <span className="mx-2">•</span>
                                        <Button type="link" href={`/properties/${booking.item._id}`}>
                                            View
                                        </Button>
                                    </>
                                )
                            }
                            {
                                booking.status === 'COMPLETED' && !props.withDetail &&
                                (
                                    booking.rating && booking.rating > 0
                                        ? (
                                            <>
                                                <Star value={booking.rating} size={15} spacing={8} />
                                                <span className="mx-2">•</span>
                                                <Button type="link" href={`/booking/rate/${booking._id}`}>Edit Rating</Button>
                                                <span className="mx-2">•</span>
                                                <Button type="button" className="btn btn-link p-0" isLoading={isLoadingDownload && currentItem === booking._id} onClick={() => printInvoice(booking, true)}>
                                                    Invoice
                                                </Button>
                                            </>
                                        )
                                        : (
                                            <>
                                                <Button type="link" href={`/booking/rate/${booking._id}`}>Give a Review</Button>
                                                <span className="mx-2">•</span>
                                                <Button type="button" className="btn btn-link p-0" isLoading={isLoadingDownload && currentItem === booking._id} onClick={() => printInvoice(booking, true)}>
                                                    Invoice
                                                </Button>
                                            </>
                                        )
                                )
                            }
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <h3 className="h5">{numeric(booking.price)}</h3>
                    <span className={`badge badge-${bookingStatuses[booking.status || 'BOOKED']}`}>
                        {booking.status || 'BOOKED'}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <Fade duration={250}>
            <div className="list-group list-group-flush">
                <div className="list-group-item">{props.title}</div>
                {
                    props.bookings.map(booking => (
                        <div className="list-group-item list-group-item-action" key={booking._id}>
                            {
                                props.withDetail
                                    ? (
                                        <div className="card my-3">
                                            <div className="card-header bg-white">
                                                {renderItem(booking)}
                                            </div>
                                            <div className="card-body">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="form-group mb-2 mb-md-0 row">
                                                            <label className="col-sm-4 col-form-label pb-0 font-weight-bold">Start
                                                                Date</label>
                                                            <div className="col-sm-8">
                                                                <p className="form-control-plaintext">
                                                                    {moment(booking.bookingStartDate).format('DD MMMM Y')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="form-group mb-2 mb-md-0 row">
                                                            <label className="col-sm-4 col-form-label pb-0 font-weight-bold">End
                                                                Date</label>
                                                            <div className="col-sm-8">
                                                                <p className="form-control-plaintext">
                                                                    {moment(booking.bookingEndDate).format('DD MMMM Y')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="form-group mb-2 mb-md-0 row">
                                                            <label
                                                                className="col-sm-4 col-form-label pb-0 font-weight-bold">Duration</label>
                                                            <div className="col-sm-8">
                                                                <p className="form-control-plaintext">
                                                                    {booking.duration} nights
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="form-group mb-2 mb-md-0 row">
                                                            <label
                                                                className="col-sm-4 col-form-label pb-0 font-weight-bold">Location</label>
                                                            <div className="col-sm-8">
                                                                <p className="form-control-plaintext">
                                                                    {booking.item.city}, {booking.item.country}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group mb-2 mb-md-0 row">
                                                            <label className="col-sm-4 col-form-label pb-0 font-weight-bold">Item</label>
                                                            <div className="col-sm-8">
                                                                <p className="form-control-plaintext">
                                                                    {booking.item.title}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="form-group mb-2 mb-md-0 row">
                                                            <label className="col-sm-4 col-form-label pb-0 font-weight-bold">Base Price</label>
                                                            <div className="col-sm-8">
                                                                <p className="form-control-plaintext">
                                                                    {numeric(booking.price)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="form-group mb-2 mb-md-0 row">
                                                            <label className="col-sm-4 col-form-label pb-0 font-weight-bold">Tax 10%</label>
                                                            <div className="col-sm-8">
                                                                <p className="form-control-plaintext">
                                                                    {numeric(booking.price * 0.1)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="form-group mb-2 mb-md-0 row">
                                                            <label className="col-sm-4 col-form-label pb-0 font-weight-bold">Total Price</label>
                                                            <div className="col-sm-8">
                                                                <p className="form-control-plaintext">
                                                                    {numeric(booking.price * 1.1)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-footer bg-white text-right">
                                                <Button type="button" className="btn mr-2" isLight isLoading={isLoading && currentItem === booking._id} onClick={() => printInvoice(booking)}>
                                                    Print Invoice
                                                </Button>
                                                {booking.status === 'BOOKED' && <Button type="button" className="btn" isPrimary onClick={() => checkoutPayment(booking)}>Payment</Button>}
                                            </div>
                                        </div>
                                    )
                                    : renderItem(booking)
                            }
                        </div>
                    ))
                }
            </div>
        </Fade>
    )
}

export default withRouter(connect(null, {checkoutState, checkoutBooking})(BookingItem));

BookingItem.propTypes = {
    title: propTypes.string,
    bookings: propTypes.array,
    withDetail: propTypes.bool,
}
