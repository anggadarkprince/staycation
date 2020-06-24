import React, {useRef} from "react";
import propTypes from 'prop-types';
import './index.scss';

export default function File(props) {
    const {value, placeholder, name, accept, prepend, append, outerClassName, inputClassName, onChange} = props;

    const refInputFile = useRef(null);

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
                    type="file"
                    ref={refInputFile}
                    accept={accept}
                    className="d-none"
                    value={value}
                    placeholder={placeholder}
                    onChange={onChange}
                />
                <input
                    onClick={() => refInputFile.current.click()}
                    defaultValue={value}
                    placeholder={placeholder}
                    className={["form-control", inputClassName].join(" ")}
                />
                {append && (
                    <div className="input-group-append text-body">
                        <div className="input-group-text">{append}</div>
                    </div>
                )}
            </div>
        </div>
    )
}

File.defaultProps = {
    placeholder: "Browse a file...",
}
File.propTypes = {
    name: propTypes.string.isRequired,
    accept: propTypes.string.isRequired,
    value: propTypes.string.isRequired,
    onChange: propTypes.func.isRequired,
    prepend: propTypes.oneOfType([propTypes.number, propTypes.string]),
    append: propTypes.oneOfType([propTypes.number, propTypes.string]),
    placeholder: propTypes.string,
    outerClassName: propTypes.string,
    inputClassName: propTypes.string,
}