import React, {Component} from 'react';
import Fade from 'react-reveal/Fade';
import Button from 'elements/Button';
import Stepper, {Numbering, Meta, MainContent, Controller} from 'elements/Stepper';
import BookingInformation from "parts/Checkout/BookingInformation";
import Payment from "parts/Checkout/Payment";
import Completed from "parts/Checkout/Completed";
import {connect} from "react-redux";
import {submitBooking, submitPayment} from 'store/actions/checkout';
import AuthContext from 'contexts/AuthContext';

class CheckoutPage extends Component {
    static contextType = AuthContext;
    state = {
        isSubmitting: false,
        booking: this.props.checkout?.booking || null,
        data: {
            name: this.context.user.name,
            email: this.context.user.email,
            phone: this.context.user.member?.phoneNumber || '',
            address: this.context.user.member?.address || '',
            bank: "",
            description: "",
            proofPayment: "",
            bankName: "",
            bankHolder: "",
            bankNumber: "",
        }
    }

    constructor(props, context) {
        super(props, context);
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

    onSubmitBooking = (nextStep) => {
        this.setState({isSubmitting: true}, () => {
            const payload = {
                itemId: this.props.checkout._id,
                bookingStartDate: this.props.checkout.date.startDate,
                bookingEndDate: this.props.checkout.date.endDate,
                description: this.state.data.description,
            }
            this.props.submitBooking(payload).then(response => {
                this.setState({
                    booking: response.data.booking,
                    isSubmitting: false
                }, nextStep);
            }).catch(error => {
                console.log(error);
            });
        });
    }

    onSubmitPayment = (nextStep) => {
        this.setState({isSubmitting: true}, () => {
            const payload = new FormData();
            payload.append('bookingId', this.state.booking._id);
            payload.append('bankId', this.state.data.bank);
            payload.append('bankFrom', this.state.data.bankName);
            payload.append('accountNumber', this.state.data.bankNumber);
            payload.append('accountHolder', this.state.data.bankHolder);
            payload.append('image', this.state.data.proofPayment[0]);
            this.props.submitPayment(payload).then(() => {
                this.setState({
                    isSubmitting: false
                }, nextStep);
            }).catch(error => {
                console.log(error);
            });
        });
    }

    render() {
        const {data, booking} = this.state;
        const {checkout, page, checkoutState} = this.props;

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
                content: <BookingInformation data={data} checkout={checkout} itemDetails={page} onChange={this.onChange} />
            },
            payment: {
                title: "Payment",
                description: "Kindly follow the instruction bellow",
                content: <Payment booking={booking} data={data} checkout={checkout} onChange={this.onChange} />
            },
            completed: {
                title: "Yay! Completed",
                description: "Your booking is completed, we will email you later",
                content: <Completed/>
            },
        }

        return (
            <>
                <Stepper steps={steps} initialStep={checkoutState}>
                    {
                        (prevStep, nextStep, currentStep, steps) => (
                            <>
                                <Numbering data={steps} current={currentStep}/>
                                <Meta data={steps} current={currentStep}/>
                                <MainContent data={steps} current={currentStep}/>
                                {
                                    currentStep === "bookingInformation" && (
                                        <Controller>
                                            {
                                                data.name !== "" && data.address !== "" && data.email !== "" && data.phone !== "" && (
                                                    <Fade>
                                                        <Button className="btn btn-action mb-3" type="button" isBlock isPrimary hasShadow
                                                                isLoading={this.state.isSubmitting}
                                                                onClick={() => this.onSubmitBooking(nextStep)}>
                                                            Checkout Booking
                                                        </Button>
                                                    </Fade>
                                                )
                                            }

                                            <Button className="btn" type="link" isBlock isLight href={`/properties/${page._id}`}>
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
                                                        <Button className="btn btn-action mb-3" type="button" isBlock isPrimary hasShadow
                                                                isLoading={this.state.isSubmitting}
                                                                onClick={() => this.onSubmitPayment(nextStep)}>
                                                            Completing Booking
                                                        </Button>
                                                    </Fade>
                                                )
                                            }
                                            <Button className="btn" type="link" isBlock isLight href="/profile/outstanding">
                                                Back to Booking
                                            </Button>
                                        </Controller>
                                    )
                                }

                                {
                                    currentStep === "completed" && (
                                        <Controller>
                                            <Button className="btn btn-action" type="link" isBlock isPrimary href="/profile">
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
    page: state.page.detailPage,
    checkoutState: state.checkoutState
});
export default connect(mapStateToProps, {submitBooking, submitPayment})(CheckoutPage);
