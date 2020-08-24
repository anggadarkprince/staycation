import React from 'react';
import Fade from 'react-reveal/Fade';
import {InputText} from "elements/Forms";
import {numeric} from "utilities/formatter";

export default function BookingInformation(props) {
    const {data, itemDetails, checkout} = props;

    return (
        <Fade>
            <div className="container mb-4">
                <div className="row justify-content-center align-items-center">
                    <div className="col-5 border-right py-5 pr-5">
                        <Fade delay={200}>
                            <div className="card border-0">
                                <figure className="img-wrapper" style={{height: 270}}>
                                    <img className="img-cover"
                                        src={itemDetails.imageId[0].imageUrl}
                                         alt={itemDetails.title}/>
                                </figure>
                                <div className="row align-items-center mt-3">
                                    <div className="col">
                                        <div className="meta-wrapper mt-0">
                                            <h5>{itemDetails.title}</h5>
                                            <span className="text-gray-500">
                                                {itemDetails.city}, {itemDetails.country}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-auto">
                                        <span>
                                            {numeric(+checkout.duration * itemDetails.price)}
                                            <span className="text-gray-500"> per </span>
                                            {checkout.duration} night{+checkout.duration > 1 ? "s" : ""}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Fade>
                    </div>
                    <div className="col-5 py-5 pl-5">
                        <Fade delay={400}>
                            <label htmlFor="name">Name</label>
                            <InputText id="name" name="name" value={data.name} onChange={props.onChange}/>

                            <label htmlFor="email">Email Address</label>
                            <InputText id="email" name="email" type="email" value={data.email} onChange={props.onChange}/>

                            <label htmlFor="phone">Phone Number</label>
                            <InputText id="phone" name="phone" type="tel" value={data.phone} onChange={props.onChange}/>

                            <label htmlFor="address">Address</label>
                            <InputText id="address" name="address" value={data.address} onChange={props.onChange}/>

                            <label htmlFor="description">Booking Note</label>
                            <div className="input-text mb-3">
                                <div className="input-group">
                                    <textarea className="form-control" id="description" name="description" placeholder="Add note for this booking"
                                              value={data.description} onChange={props.onChange}/>
                                </div>
                            </div>
                        </Fade>
                    </div>
                </div>
            </div>
        </Fade>
    );
}

