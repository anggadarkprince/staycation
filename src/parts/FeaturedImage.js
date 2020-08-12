import React from 'react';
import Fade from 'react-reveal/Fade';

export default function FeaturedImage({data}) {
    return (
        <section className="container">
            <div className="container-grid grid-sm">
                {data.map((item, index) => {
                    return (
                        <div
                            key={`featured-image-${index}`}
                            className={`item ${index > 0 ? 'column-5' : 'column-7'} ${index > 0 ? 'row-1' : 'row-2'}`}>
                            <Fade bottom delay={300 * index}>
                                <div className="card card-featured h-100">
                                    <div className="img-wrapper">
                                        <img src={item.imageUrl} alt={item._id} className="img-cover"/>
                                    </div>
                                </div>
                            </Fade>
                        </div>
                    );
                })}
            </div>
        </section>
    )
}

