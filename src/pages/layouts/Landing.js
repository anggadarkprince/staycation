import React, {Component} from 'react';
import Header from 'parts/Header';
import Footer from 'parts/Footer';

class Landing extends Component {

    render() {
        return (
            <>
                <Header {...this.props}/>
                {this.props.children}
                <Footer/>
            </>
        )
    }
}

export default Landing;
