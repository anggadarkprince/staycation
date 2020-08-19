import React, {Component} from 'react';
import BookingItem from "elements/BookingItem";
import {backToTop} from "utilities/scroller";

class Outstanding extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        document.title = "Staycation | Booking Outstanding";
        backToTop();
    }

    render() {
        return (
            <>
                <BookingItem title="Outstanding" bookings={this.props.bookings}/>
            </>
        )
    }
}

export default Outstanding;
