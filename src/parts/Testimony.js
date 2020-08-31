import React from 'react';
import Fade from 'react-reveal/Fade';
import Star from "elements/Star";
import TestimonyFrame from "../assets/img/testimonial-landing-page-frame.png";
import Button from "elements/Button";

export default function Testimony({data}) {

    return (
        <Fade bottom>
            <section className="container">
                <div className="row align-items-center">
                    <div className="col-auto mr-5">
                        <div className="testimonial-hero">
                            <img className="position-absolute testimonial-frame" src={TestimonyFrame} alt="Testimonial frame"/>
                            <img className="position-absolute testimonial-photo" src={data.imageUrl} alt="Testimonial"/>
                        </div>
                    </div>
                    <div className="col">
                        <Fade bottom delay={200}>
                            <h4 className="testimonial-name">{data.title}</h4>
                            <Star value={data.rating} size={35} spacing={10}/>
                        </Fade>
                        <Fade bottom delay={350}>
                            <h5 className="h2 font-weight-light my-3">
                                {data.content}
                            </h5>
                            <p className="text-gray-500">
                                {data.name} <span className="mx-2">•</span> {data.occupation}
                            </p>
                        </Fade>
                        <Fade bottom delay={500}>
                            <Button className="btn-read-more btn btn-action px-5" hasShadow isPrimary type="link" href='/explore'>
                                Explore Your Stories
                            </Button>
                        </Fade>
                    </div>
                </div>
            </section>
        </Fade>
    );
}

