import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../layout/Home.css';
import '../../../../layout/MyTrouble.css';
import '../../../../layout/Common.css';
import {
    Input, InputNumber, Form, Image, Checkbox
} from 'antd';
import 'antd/dist/antd.min.css';
import HeaderPannel from '../../../../components/HeaderPannel';
import SelectCustom from '../../../../components/SelectCustom';
import {
    onChangeValue,
    isUndefindOrEmptyForItemForm,
    stringNullOrEmpty,
    focusInvalidInput,
    validateEmpty,
    handleHideNav,
    trans
} from '../../../../components/CommonFunction';
import '../../../../layout/CustomizeMap.css';
import doneIcon from '../../../../assets/done-icon.png';
import cancelIcon from '../../../../assets/icons-close.png';
import { MESSAGE, STATUS } from '../../../../constants/Constants';
import { MapService } from '../../../../services/main_screen/map/MapService';
import { Notification } from '../../../../components/Notification';
import { withTranslation } from 'react-i18next';

class CustomizeMap extends Component {
    constructor(props) {
        super(props);
        this.state = {
            squares: [],
            row: 14,
            column: 21,
            data: {},
            filter: {},
            deleteList: [],
            doorDirect: [
                {
                    id: 1,
                    name: 'bottom'
                },
                {
                    id: 2,
                    name: 'top'
                },
                {
                    id: 3,
                    name: 'left'
                },
                {
                    id: 4,
                    name: 'right'
                },
            ],
            errors: {},
            isClone: false,
            isUpdate: false,
            isSearch: false
        };
        this.Notification = new Notification();
        this.service = new MapService();
    }

    componentDidMount() {
        this.loadSelectCampus();
        this.loadSelectType();
        // document.getElementById('renderBoard').innerHTML = this.renderBoard(14, 21);
        document.querySelector('.container').addEventListener('click', handleHideNav);
    }

    loadSelectType = async () => {
        let resType = await this.service.getAllTypeRoom();
        if (resType && resType.data.listData) {
            this.setState({
                typeArea: resType.data.listData
            });
        }
    }

    validate(type) {
        // var isValid = true;
        var data = { ...this.state.data };
        let errors = { ...this.state.errors };
        let listFields = [];
        if (type === 'room') {
            let fieldSize = '';
            let fieldPosition = '';
            let fieldDoor = '';

            if (stringNullOrEmpty(data.sizeX) || stringNullOrEmpty(data.sizeY)) {
                fieldSize = 'size';
            }
            if (stringNullOrEmpty(data.x) || stringNullOrEmpty(data.y)) {
                fieldPosition = 'position';
            }
            if (stringNullOrEmpty(data.doorX) || stringNullOrEmpty(data.doorY) || stringNullOrEmpty(data.directDoor) || data.doorY === 0 || data.doorX === 0) {
                fieldDoor = 'door';
            }

            listFields = [fieldSize, fieldPosition, "type", data.isHaveDoor ? fieldDoor : ''];

        } else if (type === 'floor') {
            if (stringNullOrEmpty(data.row) || stringNullOrEmpty(data.column)) {
                listFields = ['floor'];
            }
        }

        var [isValid, errorsEmpty] = validateEmpty(data, listFields);
        if (!isValid) {
            focusInvalidInput(errorsEmpty);
        }

        this.setState({
            errors: {
                ...errors,
                ...errorsEmpty
            }
        });
        return isValid;
    }

