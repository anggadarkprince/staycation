import React, {Component} from 'react';
import Button from "elements/Button";
import {scrollToTarget} from "utilities/scroller";
import axios from "axios";
import config from "config";
import moment from "moment";
import Fade from "react-reveal";

class Basic extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            name: props.user.name,
            username: props.user.username,
            email: props.user.email,
            phoneNumber: props.user.member.phoneNumber,
            dateOfBirth: moment(props.user.member.dateOfBirth).format('DD MMMM Y'),
            address: props.user.member.address,
            errors: []
        };
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.hasErrorFor = this.hasErrorFor.bind(this);
        this.renderErrorFor = this.renderErrorFor.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
    }

    componentDidMount() {
        document.title = "Staycation | Basic Profile";
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

        this.setState({isLoading: true, errors: []});

        const user = {
            name: this.state.name,
            username: this.state.username,
            email: this.state.email,
            phoneNumber: this.state.phoneNumber,
            dateOfBirth: this.state.dateOfBirth,
            address: this.state.address,
        };

        axios.post(`${config.apiUrl}/api/setting/basic`, user)
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
                    this.props.fetchUser();
                    scrollToTarget('profile-nav');
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
            <Fade duration={250}>
                <form method='post' onSubmit={this.handleUpdate}>
                    {this.renderErrorFor('alert')}

                    <h1 className="h5 mb-3">Basic Info</h1>
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

                    <h1 className="h5 mt-5 mb-3">Contact</h1>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="phoneNumber">Phone Number</label>
                                <input type="text" className="form-control" id="phoneNumber" name="phoneNumber"
                                       required maxLength="20" placeholder="Phone number"
                                       disabled={this.state.isLoading} value={this.state.phoneNumber} onChange={this.handleFieldChange}/>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="dateOfBirth">Date of Birth</label>
                                <input type="text" className="form-control datepicker" id="dateOfBirth" name="dateOfBirth" autoComplete="off" required maxLength="20"
                                       disabled={this.state.isLoading} value={this.state.dateOfBirth} onChange={this.handleFieldChange}/>
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="address">Address</label>
                        <textarea className="form-control" id="address" name="address" maxLength="200" placeholder="Enter your address"
                                  disabled={this.state.isLoading} onChange={this.handleFieldChange} value={this.state.address}/>
                    </div>

                    <div className="text-right">
                        <Button className='btn btn-success mb-3' type="button" isLoading={this.state.isLoading}>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Fade>
        )
    }
}

export default Basic;
