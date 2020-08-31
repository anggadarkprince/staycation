import React, {useEffect, useRef, useState} from "react";
import propTypes from 'prop-types';
import './index.scss';

export default function File(props) {
    const [fileName, setFileName] = useState("");

    const {placeholder, name, accept, prepend, append, outerClassName, inputClassName} = props;

    const refInputFile = useRef(null);

    const onChange = event => {
        setFileName(event.target.value);
        props.onChange({
            target: {
                name: event.target.name,
                value: event.target.files
            }
        });
    }

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
                    value={fileName}
                    placeholder={placeholder}
                    onChange={onChange}
                />
                <input
                    onClick={() => refInputFile.current.click()}
                    defaultValue={typeof props.value === 'string' || props.value instanceof String ? props.value.split('/').pop() : fileName}
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
    onChange: propTypes.func.isRequired,
    prepend: propTypes.oneOfType([propTypes.number, propTypes.string]),
    append: propTypes.oneOfType([propTypes.number, propTypes.string]),
    placeholder: propTypes.string,
    outerClassName: propTypes.string,
    inputClassName: propTypes.string,
}
