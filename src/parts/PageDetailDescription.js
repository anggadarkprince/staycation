import React from 'react';
import ReactHtmlParser from 'react-html-parser';

export default function PageDetailDescription({data}) {
    return (
        <main>
            <h4>About the place</h4>
            {ReactHtmlParser(data.description)}
            <div className="row mt-5">
                {data.facilities.map((facility, index) => {
                    return (
                        <div
                            key={`feature-${index}`}
                            className="col-6 col-md-4"
                            style={{marginBottom: 20}}>
                            <img width="38"
                                 className="d-block mb-2"
                                src={facility.imageUrl}
                                alt={facility.facility}/>
                            {" "}
                            <span>{facility.qty}</span>
                            {" "}
                            <span className="text-gray-500 font-weight-light">
                                {facility.facility}
                            </span>
                        </div>
                    );
                })}
            </div>
        </main>
    )
}

