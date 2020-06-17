import React from 'react';
import Fade from 'react-reveal/Fade';
import Button from "elements/Button";

export default function Categories({data}) {

    return data.map(category => {
        return (
            <Fade bottom>
                <section className="container" key={`category-${category.id}`}>
                    <p className="mb-3 font-weight-medium">
                        {category.name}
                    </p>
                    <div className="container-grid">
                        {
                            category.items.length === 0 ?
                                (
                                    <div className="row">
                                        <div className="col-auto align-items-center">
                                            There is no property at this category
                                        </div>
                                    </div>
                                )
                                :
                                category.items.map((item, itemIndex) => {
                                    return (
                                        <div className="item column-3 row-1" key={`category-item-${item._id}`}>
                                            <Fade bottom delay={180 * itemIndex}>
                                                <div className="card card-category">
                                                    {item.isPopular && (
                                                        <div className="tag">
                                                            Popular <span className="font-weight-light">Choice</span>
                                                        </div>
                                                    )}
                                                    <figure className="img-wrapper" style={{height: 180}}>
                                                        <img src={item.imageUrl} alt={item.name} className="img-cover"/>
                                                    </figure>
                                                    <div className="meta-wrapper">
                                                        <Button type="link" className="stretched-link link-text text-body" href={`/properties/${item._id}`}>
                                                            <h5>
                                                                {item.name}
                                                            </h5>
                                                        </Button>
                                                        <span className="text-gray-500">
                                                            {item.city}, {item.country}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Fade>
                                        </div>
                                    )
                                })
                        }
                    </div>
                </section>
            </Fade>
        )
    });
}

