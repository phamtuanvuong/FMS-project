import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'antd/dist/antd.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../layout/Home.css';
import { Outlet, Navigate } from 'react-router-dom';


class RoleAuth extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        let userInfo = JSON.parse(localStorage.getItem('cont'))?.userInfo || null;
        console.log(this.props.arrayAuth, this.props.arrayAuth.includes(userInfo.role));
        return (
            this.props.arrayAuth.includes(userInfo.role) ?
                <Outlet /> : <Navigate to="/unAuthorized" replace></Navigate>
        );
    }

};

export default RoleAuth;
