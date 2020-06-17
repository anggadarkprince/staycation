import React from 'react';
import Fade from 'react-reveal/Fade';
import Button from "../elements/Button";

export default function MostPicked(props) {

    return (
        <section className='container' ref={props.refMostPicked}>
            <Fade bottom>
                <h4 className='mb-3'>Most Picked</h4>
                <div className="container-grid">
                    {
                        props.data.map((item, index) => {
                            return (
                                <div key={item._id} className={`item column-4 ${index === 0 ? 'row-2' : 'row-1'}`}>
                                    <Fade bottom delay={300 * index}>
                                        <div className="card card-featured">
                                            <figure className="img-wrapper">
                                                <img className="img-cover" src={item.imageUrl} alt={item.name}/>
                                            </figure>
                                            <div className="tag">
                                                ${item.price}
                                                <span className="font-weight-light ml-1">
                                            per {item.unit}
                                        </span>
                                            </div>
                                            <div className="meta-wrapper">
                                                <Button type="link" className="stretched-link link-text link-primary text-white" href={`/properties/${item._id}`}>
                                                    <h5>{item.name}</h5>
                                                </Button>
                                                <span>{item.city}, {item.country}</span>
                                            </div>
                                        </div>
                                    </Fade>
                                </div>
                            )
                        })
                    }
                </div>
            </Fade>
        </section>
    )
}