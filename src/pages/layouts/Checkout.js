import React, {Component} from 'react';
import Header from 'parts/Header';
import Footer from 'parts/Footer';

class Checkout extends Component {

    render() {
        return (
            <>
                <Header isCentered {...this.props}/>
                {this.props.children}
                <Footer/>
            </>
        )
    }
}

export default Checkout;
