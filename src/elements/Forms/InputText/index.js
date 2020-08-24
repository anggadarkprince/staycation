import React, {useState} from "react";
import propTypes from 'prop-types';
import './index.scss';

export default function Text(props) {
    const {value, type, placeholder, name, isRequired, prepend, append, outerClassName, inputClassName, errorResponse} = props;

    const [hasError, setHasError] = useState(null);
    let pattern = "";
    if (type === "email") pattern = /^[^\s@]+@[^\s@].[^\s@]+$/;
    if (type === "tel") pattern = /[^0-9]+/;

    const onChange = (event) => {
        const target = {
            target: {
                name: name,
                value: event.target.value
            }
        }
        if (type === "email") {
            if (!pattern.test(event.target.value)) setHasError(errorResponse);
            else setHasError(null);
        }
        if (type === "tel") {
            if (!pattern.test(event.target.value)) props.onChange(target);
        }
        else {
            props.onChange(target)
        }
    };


    return (
        <div className={["input-text mb-3", outerClassName].join(" ")}>
            <div className="input-group">
                {prepend && (
                    <div className="input-group-prepend text-body">
                        <div className="input-group-text">{prepend}</div>
                    </div>
                )}
                <input
                    name={name}
                    type={type}
                    pattern={pattern}
                    className={["form-control", inputClassName].join(" ")}
                    value={value}
                    placeholder={placeholder}
                    required={isRequired}
                    onChange={onChange}
                />
                {append && (
                    <div className="input-group-append text-body">
                        <div className="input-group-text">{append}</div>
                    </div>
                )}
            </div>
            {hasError && <span className="error-helper">{hasError}</span> }
        </div>
    )
}

Text.defaultProps = {
    isRequired: false,
    type: "text",
    pattern: "",
    placeholder: "Please type here...",
    errorResponse: "Please match the requested format",
}
Text.propTypes = {
    isRequired: propTypes.bool,
    name: propTypes.string.isRequired,
    value: propTypes.oneOfType([propTypes.string, propTypes.number]).isRequired,
    onChange: propTypes.func.isRequired,
    prepend: propTypes.oneOfType([propTypes.number, propTypes.string]),
    append: propTypes.oneOfType([propTypes.number, propTypes.string]),
    type: propTypes.string,
    placeholder: propTypes.string,
    outerClassName: propTypes.string,
    inputClassName: propTypes.string,
}
