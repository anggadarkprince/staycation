import {CHECKOUT_BOOKING, CHECKOUT_STATE} from '../types';
import config from "../../config";
import axios from "axios";

export const checkoutBooking = (payload) => (dispatch) => {
    dispatch({
        type: CHECKOUT_BOOKING,
        payload: payload
    })
}

export const checkoutState = (payload) => (dispatch) => {
    dispatch({
        type: CHECKOUT_STATE,
        payload: payload
    })
}

export const submitBooking = (payload) => () => {
    return axios.post(`${config.apiUrl}/api/booking`, payload);
}

export const submitPayment = (payload) => () => {
    return axios.post(`${config.apiUrl}/api/booking/payment`, payload, {headers: {contentType: "multipart/form-data"}});
}
