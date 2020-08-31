import React from "react";
import {Link} from 'react-router-dom';
import propTypes from 'prop-types';

export default function Button(props) {
    const className = [props.className]
    if (props.isPrimary) className.push('btn-primary');
    if (props.isWarning) className.push('btn-warning');
    if (props.isInfo) className.push('btn-info');
    if (props.isDanger) className.push('btn-danger');
    if (props.isLarge) className.push('btn-lg');
    if (props.isSmall) className.push('btn-sm');
    if (props.isBlock) className.push('btn-block');
    if (props.isLight) className.push('btn-light');
    if (props.hasShadow) className.push('btn-shadow');

    const onClick = () => {
        if (props.onClick) props.onClick();
    }

    if (props.isDisabled || props.isLoading) {
        if (props.isDisabled) className.push('disabled');
        return (
            <span className={className.join(' ')} style={props.style}>
                {
                    props.isLoading ?
                        <>
                            <span className="small spinner-border spinner-border-sm mr-1" style={{lineHeight: 1}}/>{props.children}
                            <span className="sr-only">Loading...</span>
                        </>
                        : props.children
                }
            </span>
        )
    }

    if (props.type === 'link') {
        if (props.isExternal) {
            return (
                <a href={props.href}
                   className={className.join(' ')}
                   style={props.style}
                   target={props.target === '_blank' ? '_blank' : null}
                   rel={props.target === '_blank' ? 'noopener noreferrer' : null}>
                    {props.children}
                </a>
            );
        } else {
            return (
                <Link to={props.href}
                      className={className.join(' ')}
                      style={props.style}
                      onClick={onClick}>
                    {props.children}
                </Link>
            )
        }
    }
    return (
        <button className={className.join(' ')}
                style={props.style}
                onClick={onClick}>
            {props.children}
        </button>
    );
}

Button.propTypes = {
    type: propTypes.oneOf(['button', 'link']),
    onClick: propTypes.func,
    target: propTypes.string,
    className: propTypes.string,
    isDisabled: propTypes.bool,
    isLoading: propTypes.bool,
    isSmall: propTypes.bool,
    isLarge: propTypes.bool,
    isPrimary: propTypes.bool,
    isWarning: propTypes.bool,
    isInfo: propTypes.bool,
    isDanger: propTypes.bool,
    isLight: propTypes.bool,
    isBlock: propTypes.bool,
    isExternal: propTypes.bool,
    hasShadow: propTypes.bool,
    href: propTypes.string,
}
