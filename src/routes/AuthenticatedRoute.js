import React, {useContext} from "react";
import {Route, Redirect} from 'react-router-dom';
import AuthContext from '../contexts/AuthContext'

const AuthenticatedRoute = ({ component: Component, ...rest }) => {
    const auth = useContext(AuthContext);
    const {render} = {...rest};
    return (
        <Route {...rest} render={(props) => {
            return (
                auth.user
                    ? (render ? render(props) : <Component {...props} />)
                    : <Redirect to={{
                        pathname: '/login',
                        state: { from: props.location }
                    }} />
            )
        }} />
    )
}

export default AuthenticatedRoute;
