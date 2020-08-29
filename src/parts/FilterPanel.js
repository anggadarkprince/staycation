import React, {Component} from 'react';
import Fade from 'react-reveal/Fade';
import Star from 'elements/Star';
import Button from "elements/Button";
import Spinner from "elements/Spinner";
import {numeric, reverseNumeric, getDecimalSeparator} from "utilities/formatter";
import axios from 'axios';
import config from "config";
import queryString from "query-string";
import {withRouter} from "react-router-dom";
import propTypes from "prop-types";
import {debounce} from 'throttle-debounce';

class FilterPanel extends Component {
    initialState = {
        isMounted: false,
        categoryData: null,
        facilityData: null,
        filters: {
            q: '',
            priceFrom: '',
            priceUntil: '',
            ratings: [],
            categories: [],
            facilities: [],
            sortBy: '',
            sortMethod: '',
            sortLabel: '',
        },
        ratings: new Map(),
        categories: new Map(),
        facilities: new Map(),
    };

    constructor(props) {
        super(props);
        this.state = this.initFilterState(this.initialState);
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.onResetFilter = this.onResetFilter.bind(this);
        this.onFilterUpdated = this.onFilterUpdated.bind(this);
        this.onFilterUpdated = debounce(this.props.debounceDelay, this.onFilterUpdated);
    }

    componentDidMount() {
        axios.get(`${config.apiUrl}/api/categories`)
            .then(result => this.setState({categoryData: result.data}))
            .catch(console.log);
        axios.get(`${config.apiUrl}/api/facilities`)
            .then(result => this.setState({facilityData: result.data}))
            .catch(console.log);

        if (this.props.backHistory) {
            window.onpopstate = () => {
                if (this.state.isMounted) {
                    this.setState(this.initFilterState(this.state));
                    this.onFilterUpdated(true);
                }
            }
        }

        if (this.props.triggerChangedOnMount) {
            this.props.onFilterChanged(this.state.filters);
        }

        this.setState({isMounted: true});
    }

    initFilterState(state) {
        // isMounted and other dynamic states should remain kept when reset
        const params = queryString.parse(this.props.location.search);
        return {
            ...this.initialState,
            isMounted: state.isMounted,
            categoryData: state.categoryData,
            facilityData: state.facilityData,
            filters: {
                ...this.initialState.filters,
                ...params
            },
            ratings: new Map(params.ratings && (Array.isArray(params.ratings) ? params.ratings : [params.ratings]).map(i => [i, true])),
            categories: new Map(params.categories && (Array.isArray(params.categories) ? params.categories : [params.categories]).map(i => [i, true])),
            facilities: new Map(params.facilities && (Array.isArray(params.facilities) ? params.facilities : [params.facilities]).map(i => [i, true])),
        };
    }

    handleFieldChange(event) {
        const id = event.target.id;
        const name = event.target.name;
        const isChecked = event.target.checked;
        const value = event.target.value;

        if (name === 'sort') {
            let sortBy = '';
            let sortMethod = '';
            switch (id) {
                case 'highestPrice':
                    sortBy = 'price';
                    sortMethod = 'desc';
                    break;
                case 'lowestPrice':
                    sortBy = 'price';
                    sortMethod = 'asc';
                    break;
                case 'review':
                    sortBy = 'rating';
                    sortMethod = 'desc';
                    break;
                case 'popularity':
                    sortBy = 'isPopular';
                    sortMethod = 'desc';
                    break;
                default:
                    sortBy = '';
                    sortMethod = '';
                    break;
            }
            this.setState(prevState => {
                return {
                    filters: {
                        ...prevState.filters,
                        sortBy,
                        sortMethod,
                        sortLabel: value
                    }
                }
            }, this.onFilterUpdated);
        } else if (['ratings[]', 'categories[]', 'facilities[]'].includes(name)) {
            this.setState(prevState => {
                const inputName = name.replace('[]', '');
                const mapValues = prevState[inputName].set(value, isChecked);
                mapValues.forEach((value, key, map) => {
                    if (!value) {
                        map.delete(key);
                    }
                });

                return {
                    filters: {
                        ...prevState.filters,
                        [inputName]: Array.from(mapValues.keys())
                    },
                    [inputName]: mapValues,
                }
            }, this.onFilterUpdated);
        } else if (name === 'priceFrom' || name === 'priceUntil') {
            if (!/[^0-9.,]+/.test(value)) {
                let formattedValue = '';
                if (value) {
                    if (value.endsWith(getDecimalSeparator())) {
                        formattedValue = value;
                    } else {
                        formattedValue = numeric(reverseNumeric(value));
                    }
                }
                this.setState(prevState => {
                    return {
                        filters: {
                            ...prevState.filters,
                            [name]: formattedValue
                        }
                    }
                }, this.onFilterUpdated);
            }
        } else {
            this.setState(prevState => {
                return {
                    filters: {
                        ...prevState.filters,
                        [name]: value
                    }
                }
            }, this.onFilterUpdated);
        }
    }

