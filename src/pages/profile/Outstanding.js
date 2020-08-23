import React, {Component} from 'react';
import BookingItem from "elements/BookingItem";
import {backToTop} from "utilities/scroller";

class Outstanding extends Component {

    componentDidMount() {
        document.title = "Staycation | Booking Outstanding";
        backToTop();
    }

    render() {
        return (
            <>
                {
                    this.props.bookings.length > 0
                        ? <BookingItem title="Outstanding" bookings={this.props.bookings} withDetail/>
                        : <p className="text-gray-500">No outstanding booking available</p>
                }
            </>
        )
    }
}

export default Outstanding;
