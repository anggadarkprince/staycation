import React from 'react';
import Fade from 'react-reveal/Fade';
import completedIllustration from 'assets/img/completed-illustration.png';

export default function Completed() {
    return (
        <Fade>
            <div className="container mb-4">
                <div className="row justify-content-center text-center">
                    <div className="col-5">
                        <img src={completedIllustration}
                             className="img-fluid" alt="Completed"/>
                        <p className="text-gray-500">
                            We will inform you via email later once the transaction has been accepted
                        </p>
                    </div>
                </div>
            </div>
        </Fade>
    );
}

