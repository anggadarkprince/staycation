import React, {Component} from 'react';
import Fade from 'react-reveal/Fade';
import Button from "elements/Button";
import IconText from "parts/IconText";
import AuthContext from "../contexts/AuthContext";

export default class Footer extends Component {

    render() {
        return (
            <Fade bottom>
                <footer>
                    <div className="container">
                        <div className="row">
                            <div className="col">
                                <IconText/>
                                <p className="brand-tagline">
                                    We help people find happiness and memorable moment
                                </p>
                            </div>
                            <div className="col-2 mr-5">
                                <h6 className="mt-2">
                                    For Beginners
                                </h6>
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item">
                                        <Button type="link" href="/">Home</Button>
                                    </li>
                                    <li className="list-group-item">
                                        <AuthContext.Consumer>
                                            {auth => (
                                                auth.user ?
                                                    <Button type="link" href="/profile">
                                                        My Account
                                                    </Button>
                                                    :
                                                    <Button type="link" href="/register">
                                                        New Account
                                                    </Button>
                                            )}
                                        </AuthContext.Consumer>
                                    </li>
                                    <li className="list-group-item">
                                        <Button type="link" href="/explore">Explore</Button>
                                    </li>
                                </ul>
                            </div>
                            <div className="col-2 mr-5">
                                <h6 className="mt-2">
                                    Explore Us
                                </h6>
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item">
                                        <Button type="link" href="/careers">Careers</Button>
                                    </li>
                                    <li className="list-group-item">
                                        <Button type="link" href="/privacy">Privacy</Button>
                                    </li>
                                    <li className="list-group-item">
                                        <Button type="link" href="/terms">Terms & Conditions</Button>
                                    </li>
                                </ul>
                            </div>
                            <div className="col-3">
                                <h6 className="mt-2">
                                    Getting Touch
                                </h6>
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item">
                                        <Button isExternal type="link" href="mailto:support@staycation.id">
                                            support@staycation.id
                                        </Button>
                                    </li>
                                    <li className="list-group-item">
                                        <Button isExternal type="link" href="tel:62655479858">+62856-5547-9868</Button>
                                    </li>
                                    <li className="list-group-item">
                                        <span>Avenue Street 7th Jakarta</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col text-center copyright">
                                Copyright {(new Date()).getFullYear()} • All rights reserved • Staycation
                            </div>
                        </div>
                    </div>
                </footer>
            </Fade>
        );
    }
}

