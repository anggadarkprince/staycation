import React from "react";
import Fade from 'react-reveal/Fade';
import "./index.scss";

export default function Controller({style, className, data, current}) {
    const keysOfData = Object.keys(data);

    return (
        <Fade>
            <ol className={["stepper my-4", className].join(' ')}>
                {keysOfData.map((list, index) => {
                    let isActive = list === current ? "active" : "";
                    if (index === keysOfData.length - 1) {
                        isActive = "";
                        return null;
                    }

                    return (
                        <li key={`list-${index}`} className={isActive}>
                            {index + 1}
                        </li>
                    )
                })}
            </ol>
        </Fade>
    )
}