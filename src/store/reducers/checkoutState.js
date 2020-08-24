import {CHECKOUT_STATE} from '../types';

const initialState = null;

export default function (state = initialState, action) {
    switch (action.type) {
        case CHECKOUT_STATE:
            return action.payload;
        default:
            return state;
    }
}
