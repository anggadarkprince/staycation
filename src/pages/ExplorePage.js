import React, {Component} from 'react';
import Fade from 'react-reveal/Fade';
import Spinner from 'elements/Spinner';
import config from 'config';
import FilterPanel from "parts/FilterPanel";
import axios from "axios";
import {numeric, reverseNumeric} from "utilities/formatter";
import Button from "elements/Button";
import Star from "elements/Star";
import Pagination from "elements/Pagination";
import {backToTop} from "utilities/scroller";

class ExplorePage extends Component {
    state = {
        isLoading: true,
        filters: {},
        accommodations: []
    }

    constructor(props) {
        super(props);
        this.onFilterChanged = this.onFilterChanged.bind(this);
        this.onPageChanged = this.onPageChanged.bind(this);
    }

    componentDidMount() {
        document.title = "Staycation | Explore";
        backToTop();
    }

    onFilterChanged(filters) {
        this.setState({isLoading: true, filters: filters}, () => {
            const filteredData = {
                ...filters,
                ...(filters.priceFrom && {priceFrom: reverseNumeric(filters.priceFrom)}),
                ...(filters.priceUntil && {priceUntil: reverseNumeric(filters.priceUntil)}),
            };
            axios.get(`${config.apiUrl}/api/explore`, {params: filteredData})
                .then(response => response.data)
                .then(accommodations => {
                    this.setState({isLoading: false, accommodations: accommodations});
                })
                .catch(error => {
                    console.log(error);
                });
        });
    }

    onPageChanged(currentPage) {
        const filterData = {...this.state.filters, page: currentPage};
        this.onFilterChanged(filterData);
        setTimeout(backToTop, 500);
    }

    renderResult() {
        const itemList = this.state.accommodations.docs.map(item => {
            return (
                <div className="item column-6 row-1" key={`explore-item-${item._id}`}>
                    <Fade>
                        <div className="card card-category">
                            {
                                item.isPopular && (
                                    <div className="tag">
                                        Popular <span className="font-weight-light">Choice</span>
                                    </div>
                                )
                            }
                            <figure className="img-wrapper" style={{height: 180}}>
                                <img src={item.imageUrl} alt={item.title} className="img-cover"/>
                            </figure>
                            <div className="meta-wrapper d-sm-flex justify-content-between">
                                <div>
                                    <Button type="link" className="stretched-link link-text text-body" href={`/properties/${item._id}`}>
                                        <h5>{item.title}</h5>
                                    </Button>
                                    <span className="text-gray-500">{item.city}, {item.country}</span>
                                </div>
                                <div className="text-right">
                                    <h5 className="font-weight-medium text-danger mb-0 text-nowrap">
                                        <small className="text-gray-500">IDR</small> {numeric(item.price)}
                                    </h5>
                                    <div className="text-nowrap">
                                        <Star value={item.rating} size={10} spacing={3}/>
                                        <small>{item.category}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Fade>
                </div>
            )
        });

        return itemList.length
            ? (
                <>
                    <div className="container-grid">{itemList}</div>
                </>
            )
            : (
                <div className="text-center py-4">
                    <h4>Ops, found nothing!</h4>
                    <p className="text-gray-500">Setup filter more generic</p>
                </div>
            )
    }

    render() {
        const accommodations = this.state.accommodations;
        const page = Number(this.state.filters.page) || 1;
        return (
            <>
                <div className="container">
                    <div className="row mb-5">
                        <div className="col-md-4">
                            <FilterPanel onFilterChanged={this.onFilterChanged} triggerChangedOnMount={true}/>
                        </div>
                        <div className="col-md-8">
                            <h5 className="mb-3">Explore Exciting Moments</h5>
                            <hr className="mb-4"/>
                            <div className="mb-5">
                                {
                                    this.state.isLoading
                                        ? <Spinner className="text-center" style={{minHeight: 200}} title="Search accommodation" subtitle="Please wait a moment"/>
                                        : this.renderResult()
                                }
                                {
                                    accommodations.totalDocs > 0
                                        ? <Pagination page={page} totalData={accommodations.totalDocs} totalPage={accommodations.totalPages} onPageChanged={this.onPageChanged} />
                                        : null
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default ExplorePage;
