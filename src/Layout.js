import React, {Component} from 'react';
import Header from 'parts/Header';
import Footer from 'parts/Footer';
import {withRouter} from "react-router-dom";

class Layout extends Component {

    landing() {
        return (
            <>
                <Header {...this.props}/>
                {this.props.children}
                <Footer/>
            </>
        );
    }

    checkout() {
        return (
            <>
                <Header isCentered {...this.props}/>
                {this.props.children}
                <Footer/>
            </>
        );
    }

    render() {
        switch (this.props.layout) {
            case 'landing':
                return this.landing();
            case 'checkout':
                return this.checkout();
            default:
                return this.landing();
        }
    }
}

export default withRouter(Layout);
