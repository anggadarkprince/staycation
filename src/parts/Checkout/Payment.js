import React, {Component} from 'react';
import Fade from 'react-reveal/Fade';
import {InputText, InputFile} from "elements/Forms";
import axios from 'axios';
import moment from 'moment';
import config from "config";
import {numeric} from "utilities/formatter";

export default class Payment extends Component {
    state = {
        isLoading: true,
        banks: []
    }

    componentDidMount() {
        axios.get(`${config.apiUrl}/api/banks`)
            .then(response => response.data)
            .then(banks => {
                this.setState({isLoading: false, banks: banks});
            })
            .catch(error => {
                console.log(error);
            });
    }

    render() {
        const {booking, data, checkout} = this.props;
        const tax = 10;
        const subTotal = checkout.price * checkout.duration;
        const grandTotal = subTotal + (subTotal * tax / 100);

        return !this.state.isLoading && (
            <Fade>
                <div className="container mb-4">
                    <div className="row justify-content-center align-items-center">
                        <div className="col-5 border-right py-5 pr-5">
                            <Fade delay={300}>
                                <div className="my-4">
                                    <h5>Booking</h5>
                                    <p className="mb-1">{booking.item.title}</p>
                                    <p className="mb-1">
                                        {moment(booking.bookingStartDate).format('DD MMM Y')} - {moment(booking.bookingEndDate).format('DD MMM Y')}
                                    </p>
                                </div>
                                <div className="my-4">
                                    <h5>Transfer Detail</h5>
                                    <p className="mb-1">Tax: {tax}%</p>
                                    <p className="mb-1">Sub total: {numeric(subTotal)}</p>
                                    <p>Total: {numeric(grandTotal)}</p>
                                </div>
                                {
                                    this.state.banks.map(bank => (
                                        <div className="row">
                                            <div className="col-3 text-right">
                                                <img src={bank.logo} alt={bank.bank} width={60}/>
                                            </div>
                                            <div className="col">
                                                <dl>
                                                    <dd className="font-weight-medium">{bank.accountHolder}</dd>
                                                    <dd className="mb-0">{bank.accountNumber}</dd>
                                                    <dd>{bank.bank}</dd>
                                                </dl>
                                            </div>
                                        </div>
                                    ))
                                }
                            </Fade>
                        </div>
                        <div className="col-5 py-5 pl-5">
                            <Fade delay={600}>
                                <label htmlFor="bank">Transfer Bank To</label>
                                <div className="input-text mb-3">
                                    <div className="input-group">
                                        <select name="bank" id="bank" required className="custom-select" onChange={this.props.onChange}>
                                            <option value="">Select bank</option>
                                            {this.state.banks.map(bank => <option key={bank._id} value={bank._id}>{bank.bank}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <label htmlFor="proofPayment">Upload Transfer Receipt</label>
                                <InputFile accept="image/*" id="proofPayment" name="proofPayment" value={data.proofPayment} onChange={this.props.onChange}/>

                                <label htmlFor="bankName">From Bank</label>
                                <InputText id="bankName" name="bankName" isRequired value={data.bankName} onChange={this.props.onChange}/>

                                <label htmlFor="bankHolder">Account Name</label>
                                <InputText id="bankHolder" name="bankHolder" isRequired value={data.bankHolder} onChange={this.props.onChange}/>

                                <label htmlFor="bankNumber">Account Number</label>
                                <InputText id="bankNumber" name="bankNumber" isRequired value={data.bankNumber} onChange={this.props.onChange}/>
                            </Fade>
                        </div>
                    </div>
                </div>
            </Fade>
        );
    }
}

