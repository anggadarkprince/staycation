import React, {Component} from 'react';
import Fade from 'react-reveal/Fade';
import Header from 'parts/Header';
import PageDetailTitle from 'parts/PageDetailTitle';
import FeaturedImage from 'parts/FeaturedImage';
import PageDetailDescription from 'parts/PageDetailDescription';
import BookingForm from 'parts/BookingForm';
import Categories from 'parts/Categories';
import Testimony from 'parts/Testimony';
import Footer from "parts/Footer";
import config from 'config';

import {connect} from 'react-redux';
import {checkoutBooking} from 'store/actions/checkout';

class DetailPage extends Component {
    state = {
        detailPage: {},
        isLoading: true
    }

    componentDidMount() {
        document.title = "Staycation | Detail";
        window.scrollTo(0, 0);

        fetch(`${config.apiUrl}/api/detail/${this.props.match.params.id}`)
            .then(result => result.json())
            .then(result => {
                console.log(result);
                this.setState({
                    detailPage: result,
                    isLoading: false
                });
            })
            .catch(console.log);
    }

    render() {
        const detailPage = this.state.detailPage;
        const {categories, testimonial} = this.state.detailPage;
        const breadcrumb = [
            {pageTitle: "Home", pageHref: "/"},
            {pageTitle: "House Detail", pageHref: "/detail"},
        ];
        return (
            !this.state.isLoading &&
            <>
                <Header {...this.props}/>
                <PageDetailTitle breadcrumb={breadcrumb} data={detailPage}/>
                <FeaturedImage data={this.state.detailPage.imageId}/>
                <section className="container">
                    <div className="row">
                        <div className="col-7 pr-5">
                            <Fade bottom>
                                <PageDetailDescription data={detailPage}/>
                            </Fade>
                        </div>
                        <div className="col-5">
                            <Fade bottom>
                                <BookingForm itemDetails={detailPage} startBooking={this.props.checkoutBooking}/>
                            </Fade>
                        </div>
                    </div>
                </section>
                <Categories data={categories}/>
                <Testimony data={testimonial}/>
                <Footer/>
            </>
        );
    }
}

export default connect(null, {checkoutBooking})(DetailPage);