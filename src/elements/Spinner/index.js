import React from "react";
import propTypes from "prop-types";

export default function Spinner(props) {
    return (
        <div className={props.className} style={props.style}>
            <div className="spinner-border text-primary">
                <span className="sr-only">Loading...</span>
            </div>
            {props.title ? <p className="h5 mt-2 mb-0">{props.title}</p> : ''}
            {props.subtitle ? <p className="text-gray-500">{props.subtitle}</p> : ''}
        </div>
    )
}

Spinner.propTypes = {
    title: propTypes.string,
    subtitle: propTypes.string,
    className: propTypes.string,
    style: propTypes.object,
}
