import React from "react";
import propTypes from 'prop-types';
import Button from "elements/Button";
import moment from "moment";
import {numeric} from "../../utilities/formatter";
import Fade from "react-reveal";

export default function BookingItem(props) {
    const bookingStatuses = {
        'BOOKED': 'light',
        'PAID': 'warning',
        'COMPLETED': 'success',
        'REJECTED': 'danger',
    };
    return (
        <Fade duration={250}>
            <div className="list-group list-group-flush">
                <div className="list-group-item">{props.title}</div>
                {
                    props.bookings.map(booking => (
                        <Button key={booking.transactionNumber} type="link" href={`/profile/booking/${booking.transactionNumber}`} className="list-group-item list-group-item-action">
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
                                        {booking.status}
                                    </span>
                                </div>
                            </div>
                        </Button>
                    ))
                }
            </div>
        </Fade>
    )
}

BookingItem.propTypes = {
    title: propTypes.string,
    bookings: propTypes.array,
}
