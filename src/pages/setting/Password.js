import React, {Component} from 'react';
import Fade from "react-reveal";
import axios from "axios";
import config from "../../config";
import {scrollToTarget} from "../../utilities/scroller";
import Button from "../../elements/Button";

class Password extends Component {

    constructor(props) {
        super(props);
        this.state = {
            password: '',
            newPassword: '',
            confirmPassword: '',
            errors: []
        }
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.hasErrorFor = this.hasErrorFor.bind(this);
        this.renderErrorFor = this.renderErrorFor.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);

        this.refFormPassword = React.createRef();
        this.refConfirmPassword = React.createRef();
    }

    componentDidMount() {
        document.title = "Staycation | Change Password";
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
                    <div className={`alert alert-${status} alert-dismissible`} role="alert" id="alert-message">
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

    handleUpdate(event) {
        event.preventDefault();

        if (this.state.newPassword !== this.state.confirmPassword) {
            this.refConfirmPassword.current.focus();
            return;
        }

        this.setState({isLoading: true, errors: []});

        const password = {
            password: this.state.password,
            newPassword: this.state.newPassword,
        };

        axios.post(`${config.apiUrl}/api/setting/password`, password)
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
                    scrollToTarget('profile-nav');
                    this.setState({
                        password: '',
                        newPassword: '',
                        confirmPassword: '',
                    });
                    console.log(this.refFormPassword);
                    this.refFormPassword.current.reset();
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
            <Fade duration={250}>
                <div>
                    <form method='post' onSubmit={this.handleUpdate} ref={this.refFormPassword}>
                        {this.renderErrorFor('alert')}

                        <h1 className="h5 mb-3">Change Password</h1>
                        <div className='form-group'>
                            <label htmlFor='password'>Current Password</label>
                            <input id='password' type='password'
                                   className={`form-control ${this.hasErrorFor('password') ? 'is-invalid' : ''}`}
                                   name='password' placeholder={'Your current password'} required
                                   maxLength='50' disabled={this.state.isLoading}
                                   value={this.state.password} onChange={this.handleFieldChange}/>
                            {this.renderErrorFor('password')}
                        </div>
                        <div className="form-row">
                            <div className="col-md-6">
                                <div className='form-group'>
                                    <label htmlFor='newPassword'>New Password</label>
                                    <input id='newPassword' type='password'
                                           className={`form-control ${this.hasErrorFor('newPassword') ? 'is-invalid' : ''}`}
                                           name='newPassword' placeholder={'Type new password'} required
                                           maxLength='50' disabled={this.state.isLoading}
                                           value={this.state.newPassword} onChange={this.handleFieldChange}/>
                                    {this.renderErrorFor('newPassword')}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className='form-group'>
                                    <label htmlFor='confirmPassword'>Confirm Password</label>
                                    <input id='confirmPassword' type='password' ref={this.refConfirmPassword}
                                           className={`form-control ${this.hasErrorFor('confirmPassword') ? 'is-invalid' : ''}`}
                                           name='confirmPassword' placeholder={'Repeat the new password'} required
                                           maxLength='50'
                                           disabled={this.state.isLoading}
                                           value={this.state.confirmPassword} onChange={this.handleFieldChange}/>
                                    {this.renderErrorFor('confirmPassword')}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <Button className='btn btn-success mb-3' type="button" isLoading={this.state.isLoading}>
                                Update Password
                            </Button>
                        </div>
                    </form>
                </div>
            </Fade>
        )
    }
}

export default Password;
