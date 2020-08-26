import React, {Component} from 'react';
import Fade from 'react-reveal/Fade';
import Button from 'elements/Button';
import BrandIcon from 'parts/IconText';
import AuthContext from '../contexts/AuthContext';
import {Link} from 'react-router-dom'

export default class Header extends Component {

    getActiveLinkClass = path => {
        return this.props.location.pathname === path ? ' active' : '';
    }

    render() {
        if (this.props.isCentered) {
            return (
                <Fade>
                    <header className='spacing-sm'>
                        <div className='container'>
                            <nav className="navbar navbar-expand-lg navbar-light">
                                <Button className="navbar-brand mx-auto" href="/" type="link">
                                    Stay<span className="text-body">cation.</span>
                                </Button>
                            </nav>
                        </div>
                    </header>
                </Fade>
            );
        }

        return (
            <AuthContext.Consumer>
                {auth => {
                    return (
                        <Fade top>
                            <header className='spacing-sm'>
                                <div className='container'>
                                    <nav className="navbar navbar-expand-lg navbar-light">
                                        <BrandIcon/>
                                        <div className="collapse navbar-collapse">
                                            <ul className="navbar-nav ml-auto">
                                                <li className={`nav-item${this.getActiveLinkClass('/')}`}>
                                                    <Button className='nav-link' type='link' href='/'>
                                                        Home
                                                    </Button>
                                                </li>
                                                <li className={`nav-item${this.getActiveLinkClass('/explore')}`}>
                                                    <Button className='nav-link' type='link' href='/explore'>
                                                        Explore
                                                    </Button>
                                                </li>
                                                <li className={`nav-item${this.getActiveLinkClass('/stories')}`}>
                                                    <Button className='nav-link' type='link' href='/stories'>
                                                        Stories
                                                    </Button>
                                                </li>
                                                {
                                                    auth.user ?
                                                    (
                                                        <li className="nav-item dropdown">
                                                            <Link className='nav-link dropdown-toggle' to="/profile" data-toggle="dropdown">
                                                                {auth.user.name}
                                                            </Link>
                                                            <div className="dropdown-menu dropdown-menu-right">
                                                                <Button className='dropdown-item' type='link' href='/profile'>
                                                                    Profile
                                                                </Button>
                                                                <Button className='dropdown-item' type='link' href='/profile/all-bookings'>
                                                                    My Booking
                                                                </Button>
                                                                <Button className='dropdown-item' type='link' href='/profile/setting'>
                                                                    Settings
                                                                </Button>
                                                                <div className="dropdown-divider"/>
                                                                <Button className='dropdown-item' type='button' onClick={() => auth.logout(false, () => this.props.history.push('/login'))}>
                                                                    Logout
                                                                </Button>
                                                            </div>
                                                        </li>
                                                    ) :
                                                    (

                                                        <li className={`nav-item${this.getActiveLinkClass('/login')}`}>
                                                            <Button className='nav-link' type='link' href='/login'>
                                                                Login
                                                            </Button>
                                                        </li>
                                                    )
                                                }
                                            </ul>
                                            {
                                                auth.user ? null :
                                                    (
                                                        <Button className='nav-link btn' type='link' isSmall isPrimary href='/register'>
                                                            Register
                                                        </Button>
                                                    )
                                            }
                                        </div>
                                    </nav>
                                </div>
                            </header>
                        </Fade>
                    );
                }}

            </AuthContext.Consumer>
        );
    }
}
