import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import 'assets/scss/styles.scss';
import 'jquery';
import 'bootstrap';
import config from 'config';
import axios from "axios";
import AuthContext, {authDefaultValue} from "contexts/AuthContext";
import LandingPage from "pages/LandingPage";
import DetailPage from "pages/DetailPage";
import CheckoutPage from "pages/CheckoutPage";
import TermPage from "pages/TermPage";
import PrivacyPage from "pages/PrivacyPage";
import CareerPage from "pages/CareerPage";
import RegisterPage from "pages/RegisterPage";
import LoginPage from "pages/LoginPage";
import ProfilePage from "pages/ProfilePage";
import ForgotPassword from "pages/ForgotPassword";
import ResetPassword from "pages/ResetPassword";
import Error404 from "pages/Error404";
import Layout from "pages/layouts/Layout";
import AuthenticatedRoute from "routes/AuthenticatedRoute";
import GuestRoute from "routes/GuestRoute";

class App extends Component {
    homeRoute = '/profile';
    redirectRoute = '/login';

    constructor(props) {
        super(props);

        const apiTokenData = this.getAuthToken();
        this.state = {
            layout: 'landing',
            auth: apiTokenData ? {...apiTokenData, logout: this.logout.bind(this)} : authDefaultValue,
        }
        this.initAuthState();
    }

    getAuthToken() {
        const tokenItemKey = 'api_token';
        const apiToken = localStorage.getItem(tokenItemKey);
        return apiToken ? JSON.parse(apiToken) : null;
    }

    initAuthState(callback = () => {}) {
        const apiTokenData = this.getAuthToken();
        if (apiTokenData) {
            /**
             * we already set tokens in http only cookie (secure),
             * this line is optional (but server must set cookie for access token long-lived)
             * because when cookie expired it would excluded from request and marked as unauthenticated request,
             * the app will redirect to login page rather than use refresh token to get new access token.
             */
            axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
            axios.interceptors.request.use((config) => {
                config.headers.Authorization = 'Bearer ' + apiTokenData.token;
                return config;
            });
        }

        axios.defaults.withCredentials = true;
        axios.interceptors.response.use(function (response) {
            return response;
        }, error => {
            if ((error.response.status || 500) === 401 || (error.response?.data?.status || '') === 'expired') {
                // token expired try get new access token with refresh token
                // remove this condition if we always try to use refresh token first before redirect to login page
                if (error.response.data.status === 'expired') {
                    const originalRequest = error.config;

                    // optional added in body request (already live in http only cookie)
                    return axios.post(`${config.apiUrl}/api/token`, {
                            //refreshToken: apiTokenData.refreshToken,
                            email: apiTokenData.user.email,
                        })
                        .then(response => response.data)
                        .then(data => {
                            apiTokenData.token = data.token;
                            localStorage.setItem('api_token', JSON.stringify(apiTokenData));
                            axios.interceptors.request.use((config) => {
                                config.headers.Authorization = 'Bearer ' + apiTokenData.token;
                                return config;
                            });
                            return axios(originalRequest);
                        });
                } else {
                    console.log('Unauthorized or refresh token expired');
                    localStorage.removeItem('api_token');
                    window.location = this.redirectRoute;
                }
            } else {
                return Promise.reject(error);
            }
        });

        this.setState({
            auth: apiTokenData ? {...apiTokenData, logout: this.logout.bind(this)} : authDefaultValue
        }, function () {
            callback();
        });
    }

    logout(redirect = true, callback = () => {}) {
        axios.post(`${config.apiUrl}/api/logout`)
            .then(result => {
                this.setState({auth: authDefaultValue}, () => {
                    localStorage.removeItem('api_token');
                    if(redirect) {
                        window.location = this.redirectRoute;
                    } else {
                        callback();
                    }
                });
            })
            .catch(console.log);
    }

    onChangeLayout(layout) {
        this.setState({layout: layout});
    }

    render() {
        return (
            <AuthContext.Provider value={this.state.auth}>
                <div className='App'>
                    <Router>
                        <Layout layout={this.state.layout}>
                            <Switch>
                                <Route path='/' exact component={LandingPage}/>
                                <Route path='/properties/:id' component={DetailPage}/>
                                <Route path='/terms' component={TermPage}/>
                                <Route path='/privacy' component={PrivacyPage}/>
                                <Route path='/careers' component={CareerPage}/>
                                <GuestRoute path='/register' component={RegisterPage}/>
                                <GuestRoute path='/login' render={(props) => <LoginPage {...props} initAuthState={this.initAuthState.bind(this)} />}/>
                                <GuestRoute path='/forgot-password' component={ForgotPassword}/>
                                <GuestRoute path='/reset-password/:token' component={ResetPassword}/>
                                <AuthenticatedRoute path='/checkout' render={(props) => <CheckoutPage {...props} onChangeLayout={this.onChangeLayout.bind(this)} />}/>
                                <AuthenticatedRoute path='/profile' component={ProfilePage}/>
                                <Route component={Error404} />
                            </Switch>
                        </Layout>
                    </Router>
                </div>
            </AuthContext.Provider>
        );
    }
}

export default App;
