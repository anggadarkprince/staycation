import React, {Component} from 'react';
import Header from 'parts/Header';

export default class LandingPage extends Component {

    componentDidMount() {
        window.title = "Staycation | Checkout";
        window.scrollTo(0, 0);
    }

    render() {
        return (
            <>
                <Header isCentered {...this.props}></Header>
            </>
        );
    }
}