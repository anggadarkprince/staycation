import React from "react";
import propTypes from 'prop-types';
import './index.scss';

export default function Number(props) {
    const {value, placeholder, name, min, max, prefix, suffix, suffixPlural, outerClassName} = props;

    const onChange = e => {
        let value = String(e.target.value);
        if (+value <= max && +value >= min) {
            props.onChange({
                target: {
                    name: name,
                    value: +value
                }
            });
        }
    }

    const minus = () => {
        value > min && onChange({
            target: {
                name: name,
                value: +value - 1
            }
        });
    }

    const plus = () => {
        value < max && onChange({
            target: {
                name: name,
                value: +value + 1
            }
        });
    }

    return (
        <div className={['input-number mb-3', outerClassName].join(' ')}>
            <div className="input-group">
                <div className="input-group-prepend">
                    <span className="input-group-text minus" onClick={minus}>
                        -
                    </span>
                </div>
                <input type="text"
                       min={min}
                       max={max}
                       name={name}
                       readOnly
                       className="form-control"
                       placeholder={placeholder ? placeholder : '0'}
                       value={`${prefix}${value}${value > 1 ? suffixPlural : suffix}`}
                       onChange={onChange}/>
                <div className="input-group-append">
                    <div className="input-group-text plus" onClick={plus}>
                        +
                    </div>
                </div>
            </div>
        </div>
    )
}

Number.defaultProps = {
    min: 1,
    max: 1,
    prefix: '',
    suffix: '',
    suffixPlural: '',
}
Number.propTypes = {
    value: propTypes.oneOfType([propTypes.string, propTypes.number]),
    onChange: propTypes.func,
    placeholder: propTypes.string,
    outerClassName: propTypes.string,
}