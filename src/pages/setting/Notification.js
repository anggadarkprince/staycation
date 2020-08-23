import React, {Component} from 'react';
import Fade from "react-reveal";
import {scrollToTarget} from "utilities/scroller";
import axios from "axios";
import config from "../../config";
import Button from "../../elements/Button";

class Notification extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            notificationBookingEmail: props.notification.notificationBookingEmail,
            notificationBookingApp: props.notification.notificationBookingApp,
            notificationUserEmail: props.notification.notificationUserEmail,
            notificationUserApp: props.notification.notificationUserApp,
            notificationInsightEmail: props.notification.notificationInsightEmail,
            notificationInsightApp: props.notification.notificationInsightApp,
            errors: []
        };
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.hasErrorFor = this.hasErrorFor.bind(this);
        this.renderErrorFor = this.renderErrorFor.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
    }

    componentDidMount() {
        document.title = "Staycation | Notification";
    }

    handleFieldChange(event) {
        this.setState({
            [event.target.name]: event.target.checked
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

        const notification = {
            notificationBookingEmail: this.state.notificationBookingEmail,
            notificationBookingApp: this.state.notificationBookingApp,
            notificationUserEmail: this.state.notificationUserEmail,
            notificationUserApp: this.state.notificationUserApp,
            notificationInsightEmail: this.state.notificationInsightEmail,
            notificationInsightApp: this.state.notificationInsightApp,
        };

        axios.post(`${config.apiUrl}/api/setting/notification`, notification)
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
                    <h1 className="h5">Notification Preferences</h1>
                    <p className="text-muted">Choose what you want to be notified about</p>
                    <table className="table">
                        <thead>
                        <tr>
                            <th>Notification</th>
                            <th className="text-center">Email</th>
                            <th className="text-center">App</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>Booking Update</td>
                            <td className="text-center">
                                <div className="custom-control custom-checkbox">
                                    <input type="checkbox" className="custom-control-input" id="notificationBookingEmail" name="notificationBookingEmail" value="1"
                                           onChange={this.handleFieldChange} checked={this.state.notificationBookingEmail}
                                           disabled={this.state.isLoading}/>
                                    <label className="custom-control-label" htmlFor="notificationBookingEmail"/>
                                </div>
                            </td>
                            <td className="text-center">
                                <div className="custom-control custom-checkbox">
                                    <input type="checkbox" className="custom-control-input" id="notificationBookingApp" name="notificationBookingApp" value="1"
                                           onChange={this.handleFieldChange} checked={this.state.notificationBookingApp}
                                           disabled={this.state.isLoading}/>
                                    <label className="custom-control-label" htmlFor="notificationBookingApp"/>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td className="border-0">User Update</td>
                            <td className="border-0 text-center">
                                <div className="custom-control custom-checkbox">
                                    <input type="checkbox" className="custom-control-input" id="notificationUserEmail" name="notificationUserEmail" value="1"
                                           onChange={this.handleFieldChange} checked={this.state.notificationUserEmail}
                                           disabled={this.state.isLoading}/>
                                    <label className="custom-control-label" htmlFor="notificationUserEmail"/>
                                </div>
                            </td>
                            <td className="border-0 text-center">
                                <div className="custom-control custom-checkbox">
                                    <input type="checkbox" className="custom-control-input" id="notificationUserApp" name="notificationUserApp" value="1"
                                           onChange={this.handleFieldChange} checked={this.state.notificationUserApp}
                                           disabled={this.state.isLoading}/>
                                    <label className="custom-control-label" htmlFor="notificationUserApp"/>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td className="border-0">Accommodation Insight</td>
                            <td className="border-0 text-center">
                                <div className="custom-control custom-checkbox">
                                    <input type="checkbox" className="custom-control-input" id="notificationInsightEmail" name="notificationInsightEmail" value="1"
                                           onChange={this.handleFieldChange} checked={this.state.notificationInsightEmail}
                                           disabled={this.state.isLoading}/>
                                    <label className="custom-control-label" htmlFor="notificationInsightEmail"/>
                                </div>
                            </td>
                            <td className="border-0 text-center">
                                <div className="custom-control custom-checkbox">
                                    <input type="checkbox" className="custom-control-input" id="notificationInsightApp" name="notificationInsightApp" value="1"
                                           onChange={this.handleFieldChange} checked={this.state.notificationInsightApp}
                                           disabled={this.state.isLoading}/>
                                    <label className="custom-control-label" htmlFor="notificationInsightApp"/>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
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

export default Notification;
