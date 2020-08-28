import React, {Component} from 'react';
import Fade from 'react-reveal/Fade';
import Spinner from 'elements/Spinner';
import config from 'config';
import FilterPanel from "parts/FilterPanel";
import axios from "axios";
import queryString from "query-string";

class ExplorePage extends Component {
    state = {
        isLoading: true,
        accommodations: []
    }

    constructor(props) {
        super(props);
        this.onFilterChanged = this.onFilterChanged.bind(this);
    }

    componentDidMount() {
        window.scrollTo(0, 0);
        document.title = "Staycation | Explore";

        this.setState({isLoading: false});
    }

    onFilterChanged(filters, isBack) {
        this.setState({isLoading: true}, () => {
            setTimeout(() => {
                this.setState({isLoading: false});
            }, 1000)
        });
    }

    render() {
        return (
            <>
                <div className="container">
                    <div className="row mb-5">
                        <div className="col-md-4">
                            <FilterPanel onFilterChanged={this.onFilterChanged}/>
                        </div>
                        <div className="col-md-8">
                            <h5 className="mb-4">Explore Exciting Moments</h5>
                            <div>
                                {
                                    this.state.isLoading
                                        ? <Spinner className="text-center" style={{minHeight: 200}} title="Search accommodation" subtitle="Please wait a moment"/>
                                        : <p>Not found</p>
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
