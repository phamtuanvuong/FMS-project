import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'antd/dist/antd.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../layout/Home.css';
import { Outlet } from 'react-router-dom';
import {
    handleHideNav,
    trans
} from '../../../../components/CommonFunction';
import { withTranslation } from 'react-i18next';

class Guideline extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    componentDidMount() {
        document.querySelector('.container').addEventListener('click', handleHideNav);
    }

    render() {

        return (
            <div className="container">
                <h2><b>{trans('guideline:title')}</b></h2>
                <span style={{ marginBottom: '20px' }}>{trans('guideline:description')}  <a style={{ textDecoration: 'underline' }} href='https://drive.google.com/drive/folders/1eGHY4pBT_PQ-ZQZHVU58GFabvYZCskJ3?usp=sharing' target="_blank">click here.</a></span>
                {/* <Row>
                    <Col
                        style={{ marginBottom: "10px" }}
                        xs={12}
                        sm={12}
                        md={12}
                        lg={12}
                        xl={12}
                    >
                        <HeaderPannel
                            // classNameCustom="checklist-report"
                            title="Guideline"
                            breadcrumbList={["Click here to view guideline"]}                            
                        />
                    </Col>
                </Row> */}
                <object
                    style={{ marginTop: "20px" }}
                    data='https://pdf.ac/FPk1T'
                    type="application/pdf"
                    width="100%"
                    height="678"
                />
            </div>

        );
    }

};

export default withTranslation(['guideline', 'common'])(Guideline);
