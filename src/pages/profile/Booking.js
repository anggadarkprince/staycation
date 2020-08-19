import React, {Component} from 'react';
import BookingItem from "elements/BookingItem";
import {backToTop} from "utilities/scroller";

class Booking extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        document.title = "Staycation | All Booking";
        backToTop();
    }

    render() {
        return (
            <>
                <BookingItem title="Booking History" bookings={this.props.bookings}/>
            </>
        )
    }
}

export default Booking;
