import React, { Component } from 'react';
import {Link, withRouter} from "react-router-dom";
import propTypes from "prop-types";
import queryString from "query-string";

const LEFT_PAGE = 'LEFT';
const RIGHT_PAGE = 'RIGHT';

/**
 * Helper method for creating a range of numbers
 * range(1, 5) => [1, 2, 3, 4, 5]
 */
const range = (from, to, step = 1) => {
    let i = from;
    const range = [];

    while (i <= to) {
        range.push(i);
        i += step;
    }

    return range;
};

class Pagination extends Component {

    constructor(props) {
        super(props);

        const query = this.props.location.search;
        const params = queryString.parse(query);
        this.state = {
            currentPage: props.page || Number(params.page) || 1,
        };
    }

    componentDidMount() {
        if (this.props.triggerChangedOnMount) {
            this.gotoPage(this.state.currentPage);
        }
    }

    gotoPage = page => {
        const params = queryString.parse(this.props.location.search);
        this.setState({ currentPage: page }, () => {
            if (this.props.pushHistory) {
                params.page = this.state.currentPage;
                const filterParams = queryString.stringify(params);
                this.props.history.push({
                    search: (filterParams ? '?' + filterParams : '')
                });
            }

            if (this.props.onPageChanged) {
                this.props.onPageChanged(page, params);
            }
        });
    };

    handleClick = page => evt => {
        evt.preventDefault();
        this.gotoPage(page);
    };

    handleMoveLeft = evt => {
        evt.preventDefault();
        this.gotoPage(this.state.currentPage - (this.props.pageNeighbours * 2) - 1);
    };

    handleMoveRight = evt => {
        evt.preventDefault();
        this.gotoPage(this.state.currentPage + (this.props.pageNeighbours * 2) + 1);
    };

    /**
     * Let's say we have 10 pages and we set pageNeighbours to 2
     * Given that the current page is 6
     * The pagination control will look like the following:
     *
     * (1) < {4 5} [6] {7 8} > (10)
     *
     * (x) => terminal pages: first and last page(always visible)
     * [x] => represents current page
     * {...x} => represents page neighbours
     */
    fetchPageNumbers = () => {
        const currentPage = this.state.currentPage;
        const pageNeighbours = this.props.pageNeighbours;
        const totalPages = this.props.totalPage;

        /**
         * totalNumbers: the total page numbers to show on the control
         * totalBlocks: totalNumbers + 2 to cover for the left(<) and right(>) controls
         */
        const totalNumbers = (this.props.pageNeighbours * 2) + 3;
        const totalBlocks = totalNumbers + 2;

        if (totalPages > totalBlocks) {
            const startPage = Math.max(2, currentPage - pageNeighbours);
            const endPage = Math.min(totalPages - 1, currentPage + pageNeighbours);

            let pages = range(startPage, endPage);

            /**
             * hasLeftSpill: has hidden pages to the left
             * hasRightSpill: has hidden pages to the right
             * spillOffset: number of hidden pages either to the left or to the right
             */
            const hasLeftSpill = startPage > 2;
            const hasRightSpill = (totalPages - endPage) > 1;
            const spillOffset = totalNumbers - (pages.length + 1);

            switch (true) {
                // handle: (1) < {5 6} [7] {8 9} (10)
                case (hasLeftSpill && !hasRightSpill):
                    const extraPages = range(startPage - spillOffset, startPage - 1);
                    pages = [LEFT_PAGE, ...extraPages, ...pages];
                    break;

                // handle: (1) {2 3} [4] {5 6} > (10)
                case (!hasLeftSpill && hasRightSpill):
                    const extraPagesMore = range(endPage + 1, endPage + spillOffset);
                    pages = [...pages, ...extraPagesMore, RIGHT_PAGE];
                    break;

                // handle: (1) < {4 5} [6] {7 8} > (10)
                case (hasLeftSpill && hasRightSpill):
                default: {
                    pages = [LEFT_PAGE, ...pages, RIGHT_PAGE];
                    break;
                }
            }

            return [1, ...pages, totalPages];
        }

        return range(1, totalPages);
    };


    render() {
        const pages = this.fetchPageNumbers();

        return this.props.totalData && (
            <>
                <div className={`w-100 py-3 d-flex flex-row flex-wrap align-items-center justify-content-${this.props.align}`}>
                    {
                        this.props.title &&
                        <small className='text-muted'>
                            Total {this.props.title.toLowerCase()} {this.props.totalData} items - showing
                            page {this.props.page} of {this.props.totalPage}
                        </small>
                    }

                    <div className="d-flex flex-row align-items-center">
                        <nav aria-label="Countries Pagination">
                            <ul className="pagination pagination-sm mb-0">
                                {
                                    pages.map((page, index) => {

                                        if (page === LEFT_PAGE) return (
                                            <li key={index} className="page-item">
                                                <button type="button" className="page-link" aria-label="Previous" onClick={this.handleMoveLeft}>
                                                    <span aria-hidden="true">...</span>
                                                    <span className="sr-only">Previous</span>
                                                </button>
                                            </li>
                                        );

                                        if (page === RIGHT_PAGE) return (
                                            <li key={index} className="page-item">
                                                <button type="button" className="page-link" aria-label="Next" onClick={this.handleMoveRight}>
                                                    <span aria-hidden="true">...</span>
                                                    <span className="sr-only">Next</span>
                                                </button>
                                            </li>
                                        );

                                        return (
                                            <li key={index} className={`page-item${ this.props.page === page ? ' active' : ''}`}>
                                                <Link className="page-link" to={`?page=${page}`} onClick={ this.handleClick(page) }>{ page }</Link>
                                            </li>
                                        );

                                    })
                                }
                            </ul>
                        </nav>
                    </div>
                </div>
            </>
        );
    }
}

Pagination.defaultProps = {
    align: 'center',
    pushHistory: true,
    triggerChangedOnMount: false,
    page: 1,
    totalPage: 0,
    pageNeighbours: 1,
}

Pagination.propTypes = {
    title: propTypes.string,
    align: propTypes.string,
    page: propTypes.number,
    totalData: propTypes.number,
    totalPage: propTypes.number,
    pushHistory: propTypes.bool,
    triggerChangedOnMount: propTypes.bool,
}

export default withRouter(Pagination);