    onFilterUpdated(isBack = false) {
        console.log(isBack)
        const {filters} = this.state;
        if (this.props.pushHistory) {
            const filterParams = queryString.stringify({
                ...(filters.q && {q: filters.q}),
                ...(filters.priceFrom && {priceFrom: filters.priceFrom}),
                ...(filters.priceUntil && {priceUntil: filters.priceUntil}),
                ...(filters.ratings && {ratings: filters.ratings}),
                ...(filters.categories && {categories: filters.categories}),
                ...(filters.facilities && {facilities: filters.facilities}),
                ...(filters.sortBy && {sortBy: filters.sortBy}),
                ...(filters.sortMethod && {sortMethod: filters.sortMethod}),
                ...(filters.sortLabel && {sortLabel: filters.sortLabel}),
            });

            if (!isBack) {
                this.props.history.push({
                    search: (filterParams ? '?' + filterParams : '')
                });
            }
        }

        if (this.props.onFilterChanged) {
            this.props.onFilterChanged(filters, isBack);
        }
    }

    onResetFilter() {
        this.setState({
            ...this.initialState,
            categoryData: this.state.categoryData,
            facilityData: this.state.facilityData,
        });
        this.onFilterUpdated();
        if (this.props.onFilterReset) {
            this.props.onFilterReset();
        }
    }

