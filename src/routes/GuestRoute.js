import React, {useContext} from "react";
import {Route, Redirect} from 'react-router-dom';
import AuthContext from '../contexts/AuthContext'

const GuestRoute = ({ component: Component, ...rest }) => {
    const auth = useContext(AuthContext);
    const {render} = {...rest};
    return (
        <Route {...rest} render={(props) => {
            return (
                auth.user
                    ? <Redirect to={'/profile'} />
                    : (render ? render(props) : <Component {...props} />)
            )
        }} />
    )
}

export default GuestRoute;
