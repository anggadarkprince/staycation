import React from 'react';
import {render} from '@testing-library/react';
import {BrowserRouter as Router} from 'react-router-dom';
import Breadcrumb from './index';

const setup = () => {
    const breadcrumbList = [
        {pageTitle: "Home", pageHref: "/"},
        {pageTitle: "House Detail", pageHref: "/detail"},
    ];
    const {container} = render(
        <Router>
            <Breadcrumb data={breadcrumbList}/>
        </Router>
    )
    const breadcrumb = container.querySelector('.breadcrumb');

    return {breadcrumb, breadcrumbList};
}

test('Should have <ol> with className .breadcrumb and have text Home & House Detail', () => {
    const {breadcrumb, breadcrumbList} = setup();

    expect(breadcrumb).toBeInTheDocument();
    breadcrumbList.forEach(list => {
        expect(breadcrumb).toHaveTextContent(list.pageTitle);
    });
});

