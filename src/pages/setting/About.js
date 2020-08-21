import React, {Component} from 'react';
import Fade from "react-reveal";

class Password extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        document.title = "Staycation | About";
    }

    render() {
        return (
            <Fade duration={250}>
                <h1 className="h4">About</h1>
            </Fade>
        )
    }
}

export default Password;
