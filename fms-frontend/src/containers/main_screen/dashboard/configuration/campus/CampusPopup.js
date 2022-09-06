import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../../layout/Common.css';
import {
    Modal, Checkbox, Input, Steps, Table, Form
} from 'antd';
import 'antd/dist/antd.min.css';
import HeaderPannel from '../../../../../components/HeaderPannel';
import { ACTION } from '../../../../../constants/Constants';
import { Link } from 'react-router-dom';
import { CampusService } from '../../../../../services/main_screen/configuration/CampusService';
import '../../../../../layout/Configuration.css';
import SelectCustom from '../../../../../components/SelectCustom';
import {
    onChangeSelectBox,
    onChangeValue,
    isUndefindOrEmptyForItemForm,
    focusInvalidInput,
    validateEmpty,
    trans
} from '../../../../../components/CommonFunction';
import { Notification } from "../../../../../components/Notification";
import '../../../../../layout/customModal.css';
import moment from 'moment';
import { withTranslation } from 'react-i18next';

const { TextArea } = Input;
const { Step } = Steps;

class InforCampus extends Component {
    constructor(props) {
        super(props);
        this.state = {
            options: { ...this.props.options },
            data: {},
            errors: {},
            cValue: JSON.parse(localStorage.getItem('cont')),
        };
        this.Notification = new Notification();
        this.service = new CampusService();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.options !== this.props.options) {
            let options = nextProps.options;
            let action = options?.action;

            let campusNameInitial = null;
            let data = {};
            if (action === ACTION.UPDATE) {
                campusNameInitial = options.data.name;
                data = options.data;
            }
            this.setState({
                data,
                errors: {},
                action: options.action,
                campusNameInitial
            });
        }
    }

    componentDidMount() {
        let action = this.props.options?.action;
        console.log(action, 'check actionnnn')

        let campusNameInitial = null;
        let data = {};
        if (action === ACTION.UPDATE) {
            data = this.props.options?.data;
            // console.log(data);
            campusNameInitial = data.name;
        }

        this.setState({
            data,
            action,
            campusNameInitial,
            errors: {},
        })
    }

    onCancel = () => {
        this.props.options.onCancel(this.state.data);
    }

    validate() {
        // var isValid = true;
        var data = { ...this.state.data };
        let errors = { ...this.state.errors };
        let [isValid, errorsList] = validateEmpty(data, ["name", "telephone", "address"]);
        if (!isValid) {
            focusInvalidInput(errors);
        }

        if (errors.name || errors.telephone) {
            isValid = false;
        }

        this.setState({
            errors: {
                ...errors,
                ...errorsList
            }
        });
        return isValid;
    }

    onSubmit = () => {
        if (!this.validate()) {
            return;
        }

        let userInfo = this.context.userInfo ? this.context.userInfo : this.state.cValue.userInfo;
        let data = { ...this.state.data };

        console.log(data)

        for (let item in data) {
            console.log(data[item])
            if (typeof data[item] === "string") {
                data[item] = data[item].trim();
            }
        }
        if (this.state.action === ACTION.CREATE) {
            data.created = moment().format('YYYY-MM-DD');
            data.createdBy = userInfo.username;
        } else if (this.state.action === ACTION.UPDATE) {
            data.updated = moment().format('YYYY-MM-DD');
            data.updatedBy = userInfo.username;
        }
        console.log(data, ' check data');

        this.props.options.onComplete(data);
    }

    handleCheckCampus = async (value) => {
        let errors = { ...this.state.errors };

        if (value && this.state.campusNameInitial !== value) {
            let resCampus = await this.service.getListNoCondition({
                paging: {
                    pageSize: 9999999,
                    currentPage: 1,
                    rowsCount: 0
                },
                campusName: value.trim(),
            });
            if (resCampus?.data && resCampus.data.listData.length !== 0) {
                this.setState({
                    errors: {
                        ...errors,
                        name: trans("configuration:campus.campusNameErr")
                    }
                });
            }
        }
    }

    handleCheckTelephone = (value) => {
        let errors = { ...this.state.errors };
        let regex = /(((\+|)84)|0)(2|3|5|7|8|9)+([0-9]{8,9})\b/;

        if (!regex.test(value)) {
            this.setState({
                errors: {
                    ...errors,
                    telephone: trans("configuration:campus.telephoneErr")
                }
            })
        }
    }

    render() {
        // console.log('render')
        return (
            <>
                <Form layout="vertical">
                    <Row>
                        <Col
                            xs={12}
                            sm={12}
                            md={12}
                            lg={6}
                            xl={6}
                        >
                            <Form.Item
                                label={trans("configuration:campus.campusName")}
                                required={true}
                                help={this.state.errors.name}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.name)}
                            >
                                <Input
                                    id="name"
                                    placeholder=''
                                    maxLength={20}
                                    showCount
                                    value={this.state.data?.name}
                                    onChange={e => onChangeValue(this, 'name', e.target.value)}
                                    onBlur={e => this.handleCheckCampus(e.target.value)}
                                >
                                </Input>
                            </Form.Item>
                        </Col>
                        <Col
                            xs={12}
                            sm={12}
                            md={12}
                            lg={6}
                            xl={6}
                        >
                            <Form.Item
                                label={trans("configuration:campus.telephone")}
                                required={true}
                                help={this.state.errors?.telephone}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.telephone)}
                            >
                                <Input
                                    id="telephone"
                                    placeholder=''
                                    value={this.state.data?.telephone}
                                    onChange={e => onChangeValue(this, 'telephone', e.target.value)}
                                    onBlur={e => this.handleCheckTelephone(e.target.value)}
                                >
                                </Input>
                            </Form.Item>
                        </Col>
                        <Col
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                            xl={12}
                        >
                            <Form.Item
                                label={trans("configuration:campus.address")}
                                required={true}
                                help={this.state.errors.address}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.address)}
                            >
                                <Input
                                    id="address"
                                    placeholder=''
                                    maxLength={120}
                                    showCount
                                    value={this.state.data?.address}
                                    onChange={e => onChangeValue(this, 'address', e.target.value)}
                                >
                                </Input>
                            </Form.Item>
                        </Col>
                        {/* <Col
                            xs={12}
                            sm={12}
                            md={12}
                            lg={6}
                            xl={6}
                        >
                            <Form.Item
                                help={this.state.errors.inService}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.inService)}
                            >
                                In service
                                <Checkbox
                                    checked={this.state.data?.inService}
                                    onChange={e => onChangeValue(this, 'inService', e.target.checked)}
                                    style={{ marginLeft: "15px" }}
                                />
                            </Form.Item>
                        </Col> */}
                        {/* <Col
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                            xl={12}
                        >
                            <Row style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Col
                                    xs={12}
                                    sm={12}
                                    md={2}
                                    lg={2}
                                    xl={1}
                                >
                                    <div style={{ padding: "5px", backgroundColor: '#FFB21E', width: "90px", color: 'white', textAlign: 'center', border: '1px solid #FFB21E', height: "32px", cursor: 'pointer' }}
                                        onClick={this.onSubmit}>
                                        Submit
                                    </div>
                                </Col>
                                <Col
                                    xs={12}
                                    sm={12}
                                    md={2}
                                    lg={2}
                                    xl={{ size: 2 }}
                                >
                                    <div style={{ padding: "5px", backgroundColor: '#fff', width: "90px", color: 'rgba(0, 0, 0, 0.85)', textAlign: 'center', border: '1px solid #d9d9d9', height: '32px', cursor: 'pointer' }}
                                        onClick={this.onCancel}>
                                        Cancel
                                    </div>
                                </Col>
                            </Row>
                        </Col> */}
                        <Col
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                            xl={12}
                        >

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
                            style={{ display: 'flex', justifyContent: 'flex-end' }}
                        >
                            <div className="button button-submit" onClick={this.onSubmit}>
                                {trans("common:button.submit")}
                            </div>
                        </Col>
                        <Col
                            xs={6}
                            sm={3}
                            md={2}
                            lg={2}
                            xl={1}
                            style={{ display: 'flex', justifyContent: 'flex-end', marginLeft: '10px' }}
                        >
                            <div className="button" onClick={this.onCancel}>
                                {trans("common:button.cancel")}
                            </div>
                        </Col>
                    </Row>
                </Form>
            </>
        );
    }

};

export default withTranslation(['configuration', 'common'])(InforCampus);
