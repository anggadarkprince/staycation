import React from 'react';
import Button from 'elements/Button';

export default function IconText() {
    return (
        <Button className='navbar-brand' href={'/'} type={'link'}>
            Stay<span className={'text-body'}>cation.</span>
        </Button>
    )
}