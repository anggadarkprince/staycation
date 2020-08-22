import React, {Component} from 'react';
import Header from 'parts/Header';
import Hero from 'parts/Hero';
import MostPicked from 'parts/MostPicked';
import Categories from 'parts/Categories';
import Testimony from "parts/Testimony";
import Footer from "parts/Footer";
import config from 'config';

import {connect} from "react-redux";
import {fetchPage} from "store/actions/page";

class LandingPage extends Component {
    state = {
        //landingPage: {},
        //isLoading: true
    }

    constructor(props) {
        super(props);
        this.refMostPicked = React.createRef();
    }

    componentDidMount() {
        document.title = "Staycation | Hotels and reservation";
        window.scrollTo(0, 0);

        if (!this.props.page.landingPage) {
            this.props.fetchPage(`${config.apiUrl}/api/landing`, 'landingPage');
        }
        /* fetch(`${config.apiUrl}/api/landing`)
            .then(result => result.json())
            .then(result => {
                this.setState({
                    landingPage: result,
                    isLoading: false
                });
            })
            .catch(console.log); */
    }

    render() {
        const {hero, mostPicked, categories, testimonial} = this.props.page.landingPage || {};
        return (
            !this.props.page.isLoading &&
            <>
                <Header {...this.props}/>
                <Hero refMostPicked={this.refMostPicked} data={hero}/>
                <MostPicked refMostPicked={this.refMostPicked} data={mostPicked}/>
                <Categories refMostPicked={this.refMostPicked} data={categories}/>
                <Testimony data={testimonial}/>
                <Footer/>
            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        page: state.page
    }
};
export default connect(mapStateToProps, {fetchPage})(LandingPage);