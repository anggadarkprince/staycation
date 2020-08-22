import {INIT_PAGE, FETCH_PAGE} from "../types";
import axios from "axios";

export const fetchPage = (url, page, callback = () => {}) => (dispatch) => {
    dispatch({
        type: INIT_PAGE,
        payload: null
    });
    return axios.get(url).then((response) => {
        dispatch({
            type: FETCH_PAGE,
            payload: {
                isLoading: false,
                [page]: response.data,
            },
        });
        callback(response.data);
    });
};