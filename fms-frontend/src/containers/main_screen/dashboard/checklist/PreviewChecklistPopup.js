import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../layout/Common.css';
import {
    Form, Upload, Checkbox, Input
} from 'antd';
import 'antd/dist/antd.min.css';
import {
    trans
} from '../../../../components/CommonFunction';
import { withTranslation } from 'react-i18next';

const { Dragger } = Upload;

class PreviewChecklistPopup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            errors: {}

        };
    }

    onCancel = () => {
        this.props.options.onCancel(this.state.data);
    }

    render() {
        let props = this.props.options;
        const data = props.data;
        const renderChecklistsContent =
            data ? data.map(function (item, indexContain) {
                let renderCheckbox = item.listReqs.map(function (requirement, index) {
                    let mdSizeCol = 5;
                    let lgSizeCol = 3;
                    if (requirement.length > 20 && requirement.length < 70) {
                        mdSizeCol = 5;
                        lgSizeCol = 4;
                    } else if (requirement.length >= 60) {
                        mdSizeCol = 6;
                        lgSizeCol = 5;
                    }
                    return (
                        <Col xs={12} sm={12} md={mdSizeCol} lg={lgSizeCol} xl={lgSizeCol} key={index} className="requirement">
                            <Checkbox
                                checked={item.defaultValue}
                                style={{ marginLeft: "15px" }}
                            />
                            <span style={{ marginLeft: "5px" }}>{requirement}</span>
                        </Col>
                    )
                })
                return (
                    <Col xs={12} sm={12} md={12} lg={12} xl={12} key={indexContain} className="requirementContain">
                        <Row>
                            <Col xs={12} sm={12} md={12} lg={12} xl={4}>
                                <b>{(indexContain < 9 ? ('0' + (indexContain + 1)) : (indexContain + 1)) + '. ' + item.name}</b>
                            </Col>
                            <Col xs={12} sm={12} md={12} lg={12} xl={2}>
                                <span style={{ color: '#0FC100', fontWeight: 'bold' }}>
                                    {trans('checklist:previewChecklist.statusLable')}
                                </span>
                            </Col>
                            <Col xs={12} sm={12} md={12} lg={12} xl={1}>
                                <b>{trans('checklist:previewChecklist.note')}: </b>
                            </Col>
                            <Col xs={12} sm={12} md={12} lg={12} xl={4}>
                                <Input
                                    style={{ marginTop: '-10px' }}
                                />
                            </Col>
                        </Row>
                        <Row style={{ marginTop: 15 }}>
                            {/* <Form layout="inline"> */}
                            {renderCheckbox}
                            {/* </Form> */}
                        </Row>
                    </Col>
                )
            })
                : null;
        return (
            <>
                <Form layout="vertical">
                    <Row>
                        <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "10px" }}>
                            {renderChecklistsContent}
                        </Col>
                    </Row>
                    <Row style={{ display: 'flex', justifyContent: 'flex-end' }}
                        noGutters
                        className="modal-footer-custom"
                    >
                        <Col
                            xs={6}
                            sm={3}
                            md={2}
                            lg={2}
                            xl={1}
                            style={{ display: 'flex', justifyContent: 'flex-end', marginLeft: '10px' }}
                        >
                            <div className="button" onClick={this.onCancel}>
                                {trans('common:button.cancel')}
                            </div>
                        </Col>
                    </Row>
                </Form >
            </>
        );
    }

};

export default withTranslation(['checklist', 'common'])(PreviewChecklistPopup);
