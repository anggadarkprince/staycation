import React from 'react';
import {render} from '@testing-library/react';
import Star from './index';

test('Should have props [value, size, spacing]', () => {
    const size = 40, spacing = 10, value = 3.6;
    const {container} = render(<Star value={value} size={size} spacing={spacing}/>);
    const starYellow = "div.stars div.star:not(.placeholder)";

    expect(container.querySelector("div.stars")).toBeInTheDocument();
    expect(container.querySelector("div.stars")).toHaveAttribute("style", expect.stringContaining(`height: ${size}px`));
    expect(container.querySelector(starYellow)).toBeInTheDocument();
    expect(container.querySelector(starYellow)).toHaveAttribute("style", expect.stringContaining(`width: ${size}px`));
    expect(container.querySelector(starYellow)).toHaveAttribute("style", expect.stringContaining(`height: ${size}px`));
});