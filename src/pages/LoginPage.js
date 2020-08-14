import axios from 'axios'
import React, { Component } from 'react'
import {Link} from "react-router-dom";
import Header from "../parts/Header";
import Fade from "react-reveal/Fade";
import Button from "../elements/Button";
import Footer from "../parts/Footer";

class Login extends Component {

    constructor (props) {
        super(props);
        this.state = {
            isLoading: false,
            username: '',
            password: '',
            remember: false,
            errors: []
        };
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.hasErrorFor = this.hasErrorFor.bind(this);
        this.renderErrorFor = this.renderErrorFor.bind(this);
        this.props.initAuthState();
    }

    handleFieldChange (event) {
        if (event.target.name === 'remember') {
            this.setState({
                remember: event.target.checked
            });
        } else {
            this.setState({
                [event.target.name]: event.target.value
            });
        }
    }

    hasErrorFor (field) {
        return !!this.state.errors[field]
    }

    renderErrorFor (field, className = 'invalid-feedback') {
        if (this.hasErrorFor(field)) {
            if (field === 'alert') {
                const status = this.state.errors[field]?.status || 'warning';
                const message = this.state.errors[field]?.message || this.state.errors[field];
                return (
                    <div className={`alert alert-${status} alert-dismissible`} role="alert">
                        <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        {message}
                    </div>
                )
            }
            return (
                <span className={className}>
                    {this.state.errors[field][0]}
                </span>
            )
        }
    }

    handleLogin(event) {
        event.preventDefault();

        this.setState({isLoading: true, errors: []});

        const user = {
            username: this.state.username,
            password: this.state.password,
        };

        axios.post('http://localhost:3000/api/login', user)
            .then(response => response.data)
            .then(data => {
                if (data.status === 'success') {
                    this.setState({isLoading: false});
                    let expiredDate = new Date();
                    expiredDate.setMinutes(expiredDate.getMinutes() + 60);
                    localStorage.setItem('api_token', JSON.stringify({
                        tokenExpiredAt: expiredDate,
                        token: data.payload.token,
                        user: data.payload.user,
                        remember: this.state.remember,
                    }));
                    this.props.initAuthState();
                    this.props.history.push('/profile');
                } else {
                    this.setState({
                        isLoading: false,
                        errors: {
                            alert: {
                                status: 'danger',
                                message: data.message
                            }
                        }
                    });
                }
            })
            .catch(error => {
                console.log(error);
                this.setState({
                    isLoading: false,
                    errors: {
                        alert: {
                            status: 'danger',
                            message: error.message || error.response.data.message
                        }
                    }
                });
            });
    }

    render () {
        return (
            <>
                <Header {...this.props}/>
                <Fade duration={600}>
                    <div className="container">
                        <div className='row'>
                            <div className='col-sm-6 col-md-4 mx-auto mt-2 mb-5'>
                                <h3 className='mb-3'>Login</h3>
                                <form method='post' onSubmit={this.handleLogin.bind(this)}>
                                    {this.renderErrorFor('alert')}
                                    <div className='form-group'>
                                        <label htmlFor='username'>Username</label>
                                        <input id='username' type='text' className={`form-control ${this.hasErrorFor('username') ? 'is-invalid' : ''}`}
                                               name='username' placeholder={'Username or email address'} required maxLength='50' disabled={this.state.isLoading}
                                               value={this.state.username} onChange={this.handleFieldChange} />
                                        {this.renderErrorFor('username')}
                                    </div>
                                    <div className='form-group'>
                                        <label htmlFor='password'>Password</label>
                                        <input id='password' type='password' className={`form-control ${this.hasErrorFor('password') ? 'is-invalid' : ''}`}
                                               name='password' placeholder={'Your password'} required maxLength='50' disabled={this.state.isLoading}
                                               value={this.state.password} onChange={this.handleFieldChange} />
                                        {this.renderErrorFor('password')}
                                    </div>
                                    <div className="form-group auth-control">
                                        <div className="row">
                                            <div className="col">
                                                <div className="custom-control custom-checkbox">
                                                    <input type="checkbox" className="custom-control-input" id="remember" name="remember" value="1"
                                                           onChange={this.handleFieldChange} disabled={this.state.isLoading}/>
                                                    <label className="custom-control-label" htmlFor="remember">Remember me</label>
                                                </div>
                                            </div>
                                            <div className="col text-right">
                                                <Link to="/forgot-password">
                                                    Forgot password?
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                    <button className='btn btn-block btn-primary mb-3' disabled={this.state.isLoading}>
                                        Login
                                    </button>
                                </form>
                                <div className="text-center auth-control">
                                    <span>Not a member? </span>
                                    <Button type='link' href='/register'>
                                        Create new account
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Fade>
                <Footer/>
            </>
        )
    }
}

export default Login