    handleSubmitRoom = () => {
        if (!this.validate('room')) {
            return;
        }

        let data = { ...this.state.data };
        let squares = [...this.state.squares];
        let isUpdate = this.state.isUpdate;
        let indexRoomUpdate = this.state.indexRoomUpdate;
        let isClone = this.state.isClone;
        let row = data.row;
        let column = data.column;
        delete data.column;
        delete data.row;

        let areaTypeID = this.state.typeArea.filter(item => item.name.toLowerCase() === data.type.toLowerCase())[0].id;
        data.areaTypeID = areaTypeID;
        console.log(areaTypeID);

        let areaID = data.name ? this.state.areaRoomAll.filter(item => item.name.toLowerCase() === data.name.toLowerCase())[0].id : 0;

        console.log(areaID, 'check areaID')
        if (isUpdate && indexRoomUpdate !== undefined && isClone === false) {
            console.log(squares[indexRoomUpdate].doorX === data.doorX, squares[indexRoomUpdate].doorY === data.doorY)
            squares[indexRoomUpdate].areaID = areaID;
            squares[indexRoomUpdate].type = data.type.toLowerCase();
            squares[indexRoomUpdate].name = data.name || '';
            squares[indexRoomUpdate].doorX = data.doorX ? (data.doorX + (squares[indexRoomUpdate].doorX === data.doorX ? (data.x - squares[indexRoomUpdate].x) : 0)) : 0;
            squares[indexRoomUpdate].doorY = data.doorY ? (data.doorY + (squares[indexRoomUpdate].doorY === data.doorY ? (data.y - squares[indexRoomUpdate].y) : 0)) : 0;
            squares[indexRoomUpdate].x = data.x;
            squares[indexRoomUpdate].y = data.y;
            squares[indexRoomUpdate].sizeX = data.sizeX;
            squares[indexRoomUpdate].sizeY = data.sizeY;
            squares[indexRoomUpdate].isHaveDoor = data.isHaveDoor;
            squares[indexRoomUpdate].directDoor = data.directDoor;


        } else if (isUpdate === false || isClone === true) {
            isUpdate = false;
            squares.forEach((item, index) => {
                if (item.x == data.x && item.y == data.y) {
                    isUpdate = true;
                    squares[index] = data;
                    squares[index].areaID = areaID;
                    squares[index].name = data.name || '';
                    squares[index].type = data.type.toLowerCase();
                    squares[index].doorX = data.doorX ? data.doorX : 0;
                    squares[index].doorY = data.doorY ? data.doorY : 0;
                }
            });
            if (isUpdate === false) {
                console.log(data.x, squares?.[indexRoomUpdate]?.x, data.doorX, 'check doorX');
                console.log(data.y, squares?.[indexRoomUpdate]?.y, data.doorY, 'check doorY');
                data.id = 0;
                data.areaID = areaID;
                data.name = data.name || '';
                data.doorX = data.doorX ? (data.doorX + (isClone && squares?.[indexRoomUpdate]?.x ? (data.x - squares?.[indexRoomUpdate]?.x) : 0)) : 0;
                data.doorY = data.doorY ? (data.doorY + (isClone && squares?.[indexRoomUpdate]?.y ? (data.y - squares?.[indexRoomUpdate]?.y) : 0)) : 0;
                data.type = data.type.toLowerCase();
                squares.push(data);
            }
        }

        let areaRoom = [...this.state.areaRoomAll];
        for (let i = 0; i < areaRoom.length; i++) {
            for (let j = 0; j < squares.length; j++) {
                if (areaRoom[i].id === squares[j].areaID) {
                    areaRoom[i] = undefined;
                    break;
                }
            }
        }
        console.log(areaRoom, 'checkkkkk');
        let areaSelect = areaRoom.filter(item => item !== undefined);

        console.log(squares);
        this.setState({
            squares,
            isUpdate: false,
            data: {
                row,
                column
            },
            isClone: false,
            areaRoom: areaSelect,
            indexRoomUpdate: null
        });
        // document.getElementById('renderBoard').innerHTML = this.renderBoard(14, 21);
    }

    handleSubmitFloor = () => {
        if (!this.validate('floor')) {
            return;
        }
        let data = { ...this.state.data };

        this.setState({
            row: data.row,
            column: data.column
        });
    }

    handleClearFloor = () => {
        let data = { ...this.state.data };
        let errors = { ...this.state.errors };
        data.row = null;
        data.column = null;

        this.setState({
            data,
            errors: {
                ...errors,
                floor: ''
            }
        });
    }

    handleRemoveRoom = () => {
        let squares = [...this.state.squares];
        let data = { ...this.state.data };
        let errors = { ...this.state.errors };
        let isUpdate = this.state.isUpdate;
        let indexRoomUpdate = this.state.indexRoomUpdate;
        let deleteList = [...this.state.deleteList];

        if (isUpdate && indexRoomUpdate !== undefined) {
            deleteList.push(squares[indexRoomUpdate].id)
            squares.splice(indexRoomUpdate, 1);
            this.setState({
                squares,
                isUpdate: false,
            });
        }

        let areaRoom = [...this.state.areaRoomAll];
        for (let i = 0; i < areaRoom.length; i++) {
            for (let j = 0; j < squares.length; j++) {
                if (areaRoom[i].id === squares[j].areaID) {
                    areaRoom[i] = undefined;
                    break;
                }
            }
        }
        console.log(areaRoom, 'checkkkkk');
        let areaSelect = areaRoom.filter(item => item !== undefined);

        this.setState({
            data: {
                row: data.row,
                column: data.column,
            },
            isClone: false,
            errors: {
                floor: errors.floor
            },
            areaRoom: areaSelect,
            deleteList
        })
    }

