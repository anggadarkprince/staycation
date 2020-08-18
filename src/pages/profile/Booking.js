import React, {Component} from 'react';
import BookingItem from "../../elements/BookingItem";

class Booking extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        document.title = "Staycation | All Booking";
        window.scrollTo(0, 0);
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
