import {combineReducers} from "redux";
import checkout from "./checkout";
import checkoutState from "./checkoutState";
import page from "./page";

export default combineReducers({
    checkout,
    checkoutState,
    page,
});
