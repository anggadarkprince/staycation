import React from 'react';
import {render} from '@testing-library/react';
import {BrowserRouter as Router} from 'react-router-dom';
import Button from './index';

test('Should not allowed click button if isDisabled is present', () => {
    const {container} = render(<Button isDisabled={true}>Button</Button>);
    expect(container.querySelector('span.disabled')).toBeInTheDocument();
});

test('Should render loading/spinner when loading', () => {
    const {container, getByText} = render(<Button isLoading={true}>Button</Button>);
    expect(container.querySelector('span')).toBeInTheDocument();
    expect(getByText(/loading/i)).toBeInTheDocument();
});

test('Should render <a> tag', () => {
    const {container} = render(<Button type={'link'} isExternal={true}>Button</Button>);
    expect(container.querySelector('a')).toBeInTheDocument();
});

test('Should render <Link> component', () => {
    const {container} = render(<Router><Button href={''} type={'link'}>Button</Button></Router>);
    expect(container.querySelector('a')).toBeInTheDocument();
});

