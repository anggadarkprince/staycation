import React, {Component} from 'react';
import {Route, Switch} from "react-router-dom";
import Basic from "pages/setting/Basic";
import Notification from "pages/setting/Notification";
import Password from "pages/setting/Password";
import About from "pages/setting/About";
import Button from "elements/Button";
import Fade from "react-reveal";
import {backToTop} from "utilities/scroller";

class Setting extends Component {

    componentDidMount() {
        document.title = "Staycation | Setting";
        backToTop();
    }

    getActiveLinkClass = path => {
        return this.props.location.pathname === path ? 'active font-weight-medium' : 'text-muted';
    }

    render() {
        return (
            <>
                <div className="d-flex flex-row">
                    <Fade bottom duration={300}>
                        <nav className="nav flex-column flex-shrink-0 mr-4" style={{minWidth: 250}}>
                            <Button className={`nav-link ${this.getActiveLinkClass(`${this.props.match.path}`)}`} type="link" href={`${this.props.match.path}`}>Basic</Button>
                            <Button className={`nav-link ${this.getActiveLinkClass(`${this.props.match.path}/notification`)}`} type="link" href={`${this.props.match.path}/notification`}>Notification</Button>
                            <Button className={`nav-link ${this.getActiveLinkClass(`${this.props.match.path}/password`)}`} type="link" href={`${this.props.match.path}/password`}>Password</Button>
                            <Button className={`nav-link ${this.getActiveLinkClass(`${this.props.match.path}/about`)}`} type="link" href={`${this.props.match.path}/about`}>About</Button>
                        </nav>
                    </Fade>
                    <div className="flex-grow-1">
                        <Switch>
                            <Route path={`${this.props.match.path}`} exact render={(props) => <Basic {...props} fetchUser={this.props.fetchUser} user={this.props.user} />} />
                            <Route path={`${this.props.match.path}/notification`} render={(props) => <Notification {...props} fetchUser={this.props.fetchUser} notification={this.props.user.preferences} />} />
                            <Route path={`${this.props.match.path}/password`} render={(props) => <Password {...props} fetchUser={this.props.fetchUser} user={this.props.user} />} />
                            <Route path={`${this.props.match.path}/about`} component={About} />
                        </Switch>
                    </div>
                </div>
            </>
        )
    }
}

export default Setting;
