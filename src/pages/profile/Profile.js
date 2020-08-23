import React, {Component} from 'react';
import BookingItem from "elements/BookingItem";
import {backToTop} from "utilities/scroller";

class Profile extends Component {

    componentDidMount() {
        document.title = "Staycation | Profile";
        backToTop();
    }

    render() {
        return (
            <>
                {
                    this.props.bookings.length > 0
                        ? <BookingItem title="Latest Bookings" bookings={this.props.bookings}/>
                        : <p className="text-gray-500">No outstanding booking available</p>
                }
            </>
        )
    }
}

export default Profile;
