import {RATE_BOOKING} from '../types';
import config from "../../config";
import axios from "axios";

export const rateBooking = (payload) => (dispatch) => {
    dispatch({
        type: RATE_BOOKING,
        payload: payload
    })
}

export const submitRating = (payload) => () => {
    return axios.put(`${config.apiUrl}/api/booking/rate/${payload._id}`, payload);
}
