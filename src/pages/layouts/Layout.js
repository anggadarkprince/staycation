import React, {Component} from 'react';
import Landing from './Landing';
import Checkout from './Checkout';
import {withRouter} from "react-router-dom";

class Layout extends Component {
    render() {
        switch (this.props.layout) {
            case 'landing':
                return <Landing {...this.props}/>;
            case 'checkout':
                return <Checkout {...this.props}/>;
            default:
                return <Landing {...this.props}/>;
        }
    }
}

export default withRouter(Layout);
