import {CHECKOUT_BOOKING} from '../types';
import config from "../../config";
import axios from "axios";

export const checkoutBooking = (payload) => (dispatch) => {
    dispatch({
        type: CHECKOUT_BOOKING,
        payload: payload
    })
}

export const submitBooking = (payload) => () => {
    return axios.post(`${config.apiUrl}/api/booking`, payload, {headers: {contentType: "multipart/form-data"}});
}