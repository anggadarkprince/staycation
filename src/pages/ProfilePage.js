import axios from 'axios'
import React, {Component} from 'react'
import Header from "../parts/Header";
import Footer from "../parts/Footer";
import Button from "../elements/Button";
import Spinner from "../elements/Spinner";
import config from 'config';

class ProfilePage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            user: {},
        };
    }

    componentDidMount() {
        axios.get(`${config.apiUrl}/api/profile`)
            .then(response => {
                this.setState({isLoading: false, user: response.data.user});
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
                <Header {...this.props}/>
                <div className="container my-4 mb-5">
                    {
                        this.state.isLoading ? <Spinner className="text-center"/> :
                        <div className="d-flex align-items-center">
                            <img src={user.avatar} alt={user.name} className="rounded-circle mb-3 mr-3"
                                 style={{maxWidth: 120}}/>
                            <div>
                                <h4 className="mb-1">{user.name}</h4>
                                <p className="mb-0">@{user.username} <span className="mx-2">•</span>
                                    <Button type="link" href="/edit-profile">
                                        Edit Profile
                                    </Button>
                                </p>
                                <p className="text-muted small mb-2">{user.email}</p>
                            </div>
                        </div>
                    }
                </div>
                <Footer/>
            </>
        )
    }
}

export default ProfilePage;
