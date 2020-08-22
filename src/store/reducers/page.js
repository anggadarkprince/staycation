import {FETCH_PAGE} from "../types";

const initialState = {isLoading: true};

export default function (state = initialState, action) {
    switch (action.type) {
        case FETCH_PAGE:
            return action.payload;
        default:
            return state;
    }
}