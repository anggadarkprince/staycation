import React, {useEffect} from "react";
import Fade from "react-reveal/Fade";
import {backToTop} from "utilities/scroller";

export default props => {
    useEffect(() => {
        document.title = "Staycation | Careers";
        backToTop();
    });

    return (
        <>
            <div className="container mb-5">
                <Fade bottom>
                    <div className="text-center mb-5">
                        <h1 className="mb-3">Careers</h1>
                        <h5 className="text-primary">Find your next job at Staycation.</h5>
                        <p className="text-gray-500">What do you want to do?</p>
                    </div>
                </Fade>

                <div className="row mb-4">
                    <div className="col-md-4">
                        <Fade bottom delay={100}>
                            <h4>Dynamic Collaborative</h4>
                            <p>
                                Every day you will get the opportunity to collaborate with great people who all have
                                diverse talents and experiences that contributes something unique.
                            </p>
                        </Fade>
                    </div>
                    <div className="col-md-4">
                        <Fade bottom delay={300}>
                            <h4>Advance Training Program</h4>
                            <p>
                                We provides a training program and facilities that can help you grow, innovate and achieve
                                your performance that meets company goal.
                            </p>
                        </Fade>
                    </div>
                    <div className="col-md-4">
                        <Fade bottom delay={600}>
                            <h4>Internship & Professional</h4>
                            <p>
                                We invite people with professional skill and strong motivation as well as students to be
                                our apprentice to grow together in a dynamic organization.
                            </p>
                        </Fade>
                    </div>
                </div>

                <Fade bottom delay={800}>
                    <h3 className="text-primary">Open Positions</h3>

                    <p className="lead">
                        Are you looking for an internship, graduate opportunities, or a job opening to progress your professional career?<br/>
                        We invite you to share your dreams with us. You’ll have opportunities to explore and learn new things with the company.
                    </p>
                </Fade>

                <ul className="list-group list-group-flush">
                    <Fade bottom delay={1000}>
                        <li className="list-group-item">
                            <h5>Marketing Executive</h5>
                            <div className="d-flex">
                                <div className="mb-3 flex-grow-1 pr-3">
                                    <ul className="pl-3">
                                        <li>Conceiving and developing efficient and intuitive marketing strategies</li>
                                        <li>Organizing and oversee advertising/communication campaigns (social media, TV etc.), exhibitions and promotional events</li>
                                        <li>Conducting market research and analysis to evaluate trends, brand awareness and competition ventures</li>
                                    </ul>
                                </div>
                                <button className="btn btn-primary mb-2 align-self-start flex-shrink-0">Apply Now</button>
                            </div>
                        </li>
                    </Fade>
                    <Fade bottom delay={300}>
                        <li className="list-group-item">
                            <h5>General Manager HRD</h5>
                            <div className="d-flex">
                                <div className="mb-3 flex-grow-1 pr-3">
                                    <ul className="pl-3">
                                        <li>Strong Communication and Documentation skills in English</li>
                                        <li>Knowledge of Hindi and Gujarati will be preferred</li>
                                        <li>Experience in Govt. Sector (PSU), Social Sector will be preferred</li>
                                    </ul>
                                </div>
                                <button className="btn btn-primary mb-2 align-self-start flex-shrink-0">Apply Now</button>
                            </div>
                        </li>
                    </Fade>
                    <Fade bottom delay={500}>
                        <li className="list-group-item">
                            <h5>Finance & Accounting</h5>
                            <div className="d-flex">
                                <div className="mb-3 flex-grow-1 pr-3">
                                    <ul className="pl-3">
                                        <li>Strong Communication and Documentation skills in English</li>
                                        <li>Knowledge of Hindi and Gujarati will be preferred</li>
                                        <li>Experience in Govt. Sector (PSU), Social Sector will be preferred</li>
                                    </ul>
                                </div>
                                <button className="btn btn-primary mb-2 align-self-start flex-shrink-0">Apply Now</button>
                            </div>
                        </li>
                    </Fade>
                </ul>
            </div>
        </>
    )
};
