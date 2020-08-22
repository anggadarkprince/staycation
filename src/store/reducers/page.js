import {FETCH_PAGE, INIT_PAGE} from "../types";

const initialState = {isLoading: true};

export default function (state = initialState, action) {
    switch (action.type) {
        case FETCH_PAGE:
            return {
                ...state, // maintain collection of pages
                ...action.payload,
            };
        case INIT_PAGE:
            return {
                ...state, // maintain collection of pages
                ...initialState // set loading to true
            };
        default:
            return state;
    }
}