    onChangeValueCustom = (name1, name2, nameError, value) => {
        let data = { ...this.state.data };
        let errors = { ...this.state.errors };
        console.log(value);
        // return;
        data[name1] = value;
        if (name1 === 'doorX' || name1 === 'doorY') {
            data.isHaveDoor = true;
        }
        if (data[name1] && data[name2]) {
            if ((name1 === 'doorX' || name1 === 'doorY') && data.directDoor) {
                errors[nameError] = '';
            } else if (name1 !== 'doorX' && name1 !== 'doorY') {
                errors[nameError] = '';
            }
        }

        console.log(data[name1], data[name2]);

        this.setState({
            data,
            errors
        })
    }

    onChangeCheckbox = (name, value) => {
        let data = { ...this.state.data };
        let errors = { ...this.state.errors };

        if (value === false) {
            errors.door = '';
        }
        data[name] = value;
        this.setState({
            data,
            errors
        })
    }

    onChangeCheckboxCustom = (value) => {
        console.log(value, 'check box custom');
        let data = { ...this.state.data };
        let name = data.name;
        if (value === true) {
            name = null
        }
        this.setState({
            isClone: value,
            data: {
                ...data,
                name
            }
        });

    }

    onSave = async () => {
        console.log(this.state.squares);
        let userInfo = JSON.parse(localStorage.getItem('cont')).userInfo;
        let filter = { ...this.state.filter };

        let dataSubmit = {
            squares: this.state.squares,
            row: this.state.row,
            column: this.state.column
        };

        console.log(dataSubmit);
        console.log(filter);

        let resSaveMap = await this.service.saveMap({
            currentUser: userInfo.username,
            data: dataSubmit,
            filter,
            deleteList: this.state.deleteList
        });

        if (resSaveMap && resSaveMap.status === STATUS.SUCCESS) {
            this.setState({
                deleteList: []
            })
            this.Notification.success(MESSAGE.CREATE_SUCCESS);
        }

        this.onSearch();
    }

    loadSelectLocation = async (value) => {
        let resLocation = await this.service.getListLocation({
            "paging": {
                "currentPage": 1,
                "pageSize": 99999999,
                "rowsCount": 0
            },
            "campus": value,
            "locationCode": null
        });

        if (resLocation && resLocation.data) {
            let location = resLocation.data.listData;
            this.setState({
                location
            });
        } else {
            this.Notification.error(MESSAGE.ERROR);
        }
    }

    loadSelectCampus = async () => {
        let resCampus = await this.service.getAllCampus();
        if (resCampus && resCampus.data.listData) {
            let campus = resCampus.data.listData;
            this.setState({
                campus
            });
        } else {
            this.Notification.error(MESSAGE.ERROR);
        }
    }

    validateSearch() {
        // var isValid = true;
        var filter = { ...this.state.filter };
        let [isValid, errors] = validateEmpty(filter, ["campusName", "locationCode", "floorSearch"]);
        if (!isValid) {
            focusInvalidInput(errors);
        }
        this.setState({
            errors
        });
        return isValid;
    }

    onSearch = async () => {
        if (!this.validateSearch()) {
            return;
        }

        let filter = { ...this.state.filter };
        filter.floor = filter.floorSearch;
        delete filter.floorSearch;
        console.log(filter);
        let squares = [];
        let resMap = await this.service.getMap(filter);
        if (resMap && resMap.data.data) {
            let data = resMap.data.data;
            squares = data.squares;
            this.setState({
                data: {
                    row: data.row,
                    column: data.column
                },
                squares: data.squares,
                row: data.row,
                column: data.column,
                isSearch: true
            });
        } else {
            this.setState({
                squares: [],
                row: 14,
                column: 21,
                areaRoom: [],
                data: {
                    row: 14,
                    column: 21
                }
            });
            // this.Notification.error(MESSAGE.ERROR);
            // return;
        }

        let resAreaSelect = await this.service.getAreaSelect(filter);
        if (resAreaSelect && resAreaSelect.data.listData) {
            let areaRoom = [...resAreaSelect.data.listData];
            let areaRoomAll = [...resAreaSelect.data.listData];
            for (let i = 0; i < areaRoom.length; i++) {
                for (let j = 0; j < squares.length; j++) {
                    if (areaRoom[i].id === squares[j].areaID) {
                        areaRoom[i] = undefined;
                        break;
                    }
                }
            }
            console.log(areaRoom, 'checkkkkk');
            let areaSelect = areaRoom.filter(item => item !== undefined);
            this.setState({
                areaRoom: areaSelect,
                areaRoomAll
            });
        } else {
            this.Notification.error(MESSAGE.ERROR);
        }
    }

