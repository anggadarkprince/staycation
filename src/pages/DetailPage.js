import React, {Component} from 'react';
import Fade from 'react-reveal/Fade';
import Header from 'parts/Header';
import itemDetails from 'json/itemDetails';
import PageDetailTitle from 'parts/PageDetailTitle';
import FeaturedImage from 'parts/FeaturedImage';
import PageDetailDescription from 'parts/PageDetailDescription';
import BookingForm from 'parts/BookingForm';
import Categories from 'parts/Categories';
import Testimony from 'parts/Testimony';
import Footer from "../parts/Footer";

export default class DetailPage extends Component{

    componentDidMount() {
        window.title = "Staycation | Detail";
        window.scrollTo(0, 0);
    }

    render() {
        const breadcrumb = [
            {pageTitle: "Home", pageHref: "/"},
            {pageTitle: "House Detail", pageHref: "/detail"},
        ];
        return (
            <>
                <Header {...this.props}></Header>
                <PageDetailTitle breadcrumb={breadcrumb} data={itemDetails}/>
                <FeaturedImage data={itemDetails.imageUrls}/>
                <section className="container">
                    <div className="row">
                        <div className="col-7 pr-5">
                            <Fade bottom>
                                <PageDetailDescription data={itemDetails}/>
                            </Fade>
                        </div>
                        <div className="col-5">
                            <Fade bottom>
                                <BookingForm itemDetails={itemDetails} startBooking={() => {this.props.history.push('/checkout')}}/>
                            </Fade>
                        </div>
                    </div>
                </section>
                <Categories data={itemDetails.categories}/>
                <Testimony data={itemDetails.testimonial}/>
                <Footer/>
            </>
        );
    }
}