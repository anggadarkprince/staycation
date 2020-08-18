import React, {Component} from 'react';
import BookingItem from "elements/BookingItem";

class Profile extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        document.title = "Staycation | Profile";
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

export default Profile;