    onChangeCampus = (name, value) => {
        let filter = { ...this.state.filter };
        let errors = { ...this.state.errors };

        filter[name] = value;
        filter.locationCode = null;

        errors[name] = '';
        errors.locationCode = '';

        this.setState({
            filter,
            errors
        });

        this.loadSelectLocation(value || '');
    }

    onChangeValue = (name, value) => {
        // console.log(value)
        let filter = { ...this.state.filter };
        let errors = { ...this.state.errors };
        filter[name] = value;
        errors[name] = '';

        this.setState({
            filter,
            errors
        });
    }

    onChangeValueLocation = (name, value) => {
        // console.log(value)
        let filter = { ...this.state.filter };
        let errors = { ...this.state.errors };
        let location = [...this.state.location];

        filter[name] = value;
        filter.floor = null;
        errors[name] = '';
        errors.floor = '';
        let maxFloor = null;
        
        if (value) {
            maxFloor = location.filter(item => item.code === value)[0].numOfFloor;
        }
        this.setState({
            filter,
            errors,
            maxFloor
        });
    }

    onChangeValueDirectDoor = (name, value) => {
        let data = { ...this.state.data };
        let errors = { ...this.state.errors };

        data[name] = value;
        errors.door = '';

        this.setState({
            data,
            errors
        })
    }

