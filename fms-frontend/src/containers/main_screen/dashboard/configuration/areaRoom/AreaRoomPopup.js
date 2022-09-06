import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../../layout/Common.css';
import {
    Input, Form, Select, InputNumber
} from 'antd';
import 'antd/dist/antd.min.css';
import { ACTION, MESSAGE, STATUS } from '../../../../../constants/Constants';
import { AreaRoomService } from '../../../../../services/main_screen/configuration/AreaRoomService';
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
import moment from 'moment';
import { withTranslation } from 'react-i18next';

class AreaRoomPopup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            errors: {},
            noticeLocation: trans("configuration:areaRoom.selectCampusFirst"),
            cValue: JSON.parse(localStorage.getItem('cont')),
        };
        this.Notification = new Notification();
        this.service = new AreaRoomService();
    }

    componentDidMount() {
        let options = this.props.options;
        // console.log(options);
        let locationID = null;
        if (options.action === ACTION.UPDATE) {
            locationID = options.data.locationID;
            // if (options.data.name.indexOf('-') !== -1) {
            let roomCodeInitial = options.roomCodeInitial;
            // options.data.name = roomCodeInitial.slice(options.data.name.indexOf('-') + 1);
            console.log(options.data.name);
            // this.setState({
            // })
            // }

            this.setState({
                data: options.data,
                noticeLocation: '',
                roomCodeInitial

            });
            this.loadLocationSelect(options.data.campusName || '', locationID);
        } else {
            this.setState({
                codeLocation: null,
                roomCodeInitial: null,
            })
        }

        // options.campus.shift();
        // options.location.shift();
        this.setState({
            location: null,
            campus: options.campus,
            errors: {},
            action: options.action,
        });
        console.log(options.campus)
    }

    componentDidUpdate(prevProps) {
        let options = this.props.options;

        if (options?.data !== prevProps.options?.data) {
            // options.campus.shift();
            // options.location.shift();
            let locationID = null;
            if (options.action === ACTION.UPDATE) {
                locationID = options.data.locationID;
                // if (options.data.name.indexOf('-') !== -1) {
                let roomCodeInitial = options.roomCodeInitial;
                // options.data.name = roomCodeInitial.slice(options.data.name.indexOf('-') + 1);
                // this.setState({

                // })
                // }

                this.setState({
                    data: options.data,
                    action: options.action,
                    location: null,
                    campus: options.campus,
                    errors: {},
                    noticeLocation: '',
                    roomCodeInitial
                });
                this.loadLocationSelect(options.data.campusName, locationID);
            } else if (options.action === ACTION.CREATE) {
                this.setState({
                    data: {},
                    errors: {},
                    location: null,
                    campus: options.campus,
                    action: options.action,
                    noticeLocation: trans("configuration:areaRoom.selectCampusFirst"),
                    codeLocation: null,
                    roomCodeInitial: null,
                });
            }
        }
    }

    onCancel = () => {
        this.props.options.onCancel(this.state.data);
    }

    validate() {
        // var isValid = true;
        var data = { ...this.state.data };
        let errors = { ...this.state.errors };
        let [isValid, listErrors] = validateEmpty(data, ["campusName", "locationID", "name", "fullName", "floor"]);
        if (!isValid) {
            focusInvalidInput(listErrors);
        }
        
        if(errors.name || errors.floor) {
            isValid = false;
        }
        this.setState({
            errors: {
                ...errors,
                ...listErrors
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
        let codeLocation = this.state.codeLocation;

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
        data.name = codeLocation + data.name.trim();
        // return;

        this.props.options.onComplete(data);
    }

    loadLocationSelect = async (campus, locationID) => {
        let resListLocation = await this.service.getListLocation({
            "paging": {
                "currentPage": 1,
                "pageSize": 99999999,
                "rowsCount": 0
            },
            "campus": campus,
            "locationCode": null
        });

        if (resListLocation.data.status === STATUS.SUCCESS) {
            let location = resListLocation.data.listData;
            console.log(location);
            let codeLocation = null;
            if (locationID) {
                codeLocation = location.filter(item => item.id === locationID)[0].code;
                codeLocation += '-';
            }

            this.setState({
                location,
                codeLocation
            });
        } else {
            this.Notification.error(MESSAGE.ERROR);
        }
    }

    onChangeValueCustom = async (name, value) => {
        // debugger;
        console.log(value);
        let noticeLocation = '';
        if (!value) {
            noticeLocation = trans("configuration:areaRoom.selectCampusFirst");
        }

        let data = this.state.data;
        let errors = { ...this.state.errors };
        this.setState({
            data: {
                ...data,
                [name]: value,
                locationID: null
            },
            errors: {
                ...errors,
                campusName: '',
                locationID: '',
                name: ''
            },
            noticeLocation: noticeLocation
        });
        this.loadLocationSelect(value || '');

    }

    handleCheckRoomCode = async (value) => {
        console.log(value);
        let data = { ...this.state.data };
        let errors = { ...this.state.errors };

        let codeLocation = this.state.codeLocation;
        let roomCode = codeLocation + value?.trim();
        let locationCodeSplit = codeLocation?.split('-')[0];
        console.log(this.state.roomCodeInitial?.slice(0, -1), value);
        // if() {
        //     roomCode = roomCode.slice(0, -1);
        //     console.log(roomCode, 'check slice');
        // }
        if (value && this.state.roomCodeInitial?.toLowerCase() !== roomCode?.toLowerCase()) {
            if (this.state.roomCodeInitial?.slice(0, -1)?.toLowerCase() !== roomCode?.toLowerCase()) {
                let resAreaRoom = await this.service.getListAreaRoomNoCondition({
                    paging: {
                        pageSize: 9999999,
                        currentPage: 1,
                        rowsCount: 0
                    },
                    campus: data.campusName.trim(),
                    locationCode: locationCodeSplit,
                    roomCode
                });

                if (resAreaRoom && resAreaRoom.data.listData.length > 0) {
                    errors.name = trans('configuration:areaRoom.errorCheckRoomCode');
                } else {
                    errors.name = '';
                }

                this.setState({
                    errors
                });
            }
        }
    }

    onChangeValueLocation = async (name, value) => {
        let data = { ...this.state.data };
        let errors = { ...this.state.errors };
        let locationSelect = [...this.state.location];

        data[name] = value;
        errors[name] = '';

        console.log(value);

        let codeLocation = null;
        let maxFloor = null;
        if (value) {
            let locationSelected = locationSelect.filter(item => item.id === value);
            codeLocation = locationSelected[0].code;
            codeLocation += '-';
            maxFloor = locationSelected[0].numOfFloor;
            if(this.state.data.floor && this.state.data.floor > maxFloor) {
                errors.floor = trans('configuration:areaRoom.errorFloor')
            }
            console.log(maxFloor, 'check maxFloor')
        }

        await this.setState({
            data,
            errors,
            codeLocation,
            maxFloor
        });

        this.handleCheckRoomCode(this.state.data.name || null)
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
                                label={trans("configuration:areaRoom.campus")}
                                required={true}
                                help={this.state.errors.campusName}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.campusName)}
                            >
                                <SelectCustom
                                    id="campusName"
                                    placeholder={trans("common:all")}
                                    onChange={(e, value) => this.onChangeValueCustom('campusName', e)}
                                    value={this.state.data.campusName}
                                    options={this.state.campus}
                                    keyValue={'name'}
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
                                label={trans("configuration:areaRoom.locationName")}
                                required={true}
                                help={this.state.errors.locationID || this.state.noticeLocation}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.locationID)}
                            >
                                <SelectCustom
                                    id="locationID"
                                    placeholder={trans("common:all")}
                                    onChange={(e) => this.onChangeValueLocation('locationID', e)}
                                    value={this.state.data.locationID}
                                    options={this.state.location}
                                    keyValue="id"
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
                                label={trans("configuration:areaRoom.areaRoomCode")}
                                required
                                help={this.state.errors.name}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.name)}
                            >
                                {/* <Input
                                    id="name"
                                    placeholder=''
                                    value={this.state.data?.name}
                                    onChange={e => onChangeValue(this, 'name', e.target.value)}
                                >
                                </Input> */}
                                <Input.Group compact>
                                    <Input
                                        style={{
                                            width: '15%',
                                        }}
                                        readOnly
                                        onChange={(e, value) => this.onChangeRoomCodeBefore('codeLocation', e)}
                                        value={this.state.codeLocation}
                                    />
                                    <Input
                                        style={{
                                            width: '85%',
                                        }}
                                        id="name"
                                        maxLength={10}
                                        showCount
                                        placeholder='201'
                                        value={this.state.data?.name}
                                        onChange={e => onChangeValue(this, 'name', e.target.value)}
                                        onBlur={e => this.handleCheckRoomCode(e.target.value)}
                                    />
                                </Input.Group>
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
                                label={trans("configuration:areaRoom.areaFullName")}
                                required={true}
                                help={this.state.errors?.fullName}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.fullName)}
                            >
                                <Input
                                    id="fullName"
                                    placeholder=''
                                    maxLength={70}
                                    showCount
                                    value={this.state.data?.fullName}
                                    onChange={e => onChangeValue(this, 'fullName', e.target.value)}
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
                                label={trans("configuration:areaRoom.floorNum")}
                                required={true}
                                help={this.state.errors.floor}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.floor)}
                            >
                                <InputNumber
                                    style={{
                                        width: '100%',
                                    }}
                                    id="floor"
                                    placeholder=''
                                    min={0}
                                    max={this.state.maxFloor || 9}
                                    value={this.state.data?.floor}
                                    onChange={e => onChangeValue(this, 'floor', e)}
                                >
                                </InputNumber>
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

export default withTranslation(['configuration', 'common'])(AreaRoomPopup);
