import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../layout/Common.css';
import {
    Input, Form, DatePicker
} from 'antd';
import 'antd/dist/antd.min.css';
import { ACTION, MESSAGE, STATUS } from '../../../../constants/Constants';
import { AreaRoomService } from '../../../../services/main_screen/configuration/AreaRoomService';
import '../../../../layout/Configuration.css';
import {
    onChangeValue,
    isUndefindOrEmptyForItemForm,
    focusInvalidInput,
    validateEmpty,
} from '../../../../components/CommonFunction';
import { Notification } from "../../../../components/Notification";
import SelectCustom from '../../../../components/SelectCustom';
import moment from 'moment';

const { TextArea } = Input;

class SchedulePopupCreate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            errors: {}
        };
        this.Notification = new Notification();
        this.service = new AreaRoomService();
    }

    componentDidMount() {
        let options = this.props.options;

        if (options.action === ACTION.UPDATE) {
            console.log(options.data);
            this.setState({
                data: options.data,
            })
        }
        // options.campus.shift();
        // options.location.shift();
        this.setState({
            role: options.role,
            campus: options.campus,
            errors: {}
        })
    }

    componentDidUpdate(prevProps) {
        let options = this.props.options;

        if (options?.data !== prevProps.options?.data) {
            // options.campus.shift();
            // options.location.shift();
            if (options.action === ACTION.UPDATE) {
                this.setState({
                    data: options.data,
                    action: options.action,
                    role: options.role,
                    campus: options.campus,
                    errors: {}
                })
            } else if (options.action === ACTION.CREATE) {
                this.setState({
                    data: {},
                    errors: {},
                    role: options.role,
                    campus: options.campus,
                    action: options.action
                })

            }
        }
    }

    onCancel = () => {
        this.props.options.onCancel(this.state.data);
    }

    validate() {
        // var isValid = true;
        var data = { ...this.state.data };
        const [isValid, errors] = validateEmpty(data, ["campusID", "email", "roleID"]);
        if (!isValid) {
            focusInvalidInput(errors);
        }

        this.setState({
            errors
        });
        return isValid;
    }

    onSubmit = () => {
        if (!this.validate()) {
            return;
        }
        this.props.options.onComplete(this.state.data);
    }

    handleCheckEmail = (value) => {
        console.log(value.endsWith("@fpt.edu.vn"));
        if (!value.endsWith("@fpt.edu.vn") && !value.endsWith("@fe.edu.vn")) {
            this.setState({
                errors: {
                    email: "email must end with @fpt.edu.vn or @fe.edu.vn"
                }
            })
        }
    }

    disabledFromDate = (current) => {
        // Can not select days before today and today
        // console.log('data = ', current);
        if (this.state.data.endDate) {
            return moment(current, 'DD/MM/YYYY') >= moment(this.state.data.endDate, 'DD/MM/YYYY');
        }
        return '';
    };

    disabledToDate = (current) => {
        // Can not select days before today and today
        // console.log('data = ', current);
        if (this.state.data.fromDate) {
            return moment(current, 'DD/MM/YYYY') <= moment(this.state.data.fromDate, 'DD/MM/YYYY');
        }
        return '';
    };

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
                                label="Location"
                                required={true}
                                help={this.state.errors.location}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.location)}
                            >
                                <SelectCustom
                                    id="location"
                                    placeholder='Select location'
                                    onChange={(e, value) => onChangeValue(this, 'location', value.children)}
                                    value={this.state.data.location}
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
                                label="Area"
                                required={true}
                                help={this.state.errors.area}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.area)}
                            >
                                <SelectCustom
                                    id="area"
                                    placeholder='Select area'
                                    onChange={(e, value) => onChangeValue(this, 'area', e)}
                                    value={this.state.data.area}
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
                                label="System"
                                required={true}
                                help={this.state.errors.system}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.system)}
                            >
                                <SelectCustom
                                    id="system"
                                    placeholder='Select system'
                                    onChange={(e, value) => onChangeValue(this, 'system', e)}
                                    value={this.state.data.system}
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
                                label="Category"
                                required={true}
                                help={this.state.errors.category}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.category)}
                            >
                                <SelectCustom
                                    id="category"
                                    placeholder='Select category'
                                    onChange={(e, value) => onChangeValue(this, 'category', e)}
                                    value={this.state.data.category}
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
                                label="Perform By"
                                required={true}
                                help={this.state.errors.performBy}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.performBy)}
                            >
                                <SelectCustom
                                    id="performBy"
                                    placeholder='Select Perform By'
                                    onChange={(e, value) => onChangeValue(this, 'performBy', e)}
                                    value={this.state.data.performBy}
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
                                label="Template"
                                required={true}
                                help={this.state.errors.template}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.template)}
                            >
                                <SelectCustom
                                    id="template"
                                    placeholder='Select template'
                                    onChange={(e, value) => onChangeValue(this, 'template', e)}
                                    value={this.state.data.template}
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
                                label="From Date"
                                help={this.state.errors.fromDate}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.fromDate)}
                            >
                                <DatePicker disabledDate={this.disabledFromDate} onChange={(e, timeString) => onChangeValue(this, 'fromDate', timeString)} format='DD/MM/YYYY' />
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
                                label="End Date"
                                help={this.state.errors.endDate}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.endDate)}
                            >
                                <DatePicker disabledDate={this.disabledToDate} onChange={(e, timeString) => onChangeValue(this, 'endDate', timeString)} format='DD/MM/YYYY' />
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
                                label="Technicians"
                                style={{ display: 'flex', }}
                                help={this.state.errors.technicians}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.technicians)}
                            >
                                <SelectCustom
                                    id="technicians"
                                    onChange={(e, value) => onChangeValue(this, 'technicians', value)}
                                    // defaultValue="Student1212"
                                    placeholder='Select Campus'
                                    mode="multiple"
                                    value={this.state.data.technicians}
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
                                label="Note"
                                style={{ display: 'flex', }}
                                help={this.state.errors.note}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.note)}
                            >
                                <TextArea
                                    rows={1}
                                    maxLength={200}
                                    id="note"
                                    placeholder='Enter note'
                                    value={this.state.data?.note}
                                    onChange={e => onChangeValue(this, 'note', e.target.value)}
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
                                Submit
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
                                Cancel
                            </div>
                        </Col>
                    </Row>
                </Form>
            </>
        );
    }

};

export default SchedulePopupCreate;
