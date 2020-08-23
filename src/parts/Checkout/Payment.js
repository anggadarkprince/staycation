import React from 'react';
import Fade from 'react-reveal/Fade';
import logoBCA from 'assets/img/banks/bank-bca.png';
import logoMandiri from 'assets/img/banks/bank-mandiri.png';
import {InputText, InputFile} from "elements/Forms";

export default function Payment(props) {
    const {data, itemDetails, checkout} = props;
    const tax = 10;
    const subTotal = itemDetails.price * checkout.duration;
    const grandTotal = subTotal + (subTotal * tax / 100);

    return (
        <Fade>
            <div className="container mb-4">
                <div className="row justify-content-center align-items-center">
                    <div className="col-5 border-right py-5 pr-5">
                        <Fade delay={300}>
                            <div className="my-4">
                                <h5>Transfer Detail</h5>
                                <p>Tax: {tax}%</p>
                                <p>Sub total: {subTotal}</p>
                                <p>Total: {grandTotal}</p>
                            </div>
                            <div className="row">
                                <div className="col-3 text-right">
                                    <img src={logoBCA} alt="BCA" width={60}/>
                                </div>
                                <div className="col">
                                    <dl>
                                        <dd>Bank Central Asia</dd>
                                        <dd>2208 1996</dd>
                                        <dd>Staycation</dd>
                                    </dl>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-3 text-right">
                                    <img src={logoMandiri} alt="Mandiri" width={60}/>
                                </div>
                                <div className="col">
                                    <dl>
                                        <dd>Bank Mandiri</dd>
                                        <dd>2208 1996</dd>
                                        <dd>Staycation</dd>
                                    </dl>
                                </div>
                            </div>
                        </Fade>
                    </div>
                    <div className="col-5 py-5 pl-5">
                        <Fade delay={600}>
                            <label htmlFor="proofPayment">Upload Transfer Receipt</label>
                            <InputFile
                                accept="image/*"
                                id="proofPayment"
                                name="proofPayment"
                                value={data.proofPayment}
                                onChange={props.onChange}/>

                            <label htmlFor="bankName">From Bank</label>
                            <InputText
                                id="bankName"
                                name="bankName"
                                value={data.bankName}
                                onChange={props.onChange}/>

                            <label htmlFor="bankHolder">Account Name</label>
                            <InputText
                                id="bankHolder"
                                name="bankHolder"
                                value={data.bankHolder}
                                onChange={props.onChange}/>

                            <label htmlFor="bankNumber">Account Number (optional)</label>
                            <InputText
                                id="bankNumber"
                                name="bankNumber"
                                value={data.bankNumber}
                                onChange={props.onChange}/>
                        </Fade>
                    </div>
                </div>
            </div>
        </Fade>
    );
}