    render() {
        const {categoryData, facilityData} = this.state;
        const {q, priceFrom, priceUntil, ratings, facilities, categories, sortLabel} = this.state.filters;

        return (
            <Fade>
                <div className="card mb-3">
                    <div className="card-header bg-white">
                        Search
                    </div>
                    <div className="card-body">
                        <input className="form-control" type="search" name="q" value={q}
                               placeholder="Search accommodation..." onChange={this.handleFieldChange}/>
                    </div>
                </div>
                <div className="card mb-3">
                    <div className="card-header bg-white">
                        Sort Result
                    </div>
                    <div className="card-body">
                        <div className="form-row">
                            <div className="col-md-6">
                                <div className="custom-control custom-radio">
                                    <input type="radio" className="custom-control-input"
                                           id="highestPrice" name="sort" value="highestPrice"
                                           onChange={this.handleFieldChange}
                                           checked={sortLabel === 'highestPrice'}/>
                                    <label className="custom-control-label pl-1" htmlFor="highestPrice">
                                        Highest Price
                                    </label>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="custom-control custom-radio">
                                    <input type="radio" className="custom-control-input"
                                           id="lowestPrice" name="sort" value="lowestPrice"
                                           onChange={this.handleFieldChange}
                                           checked={sortLabel === 'lowestPrice'}/>
                                    <label className="custom-control-label pl-1" htmlFor="lowestPrice">
                                        Lowest Price
                                    </label>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="custom-control custom-radio">
                                    <input type="radio" className="custom-control-input"
                                           id="review" name="sort" value="review"
                                           onChange={this.handleFieldChange}
                                           checked={sortLabel === 'review'}/>
                                    <label className="custom-control-label pl-1" htmlFor="review">
                                        Review Score
                                    </label>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="custom-control custom-radio">
                                    <input type="radio" className="custom-control-input"
                                           id="popularity" name="sort" value="popularity"
                                           onChange={this.handleFieldChange}
                                           checked={sortLabel === 'popularity'}/>
                                    <label className="custom-control-label pl-1" htmlFor="popularity">
                                        Popularity
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header bg-white d-flex justify-content-between">
                        Filter Result
                        <Button type="button" className="btn btn-link p-0" onClick={this.onResetFilter}>Reset
                            Filter
                        </Button>
                    </div>
                    <div className="card-body">
                        <div className="form-group">
                            <label className="font-weight-medium">Price Range Per Night</label>
                            <div className="form-row">
                                <div className="col">
                                    <input className="form-control form-control-sm" type="text" name="priceFrom"
                                           value={priceFrom} placeholder="Price from"
                                           onChange={this.handleFieldChange}/>
                                </div>
                                <div className="col">
                                    <input className="form-control form-control-sm" type="text" name="priceUntil"
                                           value={priceUntil} placeholder="Price until"
                                           onChange={this.handleFieldChange}/>
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="font-weight-medium">Star Rating</label>
                            {
                                [1, 2, 3, 4, 5].map(star => {
                                    return (
                                        <div key={`star-${star}`} className="custom-control custom-checkbox">
                                            <input type="checkbox" className="custom-control-input"
                                                   id={`rating-${star}`} name={`ratings[]`}
                                                   value={star} onChange={this.handleFieldChange}
                                                   checked={!!ratings.includes(star.toString())}/>
                                            <label className="custom-control-label pl-2" htmlFor={`rating-${star}`}>
                                                <Star value={star} size={20} spacing={10}/>
                                            </label>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <div className="form-group">
                            <label className="font-weight-medium">Facilities</label>
                            {
                                facilityData ? facilityData.map(facility => {
                                        return (
                                            <div key={`facility-${facility._id}`}
                                                 className="custom-control custom-checkbox">
                                                <input type="checkbox" className="custom-control-input"
                                                       id={`facilities-${facility._id}`} name="facilities[]"
                                                       value={facility._id} onChange={this.handleFieldChange}
                                                       checked={!!facilities.includes(facility._id.toString())}/>
                                                <label className="custom-control-label pl-2"
                                                       htmlFor={`facilities-${facility._id}`}>
                                                    {facility.facility}
                                                </label>
                                            </div>
                                        )
                                    })
                                    : <Spinner/>
                            }
                        </div>
                        <div className="form-group">
                            <label className="font-weight-medium">Categories</label>
                            {
                                categoryData ? categoryData.map(category => {
                                        return (
                                            <div key={`category-${category._id}`}
                                                 className="custom-control custom-checkbox">
                                                <input type="checkbox" className="custom-control-input"
                                                       id={`category-${category._id}`} name="categories[]"
                                                       value={category._id} onChange={this.handleFieldChange}
                                                       checked={!!categories.includes(category._id.toString())}/>
                                                <label className="custom-control-label pl-2" htmlFor={`category-${category._id}`}>
                                                    {category.category}
                                                </label>
                                            </div>
                                        )
                                    })
                                    : <Spinner/>
                            }
                        </div>
                    </div>
                </div>
            </Fade>
        );
    }
}

FilterPanel.defaultProps = {
    triggerChangedOnMount: false,
    pushHistory: true,
    backHistory: true,
    debounceDelay: 500,
}

FilterPanel.propTypes = {
    onFilterChanged: propTypes.func,
    onFilterReset: propTypes.func,
    triggerChangedOnMount: propTypes.bool,
    pushHistory: propTypes.bool,
    backHistory: propTypes.bool,
    debounceDelay: propTypes.number,
}

export default withRouter(FilterPanel);
