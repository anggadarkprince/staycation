import axios from 'axios'
import React, {Component} from 'react'
import {Link} from "react-router-dom";
import Fade from "react-reveal/Fade";
import config from "config";

class ForgotPasswordPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            email: '',
            password: '',
            remember: false,
            errors: []
        };

        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.hasErrorFor = this.hasErrorFor.bind(this);
        this.renderErrorFor = this.renderErrorFor.bind(this);
    }

    handleFieldChange(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    hasErrorFor(field) {
        return !!this.state.errors[field]
    }

    renderErrorFor(field, className = 'invalid-feedback') {
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

    handleRequestEmail(event) {
        event.preventDefault();

        this.setState({isLoading: true, errors: []});

        axios.post(`${config.apiUrl}/api/password/email`, {email: this.state.email, url: 'http://localhost:3001/reset-password'})
            .then(response => response.data)
            .then(data => {
                if (data.status === 'success') {
                    this.setState({
                        isLoading: false,
                        errors: {
                            alert: {
                                status: 'success',
                                message: data.message
                            }
                        }
                    });
                    setTimeout(() => {
                        this.props.history.push('/login');
                    }, 2000);
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
                this.setState({
                    isLoading: false,
                    errors: {
                        alert: {
                            status: 'danger',
                            message: error.message || error.response.data.message
                        }
                    }
                })
            });
    }

    render() {
        return (
            <>
                <Fade duration={600}>
                    <div className="container">
                        <div className='row mb-4'>
                            <div className='col-sm-6 col-md-4 mx-auto mt-2 mb-5'>
                                <h3 className='mb-0'>Reset Password</h3>
                                <p className='text-muted'>
                                    We'll send you an email with contains a link to reset your password.
                                </p>
                                <form method='post' onSubmit={this.handleRequestEmail.bind(this)}>
                                    {this.renderErrorFor('alert')}
                                    <div className='form-group'>
                                        <label htmlFor='email'>Email</label>
                                        <input id='email' type='email'
                                               className={`form-control ${this.hasErrorFor('email') ? 'is-invalid' : ''}`}
                                               name='email' placeholder={'Registered email address'} required maxLength='50'
                                               value={this.state.email} onChange={this.handleFieldChange} disabled={this.state.isLoading}/>
                                        {this.renderErrorFor('email')}
                                    </div>
                                    <button className='btn btn-block btn-primary mb-3' disabled={this.state.isLoading}>
                                        Request Reset Password
                                    </button>
                                </form>
                                <div className="text-center auth-control">
                                    <span>Remember password? </span>
                                    <Link to="/login">Sign In</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </Fade>
            </>
        )
    }
}

export default ForgotPasswordPage
