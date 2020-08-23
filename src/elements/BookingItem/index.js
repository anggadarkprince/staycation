import React from "react";
import propTypes from 'prop-types';
import Button from "elements/Button";
import moment from "moment";
import {numeric} from "../../utilities/formatter";
import Fade from "react-reveal";
import config from 'config';
import axios from 'axios';

export default function BookingItem(props) {
    const bookingStatuses = {
        'BOOKED': 'light',
        'PAID': 'warning',
        'COMPLETED': 'success',
        'REJECTED': 'danger',
    };

    const printInvoice = (booking, download = false) => {
        axios(`${config.apiUrl}/api/booking/invoice/${booking._id}`, {
            method: 'GET',
            responseType: 'blob' // Force to receive data in a Blob Format
        })
            .then(response => {
                const file = new Blob(
                    [response.data],
                    {type: 'application/pdf'});
                const fileURL = URL.createObjectURL(file);

                if (download) {
                    const link = document.createElement('a');
                    link.href = fileURL;
                    link.setAttribute('download', 'invoice.pdf');
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                } else {
                    window.open(fileURL, "_self");
                }
            })
            .catch(console.log);
    }

    return (
        <Fade duration={250}>
            <div className="list-group list-group-flush">
                <div className="list-group-item">{props.title}</div>
                {
                    props.bookings.map(booking => (
                        <div className="list-group-item" key={booking._id}>
                            {
                                props.withDetail ?
                                    <div className="card my-3">
                                    <div className="card-header">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="d-flex flex-row align-items-center">
                                                <figure className="img-wrapper mr-3 mb-0" style={{width: 130}}>
                                                    <img src={booking.item.imageUrl} alt={booking.title} className="img-cover"/>
                                                </figure>
                                                <div>
                                                    <h1 className="h6 mb-0 text-info">
                                                        {booking.transactionNumber}
                                                    </h1>
                                                    <p className="mb-1">
                                                        {booking.item.title}
                                                        <span className="mx-2">•</span>
                                                        {booking.item.city}, {booking.item.country}
                                                    </p>
                                                    <small className="text-muted mb-0">
                                                        {moment(booking.createdAt).format('DD MMMM Y HH:mm')}
                                                    </small>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <h3 className="h5">{numeric(booking.price)}</h3>
                                                <span className={`badge badge-${bookingStatuses[booking.status || 'BOOKED']}`}>
                                                {booking.status || 'BOOKED'}
                                            </span>
                                            </div>
                                        </div>
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
                                        {/*<a className="btn btn-light mr-2" href={`${config.apiUrl}/api/booking/invoice/${booking._id}`}>Download</a>*/}
                                        <Button type="button" className="btn mr-2" isLight onClick={() => printInvoice(booking)}>Print Invoice</Button>
                                        <Button type="button" className="btn mr-2" isLight onClick={() => printInvoice(booking, true)}>Download</Button>
                                        {booking.status === 'BOOKED' && <Button type="link" className="btn" isPrimary>Payment</Button>}
                                    </div>
                                </div>
                                    :
                                <Button key={booking.transactionNumber} type="link" href={`/profile/booking/${booking.transactionNumber}`} className="list-group-item-action">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex flex-row align-items-center">
                                            <figure className="img-wrapper mr-3 mb-0" style={{width: 130}}>
                                                <img src={booking.item.imageUrl} alt={booking.title} className="img-cover"/>
                                            </figure>
                                            <div>
                                                <h1 className="h6 mb-0 text-info">
                                                    {booking.transactionNumber}
                                                </h1>
                                                <p className="mb-1">
                                                    {booking.item.title}
                                                    <span className="mx-2">•</span>
                                                    {booking.item.city}, {booking.item.country}
                                                </p>
                                                <small className="text-muted mb-0">
                                                    {moment(booking.createdAt).format('DD MMMM Y HH:mm')}
                                                </small>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <h3 className="h5">{numeric(booking.price)}</h3>
                                            <span className={`badge badge-${bookingStatuses[booking.status || 'BOOKED']}`}>
                                                {booking.status || 'BOOKED'}
                                            </span>
                                        </div>
                                    </div>
                                </Button>
                            }
                        </div>
                    ))
                }
            </div>
        </Fade>
    )
}

BookingItem.propTypes = {
    title: propTypes.string,
    bookings: propTypes.array,
    withDetail: propTypes.bool,
}
