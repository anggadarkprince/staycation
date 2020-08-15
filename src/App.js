import React, {Component} from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import './assets/scss/styles.scss';
import 'jquery';
import 'bootstrap';
import axios from "axios";
import AuthContext, {authDefaultValue} from "./AuthContext";
import LandingPage from "./pages/LandingPage";
import DetailPage from "./pages/DetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import TermPage from "./pages/TermPage";
import PrivacyPage from "./pages/PrivacyPage";
import CareerPage from "./pages/CareerPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

class App extends Component {

    constructor(props) {
        super(props);

        const apiTokenData = this.getAuthToken();
        this.state = {
            auth: apiTokenData ? {...apiTokenData, logout: this.logout.bind(this)} : authDefaultValue,
            pageReady: false
        }

        this.initAuthState();
    }

    getAuthToken() {
        const tokenItemKey = 'api_token';
        const apiToken = localStorage.getItem(tokenItemKey);
        return apiToken ? JSON.parse(apiToken) : null;
    }

    initAuthState() {
        const guest = ['/login', '/register', '/forgot-password', '/password/reset', '/email/verify'];
        const apiTokenData = this.getAuthToken();
        if (apiTokenData) {
            if (guest.find(path => window.location.pathname.startsWith(path))) {
                window.location = '/profile';
            } else {
                this.state.pageReady = true;
            }
            axios.interceptors.request.use((config) => {
                config.headers.Authorization = 'Bearer ' + apiTokenData.token;
                return config;
            });
        } else {
            this.state.pageReady = true;
        }

        axios.interceptors.response.use(function (response) {
            return response;
        }, error => {
            if (error.response.status === 401) {
                // token expired try get new access token with refresh token
                if (error.response.data.status === 'expired') {
                    const originalRequest = error.config;

                    return axios.post("http://localhost:3000/api/token", {
                            refreshToken: apiTokenData.refreshToken,
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
                    window.location = '/login';
                }
            }

            return Promise.reject(error);
        });
    }

    logout() {
        this.setState({auth: authDefaultValue}, function () {
            localStorage.removeItem('api_token');
            window.location = '/login';
        });
    }

    render() {
        return (
            this.state.pageReady && <AuthContext.Provider value={this.state.auth}>
                <div className='App'>
                    <Router>
                        <Route path='/' exact component={LandingPage}/>
                        <Route path='/properties/:id' component={DetailPage}/>
                        <Route path='/checkout' component={CheckoutPage}/>
                        <Route path='/terms' component={TermPage}/>
                        <Route path='/privacy' component={PrivacyPage}/>
                        <Route path='/careers' component={CareerPage}/>
                        <Route path='/register' render={(props) => <RegisterPage {...props} initAuthState={this.initAuthState.bind(this)} />}/>
                        <Route path='/login' render={(props) => <LoginPage {...props} initAuthState={this.initAuthState.bind(this)} />}/>
                        <Route path='/forgot-password' component={ForgotPassword}/>
                        <Route path='/reset-password/:token' component={ResetPassword}/>
                        <Route path='/profile' component={ProfilePage}/>
                    </Router>
                </div>
            </AuthContext.Provider>
        );
    }
}

export default App;
