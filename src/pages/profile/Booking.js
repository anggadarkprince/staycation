import React, {Component} from 'react';
import BookingItem from "elements/BookingItem";
import {backToTop} from "utilities/scroller";

class Booking extends Component {

    componentDidMount() {
        document.title = "Staycation | All Booking";
        backToTop();
    }

    render() {
        return (
            <>
                {
                    this.props.bookings.length > 0
                        ? <BookingItem title="Booking History" bookings={this.props.bookings}/>
                        : <p className="text-gray-500">No booking available</p>
                }
            </>
        )
    }
}

export default Booking;
