import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../layout/Common.css';
import {Breadcrumb} from 'antd';
import 'antd/dist/antd.min.css';

class HeaderPannel extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        let renderBreadCumb = this.props.breadcrumbList?.map(function (breadCumb, index) {
            return (
                <Breadcrumb.Item key={index}>{breadCumb}</Breadcrumb.Item>
            )
        });
        let renderButtonAction = this.props?.buttons?.map(function (button, index) {
            let styleMargin = {};
            // console.log(button.disabled, 'checkkkk')
            let disabled = button.disabled ? 'none' : 'inline';

            if (index >= 1) {
                styleMargin = {
                    marginLeft: '10px',
                    display: disabled
                };
            }
            else {
                styleMargin = {
                    display: disabled
                };
            }

            return (
                <div
                    key={index}
                    className={"button-" + button.classNameCustom + " button"}
                    onClick={button.action()}
                    style={styleMargin}
                >
                    {button.title}
                </div>
                //</Col>
            )
        });

        return (
            <div className={"header-" + this.props.classNameCustom + " padding-pannel border-form"}>
                <Row>
                    <Col xs={12} sm={12} md={this.props?.buttons?.length < 3? 6 : 12} lg={6} xl={6}>
                        <div className="left-headder">
                            <div className={"title-" + this.props.classNameCustom + ", title-pannel"}>{this.props.title}</div>
                            <div className={"breadcum-" + this.props.classNameCustom}>
                                <Breadcrumb separator=">">
                                    {renderBreadCumb}
                                </Breadcrumb>
                            </div>
                        </div>
                    </Col>
                    {renderButtonAction?
                    <Col xs={12} sm={12} md={this.props?.buttons?.length < 3? 6 : 12} lg={6} xl={6}>
                        <div className="right-headder">
                            <Row style={{ justifyContent: 'flex-end' }}>
                                {renderButtonAction}
                            </Row>
                        </div>
                    </Col>
                    :null}
                </Row>
            </div>
        );
    }

};

export default HeaderPannel;
