import React from "react";
import propTypes from 'prop-types';
import './index.scss';

export default function Star({className, value, size, spacing}) {
    const decimals = Number(value) % 1;
    const stars = [];
    let leftPosition = 0;
    for (let index = 0; index < 5 && index < value - decimals; index++) {
        stars.push(
            <div className="star" key={`star-${index}`}
                 style={{left: leftPosition, width: size, height: size, maskSize: size}}></div>
        )
        leftPosition += size + spacing;
    }

    if (decimals > 0 && value <= 5) {
        stars.push((
            <div className="star" key={`star-decimal`}
                 style={{left: leftPosition, width: decimals * size, height: size, maskSize: size}}></div>
        ));
    }

    const starPlaceholders = [];
    for (let index = 0; index < 5; index++) {
        starPlaceholders.push(
            <div className="star star-placeholder" key={`star-${index}`}
                 style={{left: index * (size + spacing), width: size, height: size, maskSize: size}}></div>
        )
    }

    return <>
            <div className={['stars', className].join(' ')} style={{height: size}}>
                {starPlaceholders}
                {stars}
            </div>
        </>
}

Star.propTypes = {
    className: propTypes.string,
    value: propTypes.number,
    size: propTypes.number,
    spacing: propTypes.number,
}
