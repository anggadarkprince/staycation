import React, {Component} from 'react';
import Fade from 'react-reveal/Fade';
import Header from 'parts/Header';
import Button from 'elements/Button';
import Stepper, {Numbering, Meta, MainContent, Controller} from 'elements/Stepper';
import itemDetails from 'json/itemDetails';
import BookingInformation from "parts/Checkout/BookingInformation";
import Payment from "parts/Checkout/Payment";
import Completed from "parts/Checkout/Completed";
import {connect} from "react-redux";

class CheckoutPage extends Component {
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

    componentDidMount() {
        document.title = "Staycation | Checkout";
        window.scrollTo(0, 0);
    }

    onChange = (event) => {
        this.setState({
            data: {
                ...this.state.data,
                [event.target.name]: event.target.value
            }
        })
    }

    render() {
        const {data} = this.state;
        const {checkout} = this.props;

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
                        itemDetails={itemDetails}
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
                <Header isCentered {...this.props}></Header>
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
                                                            onClick={nextStep}>
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
    checkout: state.checkout
});
export default connect(mapStateToProps)(CheckoutPage);