    render() {
        return (
            <>
                <div className="container">
                    <Row>
                        <Col
                            style={{ marginBottom: "10px" }}
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                            xl={12}
                        >
                            <HeaderPannel
                                classNameCustom="checklist-report"
                                title={trans('map:customizeMap.title')}
                                breadcrumbList={[trans('map:map'), trans('map:customizeMap.title')]}
                            />
                        </Col>
                        <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "10px" }}>
                            <div className="daily-checklist-container border-form padding-pannel">
                                <Form layout="vertical">
                                    <Row >
                                        <Col xs={12} sm={12} md={6} lg={4} xl={3}>
                                            <Form.Item
                                                label={trans('map:campus')}
                                                required={true}
                                                help={this.state.errors.campusName}
                                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.campusName)}
                                            >
                                                <SelectCustom
                                                    id="campusName"
                                                    onChange={(e, value) => this.onChangeCampus('campusName', e)}
                                                    placeholder={trans('common:all')}
                                                    // defaultValue=""
                                                    value={this.state.data.campusName}
                                                    options={this.state.campus}
                                                    keyValue="name"
                                                >
                                                </SelectCustom>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={12} sm={12} md={6} lg={4} xl={3}>
                                            <Form.Item
                                                label={trans('map:location')}
                                                required={true}
                                                help={this.state.errors.locationCode}
                                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.locationCode)}
                                            >
                                                <SelectCustom
                                                    id="locationCode"
                                                    onChange={(e, value) => this.onChangeValueLocation('locationCode', e)}
                                                    placeholder={trans('common:all')}
                                                    // defaultValue=""
                                                    value={this.state.filter.locationCode}
                                                    options={this.state.location}
                                                    keyValue="code"
                                                >
                                                </SelectCustom>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={12} sm={12} md={6} lg={4} xl={3}>
                                            <Form.Item
                                                label={trans('map:floor')}
                                                required={true}
                                                help={this.state.errors.floorSearch}
                                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.floorSearch)}
                                            >
                                                <InputNumber
                                                    style={{ width: '100%' }}
                                                    id="floorSearch"
                                                    min={1}
                                                    max={this.state.maxFloor || 10}
                                                    value={this.state.filter.floorSearch}
                                                    onChange={(e) => this.onChangeValue('floorSearch', e)} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={12} sm={12} md={12} lg={4} xl={3} style={{
                                            marginTop: '19px',
                                            display: 'flex', justifyContent: 'flex-end'
                                        }}>
                                            <div className="button button-submit daily-checklist-searchbtn" onClick={this.onSearch}>
                                                {trans('common:button.search')}
                                            </div>
                                        </Col>
                                    </Row>
                                </Form>
                            </div>
                        </Col>
                        {this.state.isSearch ?
                            <>
                                <Col xs={12} sm={8} md={8} lg={9} xl={9}>
                                    <div>
                                        <Row>
                                            <Col xs={{ size: 12, order: 2 }} sm={{ size: 12, order: 1 }} md={12} lg={12} xl={12}>
                                                <div className="border-form padding-pannel" style={{ overflow: 'auto', height: '517px' }}>
                                                    <div className="game">
                                                        <div className="game-board">
                                                            <Board
                                                                options={{
                                                                    squares: this.state.squares,
                                                                    row: this.state.row,
                                                                    column: this.state.column,
                                                                    onClickRoom: (indexRoom, isUpdate) => {
                                                                        let squares = [...this.state.squares];
                                                                        let data = { ...this.state.data };
                                                                        this.setState({
                                                                            data: {
                                                                                ...data,
                                                                                ...squares[indexRoom]
                                                                            },
                                                                            isClone: false,
                                                                            isUpdate,
                                                                            indexRoomUpdate: indexRoom,
                                                                            errors: {}
                                                                        });
                                                                    }
                                                                }}
                                                            />
                                                            {/* <div id='renderBoard'>
                                                        </div> */}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col xs={{ size: 12, order: 1 }} sm={{ size: 12, order: 2 }} md={12} lg={12} xl={12}>
                                                <div className="border-form padding-pannel">
                                                    <Form layout="horizontal" colon={false}
                                                        // labelCol={{ span: '5' }}
                                                        labelAlign="left">
                                                        <Row>
                                                            <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                                <span><b>{trans('map:customizeMap.floorConfig')}</b></span>
                                                            </Col>
                                                            <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                                                                <Form.Item
                                                                    required
                                                                    label="Size"
                                                                    help={this.state.errors.floor}
                                                                    validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.floor)}
                                                                >
                                                                    <InputNumber
                                                                        style={{ width: '55px' }}
                                                                        id="row"
                                                                        min={1} max={200}
                                                                        value={this.state.data.row}
                                                                        placeholder='13'
                                                                        onChange={e => this.onChangeValueCustom('row', 'column', 'floor', e)} />
                                                                    &emsp;&emsp;X&emsp;&emsp;
                                                                    <InputNumber
                                                                        style={{ width: '55px' }}
                                                                        id="column"
                                                                        min={1} max={200}
                                                                        value={this.state.data.column}
                                                                        placeholder='20'
                                                                        onChange={e => this.onChangeValueCustom('column', 'row', 'floor', e)} />
                                                                    &emsp; {trans('map:customizeMap.square')}
                                                                </Form.Item>
                                                            </Col>
                                                            <Col xs={12} sm={12} md={6} lg={6} xl={6} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                                <div style={{ display: "flex", justifyContent: "space-between", width: '100px' }}>
                                                                    <Image
                                                                        style={{ cursor: 'pointer', border: '1px solid #41bf57', backgroundColor: '#e8f6f0' }}
                                                                        src={doneIcon}
                                                                        preview={false}
                                                                        width={40}
                                                                        onClick={() => this.handleSubmitFloor()}
                                                                    ></Image>
                                                                    <Image
                                                                        style={{ cursor: 'pointer', border: '1px solid #f44431', backgroundColor: '#fae7e7' }}
                                                                        src={cancelIcon}
                                                                        preview={false}
                                                                        width={40}
                                                                        onClick={() => this.handleClearFloor()}
                                                                    ></Image>
                                                                </div>
                                                            </Col>

                                                        </Row>
                                                    </Form>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                                <Col xs={12} sm={4} md={4} lg={3} xl={3} style={{ paddingBottom: '10px', paddingLeft: '0px' }}>
                                    <div className="border-form padding-pannel" style={{ height: '100%' }}>
                                        <Form layout="vertical" colon={false}
                                            // labelCol={{ span: '5' }}
                                            labelAlign="left">
                                            <Row>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                    <span><b>{trans('map:customizeMap.areaConfig')}</b></span>
                                                </Col>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                    <Form.Item
                                                        label={trans('map:customizeMap.name')}
                                                        help={this.state.errors.name}
                                                        validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.name)}
                                                    >
                                                        <Row>
                                                            <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "0px" }}>
                                                                <SelectCustom
                                                                    id="name"
                                                                    placeholder={trans('map:customizeMap.chooseRoomPlaceholder')}
                                                                    onChange={(e) => onChangeValue(this, 'name', e)}
                                                                    value={this.state.data.name}
                                                                    options={this.state.areaRoom}
                                                                    keyValue="name"
                                                                    clear={true}
                                                                />
                                                            </Col>
                                                        </Row>
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                    <Form.Item
                                                        required
                                                        label={trans('map:customizeMap.size')}
                                                        help={this.state.errors.size}
                                                        validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.size)}
                                                    >
                                                        <Row>
                                                            <Col xs={4} sm={5} md={4} lg={4} xl={3} style={{ display: 'flex', marginBottom: "0px" }}>
                                                                <InputNumber
                                                                    id="sizeX"
                                                                    min={1} max={200}
                                                                    value={this.state.data.sizeX}
                                                                    placeholder='2'
                                                                    onChange={e => this.onChangeValueCustom('sizeX', 'sizeY', 'size', e)} />
                                                            </Col>
                                                            <Col xs={1} sm={1} md={1} lg={1} xl={1} style={{ marginBottom: "0px" }}>
                                                                <span>X</span>
                                                            </Col>
                                                            <Col xs={4} sm={5} md={4} lg={4} xl={3} style={{ display: 'flex', marginBottom: "0px" }}>
                                                                <InputNumber
                                                                    id="sizeY"
                                                                    min={1} max={200}
                                                                    value={this.state.data.sizeY}
                                                                    placeholder='2'
                                                                    onChange={e => this.onChangeValueCustom('sizeY', 'sizeX', 'size', e)}
                                                                />
                                                            </Col>
                                                            <Col xs={3} sm={12} md={3} lg={3} xl={4} style={{ marginBottom: "0px" }}>
                                                                <span>{trans('map:customizeMap.square')}</span>
                                                            </Col>
                                                        </Row>
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                    <Form.Item
                                                        required
                                                        label={trans('map:customizeMap.position')}
                                                        help={this.state.errors.position}
                                                        validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.position)}
                                                    >
                                                        <Row>
                                                            <Col xs={6} sm={6} md={6} lg={6} xl={4} style={{ display: 'flex', marginBottom: "0px" }}>
                                                                X:&emsp;
                                                                <InputNumber
                                                                    id="x"
                                                                    min={1} max={200}
                                                                    value={this.state.data.x}
                                                                    placeholder='1'
                                                                    onChange={e => this.onChangeValueCustom('x', 'y', 'position', e)}
                                                                />
                                                            </Col>
                                                            <Col xs={6} sm={6} md={6} lg={6} xl={4} style={{ display: 'flex', marginBottom: "0px" }}>
                                                                Y:&emsp;
                                                                <InputNumber
                                                                    id="y"
                                                                    min={1} max={200}
                                                                    value={this.state.data.y}
                                                                    placeholder='1'
                                                                    onChange={e => this.onChangeValueCustom('y', 'x', 'position', e)}
                                                                />
                                                            </Col>
                                                        </Row>
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                    <Form.Item
                                                        required
                                                        label={trans('map:customizeMap.areaType')}
                                                        help={this.state.errors.type}
                                                        validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.type)}
                                                    >
                                                        <Row>
                                                            <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "0px" }}>
                                                                <SelectCustom
                                                                    id="type"
                                                                    onChange={(e, value) => onChangeValue(this, 'type', value.children)}
                                                                    // defaultValue="Student1212"
                                                                    // disabled={this.state.disabledField}
                                                                    placeholder={trans('map:customizeMap.typePlaceholder')}
                                                                    value={this.state.data.type}
                                                                    options={this.state.typeArea}
                                                                />
                                                            </Col>
                                                        </Row>
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                    {trans('map:customizeMap.haveDoor')}
                                                    <Checkbox
                                                        value={this.state.data.isHaveDoor}
                                                        checked={this.state.data.isHaveDoor}
                                                        onChange={e => this.onChangeCheckbox('isHaveDoor', e.target.checked)}
                                                        style={{ marginLeft: "15px" }}
                                                    />
                                                </Col>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                    <Form.Item
                                                        required
                                                        label={trans('map:customizeMap.door')}
                                                        help={this.state.errors.door}
                                                        validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.door)}
                                                    >
                                                        <Row>
                                                            <Col xs={6} sm={6} md={6} lg={6} xl={3} style={{ display: 'flex' }}>
                                                                <span style={{ marginTop: '4px' }}>X:</span>&emsp;
                                                                <InputNumber
                                                                    // style={{ width: '15%', marginBottom: '10px' }}
                                                                    id="doorX"
                                                                    min={0} max={200}
                                                                    value={this.state.data.doorX}
                                                                    // defaultValue={0}
                                                                    placeholder='1'
                                                                    onChange={e => this.onChangeValueCustom('doorX', 'doorY', 'door', e)}
                                                                />
                                                            </Col>
                                                            <Col xs={6} sm={6} md={6} lg={6} xl={3} style={{ display: 'flex' }}>
                                                                <span style={{ marginTop: '4px' }}>Y:</span>&emsp;
                                                                <InputNumber
                                                                    // style={{ width: '15%' }}
                                                                    id="doorY"
                                                                    min={0} max={200}
                                                                    value={this.state.data.doorY}
                                                                    placeholder='1'
                                                                    // defaultValue={0}
                                                                    onChange={e => this.onChangeValueCustom('doorY', 'doorX', 'door', e)}
                                                                />
                                                            </Col>
                                                            {/* &emsp; */}
                                                            <Col xs={12} sm={12} md={12} lg={{ size: 12, offset: 0 }} xl={{ size: 6, offset: 0 }} style={{ marginBottom: "0px" }}>

                                                                <SelectCustom
                                                                    // style={{ width: '43%' }}
                                                                    id="directDoor"
                                                                    onChange={(e, value) => this.onChangeValueDirectDoor('directDoor', e)}
                                                                    // defaultValue="Student1212"
                                                                    // disabled={this.state.disabledField}
                                                                    placeholder={trans('map:customizeMap.directPlaceholder')}
                                                                    value={this.state.data?.directDoor}
                                                                    options={this.state.doorDirect}
                                                                    keyValue="name"
                                                                    clear={true}
                                                                />
                                                            </Col>
                                                        </Row>
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={6} sm={12} md={12} lg={12} xl={6}>
                                                    {trans('map:customizeMap.cloneArea')}
                                                    <Checkbox
                                                        // value={this.state.isClone}
                                                        checked={this.state.isClone}
                                                        onChange={e => this.onChangeCheckboxCustom(e.target.checked)}
                                                        style={{ marginLeft: "15px" }}
                                                    />
                                                </Col>
                                                <Col xs={6} sm={12} md={12} lg={12} xl={6} style={{ display: "flex", justifyContent: "flex-end" }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", width: '100px' }}>
                                                        <Image
                                                            style={{ cursor: 'pointer', border: '1px solid #41bf57', backgroundColor: '#e8f6f0' }}
                                                            src={doneIcon}
                                                            preview={false}
                                                            width={40}
                                                            onClick={() => this.handleSubmitRoom()}
                                                        ></Image>
                                                        <Image
                                                            style={{ cursor: 'pointer', border: '1px solid #f44431', backgroundColor: '#fae7e7' }}
                                                            src={cancelIcon}
                                                            preview={false}
                                                            width={40}
                                                            onClick={() => this.handleRemoveRoom()}
                                                        ></Image>
                                                    </div>
                                                </Col>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{
                                                    marginTop: '25px',
                                                    display: 'flex', justifyContent: 'flex-end',
                                                }}>
                                                    <div className="button button-submit daily-checklist-searchbtn" onClick={this.onSave}>
                                                        {trans('map:customizeMap.saveAll')}
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Form>
                                    </div>
                                </Col>
                            </> : null
                        }
                    </Row>
                </div>
            </>
        );
    }

};

