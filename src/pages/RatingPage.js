import React, {Component} from 'react';
import {connect} from "react-redux";
import Fade from 'react-reveal/Fade';
import {backToTop} from "utilities/scroller";
import {submitRating} from 'store/actions/rating';
import {fetchPage} from "store/actions/page";
import {InputFile} from "elements/Forms";
import Button from 'elements/Button';
import Spinner from "elements/Spinner";
import Star from "elements/Star";
import config from "config";

class RatingPage extends Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            isSubmitting: false,
            data: {
                rating: 0,
                review: '',
                imageUrl: '',
                image: '',
            },
            errors: {}
        }
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.hasErrorFor = this.hasErrorFor.bind(this);
        this.renderErrorFor = this.renderErrorFor.bind(this);
        this.handleSubmitRating = this.handleSubmitRating.bind(this);
    }

    componentDidMount() {
        document.title = "Staycation | Rating";
        backToTop();

        this.props.fetchPage(`${config.apiUrl}/api/booking/${this.props.match.params.id}`, 'rating', (result) => {
            document.title = "Staycation | Rating Booking " + result.transactionNumber;
            this.setState({
                data: {
                    rating: result.rating || 0,
                    review: result.review || '',
                    image: result.reviewImage || '',
                    imageUrl: result.reviewImage || '',
                }
            })
        });
    }

    handleFieldChange(event) {
        this.setState({
            data: {
                ...this.state.data,
                [event.target.name]: event.target.value
            }
        })
    }

    hasErrorFor(field) {
        return !!this.state.errors[field]
    }

    renderErrorFor(field, className = 'invalid-feedback') {
        if (this.hasErrorFor(field)) {
            if (field === 'alert') {
                const status = this.state.errors[field]?.status || 'warning';
                const message = this.state.errors[field]?.message || this.state.errors[field];
                return (
                    <div className={`alert alert-${status} alert-dismissible`} role="alert">
                        <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        {message}
                    </div>
                )
            }
            return (
                <span className={className}>
                    {this.state.errors[field][0]}
                </span>
            )
        }
    }

    handleSubmitRating(event) {
        event.preventDefault();
        const {rating, review, image} = this.state.data;
        const errors = {};

        if (!rating || rating <= 0) errors.rating = ["Rating is required"];
        if (!review) errors.review = ["Review is required"];
        this.setState({errors: errors});

        if (Object.keys(errors).length === 0 && errors.constructor === Object) {
            this.setState({isSubmitting: true}, () => {
                const payload = new FormData();
                payload.append('rating', rating);
                payload.append('review', review);
                if (image && image.length) {
                    payload.append('image', image[0]);
                }
                this.props.submitRating(payload, this.props.match.params.id)
                    .then(() => {
                        this.setState({isSubmitting: false}, () => {
                            this.props.history.push('/profile/all-bookings');
                        });
                    })
                    .catch(error => {
                        this.setState({
                            isSubmitting: false,
                            errors: {
                                alert: {
                                    status: 'danger',
                                    message: error.message || error.response.data.message
                                }
                            }
                        });
                    });
            });
        }
    }

    render() {
        const booking = this.props.booking;
        const {rating, review, image, imageUrl} = this.state.data;

        return (
            this.props.isLoading || !booking ? <Spinner className="text-center" style={{minHeight: 200}}/> :
                <Fade>
                    <section className="container text-center">
                        <h4>Rating Booking</h4>
                        <p>{booking.transactionNumber}</p>

                        <div className="card card-category mx-auto" style={{maxWidth: 400}}>
                            <figure className="img-wrapper" style={{height: 180}}>
                                <img src={booking.item.imageUrl} alt={booking.item.title} className="img-cover"/>
                            </figure>
                            <div className="meta-wrapper">
                                <Button type="link" className="link-text text-body h5 d-block"
                                        href={`/properties/${booking.item._id}`}>
                                    {booking.item.title}
                                </Button>
                                <span className="text-gray-500">
                                {booking.item.city}, {booking.item.country}
                            </span>
                            </div>
                            <hr/>
                            <form method='post' onSubmit={this.handleSubmitRating}>
                                <div className="form-group text-center">
                                    <label htmlFor="review">Write a Review</label>
                                    <div className={`d-block ${this.hasErrorFor('review') ? 'is-invalid' : ''}`}>
                                        <Star value={rating} size={25} spacing={12} isInput={!this.state.isSubmitting}
                                              onStarChanged={this.handleFieldChange}/>
                                    </div>
                                    {this.renderErrorFor('rating')}
                                </div>
                                {
                                    imageUrl &&
                                    <figure className="img-wrapper mb-3" style={{height: 200}}>
                                        <img src={imageUrl} alt={booking.item.title} className="img-cover"/>
                                    </figure>
                                }
                                <InputFile accept="image/*" id="image" name="image" value={image} onChange={this.handleFieldChange}/>
                                <div className="input-text mb-3">
                                    <div className="form-group">
                                    <textarea
                                        className={`form-control ${this.hasErrorFor('review') ? 'is-invalid' : ''}`}
                                        id="review" name="review" placeholder="Add review for this booking"
                                        value={review} disabled={this.state.isSubmitting}
                                        onChange={this.handleFieldChange}/>
                                        {this.renderErrorFor('review')}
                                    </div>
                                </div>
                                <Button type="button" className="btn" isPrimary>Submit Rating</Button>
                            </form>
                        </div>
                    </section>
                </Fade>
        );
    }
}

const mapStateToProps = (state) => ({
    isLoading: state.page.isLoading,
    booking: state.page.rating,
});
export default connect(mapStateToProps, {fetchPage, submitRating})(RatingPage);
