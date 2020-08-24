import React from 'react';
import Fade from 'react-reveal/Fade';
import HeroImage from 'assets/img/hero-image.png';
import HeroImageBorder from 'assets/img/hero-image-border.png';
import IconCamera from 'assets/img/icons/ic_camera.svg';
import IconLocation from 'assets/img/icons/ic_location.svg';
import IconTraveler from 'assets/img/icons/ic_traveler.svg';
import Button from 'elements/Button';
import {numeric} from 'utilities/formatter';

export default function Hero(props) {
    function showMostPicked() {
        window.scrollTo({
            top: props.refMostPicked.current.offsetTop - 30,
            behavior: 'smooth'
        });
    }

    return (
        <Fade bottom>
            <section className='container pt-4'>
                <div className="row align-items-center">
                    <div className="col-md-6 pr-md-5">
                        <h1 className='font-weight-bolder mb-3' style={{letterSpacing: '1px'}}>
                            Forget Busy Work,<br/>Start Next Vacation
                        </h1>
                        <p className='mb-4 font-weight-light text-gray-500 w-75'>
                            We provide what you need to enjoy your holiday with family.
                            Time to make another memorable moments. Your money can
                            return, your time is not. What are you waiting for?
                        </p>
                        <Fade bottom delay={400}>
                            <Button className='btn btn-action px-5' hasShadow isPrimary onClick={showMostPicked}>
                                Show Me Now
                            </Button>
                        </Fade>
                        <div className="row mt-5 mr-4 mr-lg-5">
                            <div className="col-auto" style={{minWidth: 130}}>
                                <Fade bottom delay={500}>
                                    <img src={IconTraveler} alt={`${props.data.travelers} Traveler`}/>
                                    <h6 className='mt-3'>
                                        <p className='mb-0'>{numeric(props.data.travelers)}</p>
                                        <span className="text-gray-500 font-weight-light">
                                            Travelers
                                        </span>
                                    </h6>
                                </Fade>
                            </div>
                            <div className="col-auto" style={{minWidth: 130}}>
                                <Fade bottom delay={700}>
                                    <img src={IconCamera} alt={`${props.data.treasures} Treasures`}/>
                                    <h6 className='mt-3'>
                                        <p className='mb-0'>{numeric(props.data.treasures)}</p>
                                        <span className="text-gray-500 font-weight-light">
                                            Treasures
                                        </span>
                                    </h6>
                                </Fade>
                            </div>
                            <div className="col-auto" style={{minWidth: 130}}>
                                <Fade bottom delay={900}>
                                    <img src={IconLocation} alt={`${props.data.cities} Cities`}/>
                                    <h6 className='mt-3'>
                                        <p className='mb-0'>{numeric(props.data.cities)}</p>
                                        <span className="text-gray-500 font-weight-light">
                                            Destinations
                                        </span>
                                    </h6>
                                </Fade>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 pr-md-4">
                        <Fade bottom delay={200}>
                            <div style={{width: 520, height: 410}} className='position-relative pt-4 pb-3'>
                                <img className='img-fluid position-absolute' src={HeroImageBorder} alt="Hero border" style={{margin: '0 -15px -15px 0'}}/>
                                <img className='img-fluid position-absolute' src={HeroImage} alt="Hero" style={{margin: '-30px 0 0 -30px', zIndex: 1, borderRadius: '150px 15px 15px 15px'}}/>
                            </div>
                        </Fade>
                    </div>
                </div>
            </section>
        </Fade>
    )
}
