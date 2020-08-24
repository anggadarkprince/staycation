import React, {Component} from 'react';
import Fade from 'react-reveal/Fade';
import Button from 'elements/Button';
import Stepper, {Numbering, Meta, MainContent, Controller} from 'elements/Stepper';
import itemDetails from 'json/itemDetails';
import BookingInformation from "parts/Checkout/BookingInformation";
import Payment from "parts/Checkout/Payment";
import Completed from "parts/Checkout/Completed";
import {connect} from "react-redux";
import {submitBooking} from 'store/actions/checkout';
import AuthContext from 'AuthContext';

class CheckoutPage extends Component {
    static contextType = AuthContext;
    state = {
        data: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            proofPayment: "",
            bankName: "",
            bankHolder: "",
            bankNumber: "",
        }
    }

    constructor(props) {
        super(props);
        props.onChangeLayout('checkout');
    }

    componentDidMount() {
        document.title = "Staycation | Checkout";
        window.scrollTo(0, 0);
    }
    
    componentWillUnmount() {
        this.props.onChangeLayout('landing');
    }

    onChange = (event) => {
        this.setState({
            data: {
                ...this.state.data,
                [event.target.name]: event.target.value
            }
        })
    }

    onSubmit = (nextStep) => {
        const payload = new FormData();
        //payload.append('firstName', this.state.data.firstName);
        //payload.append('lastName', this.state.data.lastName);
        //payload.append('email', this.state.data.email);
        //payload.append('phoneNumber', this.state.data.phone);
        payload.append('userId', this.context.user._id);
        payload.append('itemId', this.props.checkout._id);
        payload.append('bankId', '5f071ebc0e2d63512a0a644d');
        payload.append('bookingStartDate', this.props.checkout.date.startDate);
        payload.append('bookingEndDate', this.props.checkout.date.endDate);
        payload.append('bankFrom', this.state.data.bankName);
        payload.append('accountNumber', this.state.data.bankNumber);
        payload.append('accountHolder', this.state.data.bankHolder);
        payload.append('image', this.state.data.proofPayment[0]);
        this.props.submitBooking(payload).then(() => {
            nextStep();
        }).catch(error => {
            console.log(error);
        });
    }

    render() {
        const {data} = this.state;
        const {checkout, page} = this.props;

        if (!checkout) {
            return (
                <div className="container">
                    <div className="row align-items-center justify-content-center text-center" style={{height: '100vh'}}>
                        <div className="col-6 col-md-4">
                            <h5>Ops, something went wrong!</h5>
                            <p>Select the Accommodation</p>
                            <Button className="btn mt-5" type="link" href="/" isLight>
                                Back
                            </Button>
                        </div>
                    </div>
                </div>
            )
        }

        const steps = {
            bookingInformation: {
                title: "Booking Information",
                description: "Please fill up the blank fields bellow",
                content: (
                    <BookingInformation
                        data={data}
                        checkout={checkout}
                        itemDetails={page}
                        onChange={this.onChange}
                    />
                )
            },
            payment: {
                title: "Payment",
                description: "Kindly follow the instruction bellow",
                content: (
                    <Payment
                        data={data}
                        checkout={checkout}
                        itemDetails={itemDetails}
                        onChange={this.onChange}
                    />
                )
            },
            completed: {
                title: "Yay! Completed",
                description: "Your booking is completed, we will email you later",
                content: (
                    <Completed/>
                )
            },
        }
        return (
            <>
                <Stepper steps={steps}>
                    {
                        (prevStep, nextStep, currentStep, steps) => (
                            <>
                                <Numbering
                                    data={steps}
                                    current={currentStep}/>

                                <Meta data={steps} current={currentStep}/>
                                <MainContent data={steps} current={currentStep}/>
                                {
                                    currentStep === "bookingInformation" && (
                                        <Controller>
                                            {
                                                data.firstName !== "" && data.lastName !== "" && data.email !== "" && data.phone !== "" && (
                                                    <Fade>
                                                        <Button
                                                            className="btn btn-action mb-3"
                                                            type="button"
                                                            isBlock
                                                            isPrimary
                                                            hasShadow
                                                            onClick={nextStep}>
                                                            Continue to Book
                                                        </Button>
                                                    </Fade>
                                                )
                                            }

                                            <Button
                                                className="btn"
                                                type="link"
                                                isBlock
                                                isLight
                                                href={`/properties/${itemDetails._id}`}>
                                                Cancel
                                            </Button>
                                        </Controller>
                                    )
                                }

                                {
                                    currentStep === "payment" && (
                                        <Controller>
                                            {
                                                data.proofPayment !== "" && data.bankName !== "" && data.bankHolder !== "" && (
                                                    <Fade>
                                                        <Button
                                                            className="btn btn-action mb-3"
                                                            type="button"
                                                            isBlock
                                                            isPrimary
                                                            hasShadow
                                                            onClick={() => this.onSubmit(nextStep)}>
                                                            Completing Booking
                                                        </Button>
                                                    </Fade>
                                                )
                                            }

                                            <Button
                                                className="btn"
                                                type="button"
                                                isBlock
                                                isLight
                                                onClick={nextStep}>
                                                Cancel
                                            </Button>
                                        </Controller>
                                    )
                                }

                                {
                                    currentStep === "completed" && (
                                        <Controller>
                                            <Button
                                                className="btn btn-action"
                                                type="link"
                                                isBlock
                                                isPrimary
                                                href="/">
                                                Back To Home
                                            </Button>
                                        </Controller>
                                    )
                                }
                            </>
                        )
                    }
                </Stepper>
            </>
        );
    }
}

const mapStateToProps = (state) => ({
    checkout: state.checkout,
    page: state.page.detailPage
});
export default connect(mapStateToProps, {submitBooking})(CheckoutPage);