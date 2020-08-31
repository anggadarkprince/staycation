import React, {useState, useEffect} from "react";
import propTypes from 'prop-types';
import './index.scss';

export default function Star({className, value, size, spacing, isInput = false, inputName = "rating", onStarChanged = () => {}}) {

    const [star, setStar] = useState(value);

    function onStarClicked(currentStar) {
        if (isInput) {
            setStar(currentStar);
            onStarChanged({
                target: {
                    name: inputName,
                    value: currentStar
                }
            })
        }
    }

    useEffect(() => {
        setStar(value);
    }, [value])

    function generateStar(generateStar) {
        let leftPosition = 0;
        const decimals = Number(value) % 1;
        const stars = [];

        for (let index = 0; index < 5 && index < generateStar - decimals; index++) {
            stars.push(
                <div className="star" key={`star-${index}`} onClick={() => onStarClicked(index + 1)}
                     style={{left: leftPosition, width: size, height: size, maskSize: size, cursor: isInput ? 'pointer' : 'default'}}></div>
            )
            leftPosition += size + spacing;
        }

        if (decimals > 0 && generateStar <= 5) {
            stars.push((
                <div className="star" key={`star-decimal`}
                     style={{left: leftPosition, width: decimals * size, height: size, maskSize: size, cursor: isInput ? 'pointer' : 'default'}}></div>
            ));
        }

        return stars;
    }

    const starPlaceholders = [];
    for (let index = 0; index < 5; index++) {
        starPlaceholders.push(
            <div className="star star-placeholder" key={`star-${index}`} onClick={() => onStarClicked(index + 1)}
                 style={{left: index * (size + spacing), width: size, height: size, maskSize: size, cursor: isInput ? 'pointer' : 'default'}}></div>
        )
    }

    return <>
            <div className={['stars', className].join(' ')} style={{height: size, minWidth: (size * 5) + ((spacing + 1) * 4)}}>
                {starPlaceholders}
                {generateStar(star)}
            </div>
        </>
}

Star.defaultProps = {
    isInput: false,
    inputName: 'rating',
    onStarChanged: () => {},
    value: 0,
    size: 20,
    spacing: 10,
}

Star.propTypes = {
    className: propTypes.string,
    value: propTypes.number,
    size: propTypes.number,
    spacing: propTypes.number,
    isInput: propTypes.bool,
    inputName: propTypes.string,
    onStarChanged: propTypes.func,
}
