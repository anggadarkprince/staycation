import React, {Component} from 'react';
import Fade from "react-reveal";

class Notification extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        document.title = "Staycation | Notification";
        window.scrollTo(0, 0);
    }

    render() {
        return (
            <Fade duration={250}>
                <h1 className="h5">Notification Preferences</h1>
            </Fade>
        )
    }
}

export default Notification;
