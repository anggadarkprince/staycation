import axios from 'axios';
import React, {Component} from 'react';
import {Route, Switch} from 'react-router-dom';
import Button from "../elements/Button";
import Spinner from "../elements/Spinner";
import config from 'config';
import Profile from 'pages/profile/Profile';
import Outstanding from 'pages/profile/Outstanding';
import Booking from 'pages/profile/Booking';
import Setting from 'pages/profile/Setting';
import Fade from "react-reveal";

class ProfilePage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            user: {},
        };
        this.fetchUser = this.fetchUser.bind(this);
    }

    componentDidMount() {
        this.fetchUser();
    }

    getActiveLinkClass = (path, startWith = false) => {
        const pathName = this.props.location.pathname;
        return (startWith ? pathName.startsWith(path) : pathName === path) ? 'active font-weight-medium' : 'text-muted';
    }

    fetchUser() {
        axios.get(`${config.apiUrl}/api/profile`)
            .then(response => response.data)
            .then(data => {
                this.setState({isLoading: false, user: data.user});
                document.title = "Staycation | " + data.user.name;
            })
            .catch(error => {
                if (error.response.status === 401) {
                    this.props.history.replace({pathname: '/login'});
                }
            });
    }

    render() {
        const user = this.state.user;

        return (
            <>
                <div className="container my-4 mb-5">
                    {
                        this.state.isLoading ? <Spinner className="text-center" style={{minHeight: 200}}/> :
                            <>
                                <Fade>
                                    <div className="d-flex align-items-center">
                                        <img src={user.avatar} alt={user.name} className="rounded-circle mb-3 mr-3"
                                             style={{maxWidth: 120, height: 120}}/>
                                        <div>
                                            <h4 className="mb-1">{user.name}</h4>
                                            <p className="mb-0">@{user.username} <span className="mx-2">•</span>
                                                <Button type="link" href="/profile/setting">
                                                    Edit Profile
                                                </Button>
                                            </p>
                                            <p className="text-muted small mb-2">{user.email}</p>
                                        </div>
                                    </div>
                                    <ul className="nav nav-pills border-bottom border-top py-3 mb-4" id="profile-nav">
                                        <li className="nav-item">
                                            <Button className={`nav-link ${this.getActiveLinkClass('/profile')}`} type='link' href='/profile'>
                                                Home
                                            </Button>
                                        </li>
                                        <li className="nav-item">
                                            <Button className={`nav-link ${this.getActiveLinkClass('/profile/outstanding')}`} type='link' href='/profile/outstanding'>
                                                Outstanding
                                            </Button>
                                        </li>
                                        <li className="nav-item">
                                            <Button className={`nav-link ${this.getActiveLinkClass('/profile/all-bookings')}`} type='link' href='/profile/all-bookings'>
                                                All Bookings
                                            </Button>
                                        </li>
                                        <li className="nav-item">
                                            <Button className={`nav-link ${this.getActiveLinkClass('/profile/setting', true)}`} type='link' href='/profile/setting'>
                                                Setting
                                            </Button>
                                        </li>
                                    </ul>
                                </Fade>
                                <Switch>
                                    <Route path={`${this.props.match.path}`} exact render={(props) => <Profile {...props} bookings={user.bookings.completedBookings} />} />
                                    <Route path={`${this.props.match.path}/outstanding`} render={(props) => <Outstanding {...props} bookings={user.bookings.outstandingBookings} />} />
                                    <Route path={`${this.props.match.path}/all-bookings`} render={(props) => <Booking {...props} bookings={user.bookings.allBookings} />} />
                                    <Route path={`${this.props.match.path}/setting`} render={(props) => <Setting {...props} fetchUser={this.fetchUser} user={user} />} />
                                </Switch>
                            </>
                    }
                </div>
            </>
        )
    }
}

export default ProfilePage;
