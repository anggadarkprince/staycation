import React, {Component} from 'react';
import BookingItem from "../../elements/BookingItem";

class Outstanding extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        document.title = "Staycation | Booking Outstanding";
        window.scrollTo(0, 0);
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