export default withTranslation(['map', 'common'])(CustomizeMap);

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            options: this.props.options
        };
    }

    componentDidMount() {
        const handleClick = (i) => {
            this.props.options.onClickRoom(i, true);
        }

        let options = this.state.options;
        document.getElementById('renderBoard').innerHTML = this.renderBoard(options.row + 1, options.column + 1, options.squares);
        for (let i = 0; i < options.squares.length; i++) {
            // document.querySelector('.room' + i + '').addEventListener('click', handleClick.bind(this, i));
            document.querySelectorAll('.room' + i + '').forEach(item => {
                item.addEventListener('click', handleClick.bind(this, i))
            });
        }
    }

    componentWillReceiveProps = async (nextProps) => {
        if (nextProps.options !== this.props.options) {
            await this.setState({
                options: nextProps?.options,
            });
        }

        let options = this.props.options;
        document.getElementById('renderBoard').innerHTML = this.renderBoard(options.row + 1, options.column + 1, options.squares);

        const handleClick = (i) => {
            // const squares = this.state.squares.slice();
            this.props.options.onClickRoom(i, true);
        }

        for (let i = 0; i < options.squares.length; i++) {
            // document.querySelector('.room' + i + '').addEventListener('click', handleClick.bind(this, i));
            document.querySelectorAll('.room' + i + '').forEach(item => {
                item.addEventListener('click', handleClick.bind(this, i))
            });
        }
    }

    renderBoard(row, column, squares) {

        let html = '';
        for (let i = 0; i < row; i++) {
            html += '<div class="flex-row">';
            for (let j = 0; j < column; j++) {
                if (i === 0 && j > 0) {
                    html += "<div class='square background-row-number'>" + j + "</div>"
                } else if (j === 0 && i > 0) {
                    html += "<div class='square background-column-number'>" + i + "</div>"
                } else {
                    html += "<div class='square ";
                    let renderRoom = squares ? squares.map(function (item, index) {
                        for (let n = 0; n < item.sizeX; n++) {
                            for (let m = 0; m < item.sizeY; m++) {
                                if (item.x + n == i && item.y + m == j) {
                                    let roomConfig = 'pointer-room';
                                    if (item.isHaveDoor && i == item.doorX && j == item.doorY) {
                                        roomConfig += ' ' + item.directDoor + '-door';
                                    }
                                    item.type = item.type.toLowerCase();
                                    if (item.type === 'phòng học') {
                                        roomConfig += ' background-classroom';
                                    } else if (item.type === 'nhà vệ sinh nam') {
                                        roomConfig += ' background-restroom-men';
                                    } else if (item.type === 'nhà vệ sinh nữ') {
                                        roomConfig += ' background-restroom-women'
                                    } else if (item.type === 'khu vực trống hoặc cầu thang') {
                                        roomConfig += ' background-stairs';
                                    } else if (item.type === 'giếng trời') {
                                        roomConfig += ' background-skylight';
                                        if (n < 1) {
                                            roomConfig += ' border-top-skylight';
                                        }
                                        if (m < 1) {
                                            roomConfig += ' border-left-skylight';
                                        }
                                        if (n === item.sizeX - 1) {
                                            roomConfig += ' border-bottom-skylight';
                                        }
                                        if (m === item.sizeY - 1) {
                                            roomConfig += ' border-right-skylight';
                                        }
                                    }
                                    if ((item.x + n == item.x) && (item.y + m == item.y)) {
                                        return roomConfig + " first-border-room room" + index + "'>" + (item?.name?.indexOf('-') !== -1 ? item?.name?.slice(0, 3) : item?.name?.split(' ')?.[0]);
                                    }
                                    if ((item.x + n == item.x) && (item.y + m == item.y + 1)) {
                                        return roomConfig + " second-border-room room" + index + "'>" + (item?.name?.indexOf('-') !== -1 ? item?.name?.slice(3, 7) : item?.name?.split(' ')[1] || '');
                                    }
                                    if (n > 0 && m > 0) {
                                        return roomConfig + " third-border-room room" + index + "'>"
                                    }
                                    if (n > 0 && j == item.y) {
                                        return roomConfig + " fourth-border-room room" + index + "'>";
                                    }
                                    if (i == item.x && m > 1) {
                                        return roomConfig + " center-top-border-room room" + index + "'>";
                                    }
                                    continue;
                                }
                            }
                        }

                    }) : null;
                    if (renderRoom) {
                        if (renderRoom.join('').split(' ').pop().trim() === '') {
                            html += renderRoom.join('') + "'></div>";
                        } else {
                            html += renderRoom.join('') + "</div>";
                        }
                    } else {
                        html += "'></div>";
                    }
                }
                // }
            }

            html += '</div>'
        }
        return html;
    }

    render() {
        return (
            <div id='renderBoard'>
            </div>
        );
    }
}
