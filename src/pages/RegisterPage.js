import axios from 'axios'
import React, {Component} from 'react'
import Fade from "react-reveal/Fade";
import Button from "elements/Button";
import config from 'config';

class Register extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            name: '',
            username: '',
            email: '',
            password: '',
            password_confirmation: '',
            agree: 0,
            errors: []
        };
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.hasErrorFor = this.hasErrorFor.bind(this);
        this.renderErrorFor = this.renderErrorFor.bind(this);
        this.handleRegister = this.handleRegister.bind(this);
    }

    componentDidMount() {
        document.title = "Staycation | Register";
        window.scrollTo(0, 0);
    }

    handleFieldChange(event) {
        if (event.target.name === 'agree') {
            this.setState({
                agree: event.target.checked
            });
        } else {
            this.setState({
                [event.target.name]: event.target.value
            });
        }
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

    handleRegister(event) {
        event.preventDefault();

        this.setState({isLoading: true, errors: []});

        const user = {
            name: this.state.name,
            username: this.state.username,
            email: this.state.email,
            password: this.state.password,
            password_confirmation: this.state.password_confirmation,
            agree: this.state.agree,
        };

        axios.post(`${config.apiUrl}/api/register`, user)
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
                    return Promise.reject({message: 'Something went wrong'});
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
                            <div className='col-sm-6 col-md-5 mx-auto mt-2 mb-5'>
                                <h3 className='mb-3'>Register account</h3>
                                <form method='post' onSubmit={this.handleRegister}>
                                    {this.renderErrorFor('alert')}
                                    <div className="form-row">
                                        <div className="col-md-6">
                                            <div className='form-group'>
                                                <label htmlFor='name'>Name</label>
                                                <input id='name' type='text'
                                                       className={`form-control ${this.hasErrorFor('name') ? 'is-invalid' : ''}`}
                                                       name='name' placeholder={'Your full name'} required
                                                       maxLength='50' disabled={this.state.isLoading}
                                                       value={this.state.name} onChange={this.handleFieldChange}/>
                                                {this.renderErrorFor('name')}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className='form-group'>
                                                <label htmlFor='username'>Username</label>
                                                <input id='username' type='text'
                                                       className={`form-control ${this.hasErrorFor('username') ? 'is-invalid' : ''}`}
                                                       name='username' placeholder={'Username'} required maxLength='50'
                                                       disabled={this.state.isLoading}
                                                       value={this.state.username} onChange={this.handleFieldChange}/>
                                                {this.renderErrorFor('username')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='form-group'>
                                        <label htmlFor='email'>Email</label>
                                        <input id='email' type='email'
                                               className={`form-control ${this.hasErrorFor('email') ? 'is-invalid' : ''}`}
                                               name='email' placeholder={'Your email address'} required maxLength='50'
                                               disabled={this.state.isLoading}
                                               value={this.state.email} onChange={this.handleFieldChange}/>
                                        {this.renderErrorFor('email')}
                                    </div>
                                    <div className="form-row">
                                        <div className="col-md-6">
                                            <div className='form-group'>
                                                <label htmlFor='password'>Password</label>
                                                <input id='password' type='password'
                                                       className={`form-control ${this.hasErrorFor('password') ? 'is-invalid' : ''}`}
                                                       name='password' placeholder={'Your password'} required
                                                       maxLength='50' disabled={this.state.isLoading}
                                                       value={this.state.password} onChange={this.handleFieldChange}/>
                                                {this.renderErrorFor('password')}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className='form-group'>
                                                <label htmlFor='password_confirmation'>Confirm Password</label>
                                                <input id='password_confirmation' type='password'
                                                       className={`form-control ${this.hasErrorFor('password_confirmation') ? 'is-invalid' : ''}`}
                                                       name='password_confirmation' placeholder={'Type again'} required
                                                       maxLength='50' disabled={this.state.isLoading}
                                                       value={this.state.password_confirmation}
                                                       onChange={this.handleFieldChange}/>
                                                {this.renderErrorFor('password_confirmation')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group mb-4">
                                        <div
                                            className={`custom-control custom-checkbox ${this.hasErrorFor('agree') ? 'is-invalid' : ''}`}>
                                            <input type="checkbox" className="custom-control-input" id="agree"
                                                   name="agree" value="1" onChange={this.handleFieldChange}
                                                   disabled={this.state.isLoading}/>
                                            <label className="custom-control-label" htmlFor="agree">I agree to the terms
                                                and condition.</label>
                                        </div>
                                        {this.renderErrorFor('agree')}
                                    </div>
                                    <button className='btn btn-block btn-primary mb-3' disabled={this.state.isLoading}>
                                        Register
                                    </button>
                                </form>
                                <div className="text-center auth-control">
                                    <span>Already have and account? </span>
                                    <Button type='link' href='/login'>
                                        Sign In
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Fade>
            </>
        )
    }
}

export default Register
