import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../../layout/Common.css';
import {
    Input, Form
} from 'antd';
import 'antd/dist/antd.min.css';
import { ACTION } from '../../../../../constants/Constants';
import { UserService } from '../../../../../services/main_screen/configuration/UserService';
import '../../../../../layout/Configuration.css';
import {
    onChangeValue,
    isUndefindOrEmptyForItemForm,
    focusInvalidInput,
    validateEmpty,
    trans
} from '../../../../../components/CommonFunction';
import { Notification } from "../../../../../components/Notification";
import SelectCustom from '../../../../../components/SelectCustom';
import '../../../../../layout/customModal.css';
import moment from 'moment';
import { withTranslation } from 'react-i18next';

class UserPopup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            errors: {},
            cValue: JSON.parse(localStorage.getItem('cont')),
        };
        this.Notification = new Notification();
        this.service = new UserService();
    }

    componentDidMount() {
        let options = this.props.options;

        if (options.action === ACTION.UPDATE) {
            this.setState({
                data: options.data,
                emailInitial: options.data.email,
                role: options.role,
                campus: options.campus,
                errors: {},
                action: options.action,
            });
        } else if (options.action === ACTION.CREATE) {
            this.setState({
                data: options.data,
                emailInitial: '',
                role: options.role,
                campus: options.campus,
                errors: {},
                action: options.action,
            });
        }
        // options.campus.shift();
        // options.location.shift();
    }

    componentDidUpdate(prevProps) {
        let options = this.props.options;

        if (options?.data !== prevProps.options?.data) {
            // options.campus.shift();
            // options.location.shift();
            let data = null;
            let emailInitial = '';
            if (options.action === ACTION.UPDATE) {
                data = options.data;
                emailInitial = options.data.email
            } else if (options.action === ACTION.CREATE) {
                data = {};
            }
            this.setState({
                data,
                emailInitial,
                errors: {},
                role: options.role,
                campus: options.campus,
                action: options.action
            })
        }
    }

    onCancel = () => {
        this.props.options.onCancel(this.state.data);
    }

    validate() {
        // var isValid = true;
        var data = { ...this.state.data };
        let errors = { ...this.state.errors };
        let [isValid, errorsList] = validateEmpty(data, ["campusID", "email", "roleID"]);
        if (!isValid) {
            focusInvalidInput(errorsList);
        }

        if (errors.email) {
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

        for (let item in data) {
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
        // return;

        this.props.options.onComplete(data);
    }

    handleCheckEmail = async (value) => {
        console.log(value);

        let errors = { ...this.state.errors };
        if (value.trim().endsWith("@fpt.edu.vn") || value.trim().endsWith("@fe.edu.vn")) {
            errors.email = '';
            this.setState({
                errors
            });
        } else {
            this.setState({
                errors: {
                    ...errors,
                    email: trans("configuration:user.emailErr")
                }
            });
            return;
        }

        if (value && value.trim() !== this.state.emailInitial) {
            let resEmail = await this.service.getUserByEmail(value.trim());
            if (resEmail?.data && resEmail?.data?.data) {
                this.setState({
                    errors: {
                        ...errors,
                        email: trans("configuration:user.emailErr2")
                    }
                });
            } else {
                errors.email = '';
                this.setState({
                    errors
                });
            }
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
                                label={trans("configuration:user.campus")}
                                required={true}
                                help={this.state.errors.campusID}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.campusID)}
                            >
                                <SelectCustom
                                    id="campusID"
                                    placeholder={trans("configuration:user.selectCampus")}
                                    onChange={(e, value) => onChangeValue(this, 'campusID', e)}
                                    value={this.state.data.campusID}
                                    options={this.state.campus}
                                />
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
                                label={trans("configuration:user.email")}
                                required={true}
                                help={this.state.errors.email}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.email)}
                            >
                                <Input
                                    id="email"
                                    placeholder=''
                                    maxLength={50}
                                    showCount
                                    value={this.state.data.email}
                                    onChange={e => onChangeValue(this, 'email', e.target.value)}
                                    onBlur={e => this.handleCheckEmail(e.target.value)}
                                />
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
                                label={trans("configuration:user.role")}
                                required={true}
                                help={this.state.errors.roleID}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.roleID)}
                            >
                                <SelectCustom
                                    id="roleID"
                                    placeholder={trans("configuration:user.selectRole")}
                                    onChange={(e) => onChangeValue(this, 'roleID', e)}
                                    value={this.state.data.roleID}
                                    options={this.state.role}
                                // keyValue="code"
                                />
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
                                label="Username"
                                help={this.state.errors.userName}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.userName)}
                            >
                                <Input
                                    id="userName"
                                    placeholder='Enter Username'
                                    value={this.state.data.userName}
                                    onChange={e => onChangeValue(this, 'userName', e.target.value)}
                                />
                            </Form.Item>
                        </Col> */}
                        <Col
                            xs={12}
                            sm={12}
                            md={12}
                            lg={6}
                            xl={6}
                        >
                            <Form.Item
                                label={trans("configuration:user.fullName")}
                                help={this.state.errors.fullName}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.fullName)}
                            >
                                <Input
                                    id="fullName"
                                    placeholder=''
                                    maxLength={30}
                                    showCount
                                    value={this.state.data.fullName}
                                    onChange={e => onChangeValue(this, 'fullName', e.target.value)}
                                />
                            </Form.Item>
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

export default withTranslation(['configuration', 'common'])(UserPopup);
