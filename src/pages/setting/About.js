import React, {Component} from 'react';
import Fade from "react-reveal";
import IconText from "parts/IconText";

class Password extends Component {

    componentDidMount() {
        document.title = "Staycation | About";
    }

    render() {
        return (
            <Fade duration={250}>
                <h1 className="h5 mb-3">About</h1>
                <IconText/>
                <p>We help people find happiness and memorable moment</p>
                <p>Copyright {(new Date()).getFullYear()} • All rights reserved • Staycation</p>
            </Fade>
        )
    }
}

export default Password;
