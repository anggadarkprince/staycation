import React, {Component} from 'react';
import Fade from 'react-reveal/Fade';
import PageDetailTitle from 'parts/PageDetailTitle';
import FeaturedImage from 'parts/FeaturedImage';
import PageDetailDescription from 'parts/PageDetailDescription';
import BookingForm from 'parts/BookingForm';
import Categories from 'parts/Categories';
import Spinner from 'elements/Spinner';
import config from 'config';

import {connect} from 'react-redux';
import {checkoutBooking, checkoutState} from 'store/actions/checkout';
import {fetchPage} from "store/actions/page";

class DetailPage extends Component {
    state = {
        //detailPage: {},
        //isLoading: true
    }

    constructor(props) {
        super(props);
        props.page.isLoading = true;
    }

    componentDidMount() {
        window.scrollTo(0, 0);

        this.props.fetchPage(`${config.apiUrl}/api/detail/${this.props.match.params.id}`, 'detailPage', function (result) {
            document.title = "Staycation | " + result.title;
        });

        /*fetch(`${config.apiUrl}/api/detail/${this.props.match.params.id}`)
            .then(result => result.json())
            .then(result => {
                console.log(result);
                this.setState({
                    detailPage: result,
                    isLoading: false
                });
            })
            .catch(console.log);*/
    }

    render() {
        const detailPage = this.props.page.detailPage || {};
        const breadcrumb = [
            {pageTitle: "Home", pageHref: "/"},
            {pageTitle: "House Detail", pageHref: "/detail"},
        ];
        return (
            this.props.page.isLoading ? <Spinner className="text-center" style={{minHeight: 200}}/> :
            <>
                <PageDetailTitle breadcrumb={breadcrumb} data={detailPage}/>
                <FeaturedImage data={detailPage.imageId}/>
                <section className="container">
                    <div className="row">
                        <div className="col-7 pr-5">
                            <Fade bottom>
                                <PageDetailDescription data={detailPage}/>
                            </Fade>
                        </div>
                        <div className="col-5">
                            <Fade bottom>
                                <BookingForm itemDetails={detailPage} checkoutState={this.props.checkoutState} startBooking={this.props.checkoutBooking}/>
                            </Fade>
                        </div>
                    </div>
                </section>
                <Categories data={detailPage.categories}/>
            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        page: state.page
    }
};
export default connect(mapStateToProps, {fetchPage, checkoutBooking, checkoutState})(DetailPage);
