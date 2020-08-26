import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import propTypes from 'prop-types';
import Button from 'elements/Button';
import {InputNumber, InputDate} from "elements/Forms";
import {numeric} from "utilities/formatter";
import AuthContext from "../contexts/AuthContext";

class BookingForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {
                duration: 1,
                date: {
                    startDate: new Date(),
                    endDate: new Date(),
                    key: 'selection'
                }
            }
        }
    }

    updateData = e => {
        this.setState({
            ...this.state,
            data: {
                ...this.state.data,
                [e.target.name]: e.target.value
            }
        });
    };

    componentDidUpdate(prevProps, prevState) {
        const {data} = this.state;
        if (prevState.data.date !== data.date) {
            const startDate = new Date(data.date.startDate);
            const endDate = new Date(data.date.endDate);
            const countDuration = new Date(endDate - startDate).getDate();
            this.setState({
                data: {
                    ...this.state.data,
                    duration: countDuration
                }
            })
        }


        if (prevState.data.duration !== data.duration) {
            const startDate = new Date(data.date.startDate);
            const endDate = new Date(
                startDate.setDate(startDate.getDate() + +data.duration - 1)
            );
            this.setState({
                ...this.state,
                data: {
                    ...this.state.data,
                    date: {
                        ...this.state.data.date,
                        endDate: endDate
                    }
                }
            })
        }
    }

    startBooking = () => {
        const {data} = this.state;
        this.props.startBooking({
            _id: this.props.itemDetails._id,
            price: this.props.itemDetails.price,
            duration: data.duration,
            date: {
                startDate: data.date.startDate,
                endDate: data.date.endDate
            }
        });
        this.props.checkoutState('bookingInformation');
        this.props.history.push('/checkout')
    }

    render() {
        const {data} = this.state;
        const {itemDetails} = this.props;
        return (
            <div className="card h-auto p-5">
                <h4 className="mb-3">Start Booking</h4>
                <h5 className="h2 text-teal mb-4">
                    {itemDetails.currencySymbol} {numeric(itemDetails.price)}
                    {" "}
                    <span className="text-gray-500 font-weight-light small">
                        / night
                    </span>
                </h5>
                <label htmlFor="duration">
                    How long you will stay?
                </label>
                <InputNumber
                    max={30}
                    suffix={" night"}
                    suffixPlural={" nights"}
                    onChange={this.updateData}
                    name="duration"
                    value={data.duration}/>
                <label htmlFor="date">
                    Pick a date
                </label>
                <InputDate
                    onChange={this.updateData}
                    name="date"
                    value={data.date}/>

                <h6 className="text-gray-500 font-weight-light mb-4">
                    You will pay
                    {" "}
                    <span className="text-body font-weight-normal">
                        {itemDetails.currencySymbol} {numeric(itemDetails.price * data.duration)}
                    </span>
                    {" "}
                    per
                    {" "}
                    <span className="text-body font-weight-normal">
                        {data.duration} night
                    </span>
                </h6>
                <AuthContext.Consumer>
                    {
                        auth => {
                            return auth.user ?
                                <Button className="btn btn-action" hasShadow isPrimary isBlock onClick={this.startBooking}>
                                    Start Booking
                                </Button>
                                :
                                <Button type="link" className="btn btn-action" hasShadow isPrimary isBlock href={`/login?redirect=${window.location.pathname}`}>
                                    Login to Booking
                                </Button>
                        }
                    }
                </AuthContext.Consumer>
            </div>
        );
    }
}

BookingForm.propTypes = {
    itemDetails: propTypes.object,
    startBooking: propTypes.func
}

export default withRouter(BookingForm);
