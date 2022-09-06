import React, { Component } from "react";
import { Col, Row } from "reactstrap";
import { Button, Form, Modal, Input, Select } from 'antd';
import { LocationService } from "../../../../../services/main_screen/configuration/LocationService";
import { CampusService } from "../../../../../services/main_screen/configuration/CampusService";
import { Notification } from "../../../../../components/Notification";
import {
    onChangeSelectBox,
    onChangeValue,
    isUndefindOrEmptyForItemForm,
    focusInvalidInput,
    validateEmpty,
    trans
} from '../../../../../components/CommonFunction';
import SelectCustom from '../../../../../components/SelectCustom';
import { withTranslation } from 'react-i18next';
import { InputNumber } from "antd";
import { ACTION, MESSAGE, STATUS } from '../../../../../constants/Constants';

class LocationPopup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            submitted: false,
            campusSelects: [],
            errors: {}
        }
        this.service = new LocationService();
        this.Notification = new Notification();
        this.CampusService = new CampusService();
    }



    componentDidMount() {
        this.loadSelect();
    }

    loadSelect = async () => {
        let campusSelects = [...this.state.campusSelects];

        await this.CampusService.getAll().then(res => {
            if (res && res.status === 200) {
                if (res.data) {
                    for (let item of res.data.listData) {
                        campusSelects.push(item);
                    }
                    this.setState({ campusSelects: campusSelects });
                }
            }
            else {
                this.Notification.error("Cannot connect to api!");
            }
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.show && this.props.show !== prevProps.show && this.props.row) {
            let data = { ...this.state.data };
            data.name = this.props.row.name;
            data.id = this.props.row.id;
            data.campusId = this.props.row.campusID;
            data.fullName = this.props.row.fullName;
            data.code = this.props.row.code;
            data.numOfFloor = this.props.row.numOfFloor;

            let locationCodeInitial = null;
            if (data.code) {
                locationCodeInitial = data.code;
            }
            this.setState({
                data: data,
                locationCodeInitial,
                errors: {}
            });
        }

        if (this.props.show && this.props.show !== prevProps.show && !this.props.isEdit) {
            this.setState({
                data: {},
                submitted: false
            });
        }
    }

    handleOK = () => {
        this.setState({ submitted: true });
        if (!this.validate()) {
            return;
        }
        let data = { ...this.state.data };
        var submitData = {
            id: data.id,
            campusId: data.campusId,
            name: data.name.trim(),
            fullName: data.fullName.trim(),
            code: data.code.trim(),
            floor: data.numOfFloor
        }
        if (this.props.onCloseDialog) {
            this.service.save(submitData).then(res => {
                if (res && res.status === 200) {
                    this.Notification.success(MESSAGE.SAVED_SUCCESS);
                    this.props.onCloseDialog(true);
                }
                else {
                    this.Notification.error(MESSAGE.ERROR);
                }
            });
        }


    }

    handleCancel = () => {
        if (this.props.onCloseDialog) {
            this.props.onCloseDialog(false);
        }
    }

    onChangeValue = (name, value) => {
        let data = { ...this.state.data };
        let errors = { ...this.state.errors };

        data[name] = value;
        errors[name] = '';

        this.setState({
            data,
            errors
        });
    }

    validate() {
        // var isValid = true;
        var data = { ...this.state.data };
        let errors = { ...this.state.errors };
        let [isValid, errorsList] = validateEmpty(data, ["campusId", "code", "name", "fullName"]);
        if (!isValid) {
            focusInvalidInput(errors);
        }
        if (errors.code) {
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

    handleCheckLocation = async (value) => {
        let data = { ...this.state.data };

        if (data.campusId && value && this.state.locationCodeInitial !== value) {
            let campusObj = this.state.campusSelects.filter(item => item.id === data.campusId);
            let resLocation = await this.service.getListNoCondition({
                paging: {
                    pageSize: 9999999,
                    currentPage: 1,
                    rowsCount: 0
                },
                campus: campusObj[0].name.trim(),
                locationCode: value.trim()
            });
            let errors = { ...this.state.errors };
            if (resLocation && resLocation.data.listData.length > 0) {
                errors.code = trans('configuration:location.locationErr')
                this.setState({
                    errors
                });
            } else {
                errors.code = '';
                this.setState({
                    errors
                });
            }
        }
    }

    onChangeCampus = async (name, value) => {
        let data = { ...this.state.data };
        let errors = { ...this.state.errors };

        data[name] = value;
        errors[name] = '';

        await this.setState({
            data,
            errors
        });

        this.handleCheckLocation(this.state.data.code || null);
    }

    render() {

        return (
            <>
                <Modal
                    visible={this.props.show}
                    title={this.props.isEdit ? trans("configuration:location.updateLocation") : trans("configuration:location.createLocation")}
                    footer={[
                        <Row style={{ display: 'flex', justifyContent: 'flex-end' }}
                            noGutters
                        // className="modal-footer-custom"
                        >
                            <Col
                                xs={6}
                                sm={3}
                                md={2}
                                lg={2}
                                xl={1}
                                style={{ display: 'flex', justifyContent: 'flex-end' }}
                            >
                                <div className="button button-submit" onClick={this.handleOK}>
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
                                <div className="button" onClick={this.handleCancel}>
                                    {trans("common:button.cancel")}
                                </div>
                            </Col>
                        </Row>
                    ]}
                    onCancel={this.handleCancel}
                    onOk={this.handleOK}
                    width={"70%"}
                >
                    <Form layout="vertical">
                        <Row>
                            <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                                <Form.Item
                                    label={trans("configuration:location.campus")}
                                    required={true}
                                    help={this.state.errors.campusId}
                                    validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.campusId)}
                                >
                                    <SelectCustom
                                        id="campusId"
                                        placeholder={trans("configuration:location.chooseCampus")}
                                        onChange={(e) => this.onChangeCampus('campusId', e)}
                                        value={this.state.data.campusId}
                                        options={this.state.campusSelects}
                                        keyValue="id"
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                                <Form.Item
                                    label={trans("configuration:location.locationCode")}
                                    required={true}
                                    help={this.state.errors.code}
                                    validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.code)}
                                >
                                    <Input
                                        id="code"
                                        value={this.state.data.code}
                                        placeholder=""
                                        maxLength={10}
                                        showCount
                                        onChange={e => onChangeValue(this, 'code', e.target.value)}
                                        onBlur={e => this.handleCheckLocation(e.target.value)}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                                <Form.Item
                                    label={trans("configuration:location.locationName")}
                                    required={true}
                                    help={this.state.errors.name}
                                    validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.name)}
                                >
                                    <Input
                                        id="name"
                                        value={this.state.data.name}
                                        placeholder=""
                                        maxLength={20}
                                        showCount
                                        onChange={e => onChangeValue(this, 'name', e.target.value)}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                                <Form.Item
                                    label={trans("configuration:location.locationFullName")}
                                    required={true}
                                    help={this.state.errors.fullName}
                                    validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.fullName)}
                                >
                                    <Input
                                        id="fullName"
                                        value={this.state.data.fullName}
                                        placeholder=""
                                        maxLength={50}
                                        showCount
                                        onChange={e => this.onChangeValue('fullName', e.target.value)}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                                <Form.Item
                                    label={trans("configuration:location.numOfFloor")}
                                    help={this.state.errors.numOfFloor}
                                    validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.numOfFloor)}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        id="numOfFloor"
                                        value={this.state.data.numOfFloor}
                                        placeholder=""
                                        min={0}
                                        max={9}
                                        onChange={e => onChangeValue(this, 'numOfFloor', e)}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Modal>
            </>
        );
    }
};

export default withTranslation(['configuration', 'common'])(LocationPopup);