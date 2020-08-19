import React, {Component} from 'react';
import BookingItem from "elements/BookingItem";
import {backToTop} from "utilities/scroller";

class Profile extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        document.title = "Staycation | Profile";
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

export default Profile;
