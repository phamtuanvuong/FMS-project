import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../layout/Home.css';
import '../../../../layout/MyTrouble.css';
import '../../../../layout/Common.css';
import {
    Input, DatePicker, InputNumber, Form, Image, Checkbox
} from 'antd';
import 'antd/dist/antd.min.css';
import HeaderPannel from '../../../../components/HeaderPannel';
import { ACTION } from '../../../../constants/Constants';
import { Link } from 'react-router-dom';
import { MapService } from '../../../../services/main_screen/map/MapService';
import SelectCustom from '../../../../components/SelectCustom';
import moment from "moment";
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
import { forwardRef } from 'react';
import doneIcon from '../../../../assets/done-icon.png';
import cancelIcon from '../../../../assets/icons-close.png';
import { Notification } from '../../../../components/Notification';
import { MESSAGE } from '../../../../constants/Constants';
import { withTranslation } from 'react-i18next';

class ViewMap extends Component {
    constructor(props) {
        super(props);
        this.state = {
            squares: [],
            row: 14,
            column: 21,
            data: {
                // row: 14,
                // column: 21,
            },
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
        };
        this.Notification = new Notification();
        this.service = new MapService();
    }

    componentDidMount() {
        this.loadSelectCampus();
        document.querySelector('.container').addEventListener('click', handleHideNav);
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
            this.Notification.error(MESSAGE.EROR);
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

    validate() {
        // var isValid = true;
        var data = { ...this.state.data };
        let [isValid, errors] = validateEmpty(data, ["campusName", "locationCode", "floor"]);
        if (!isValid) {
            focusInvalidInput(errors);
        }
        this.setState({
            errors
        });
        return isValid;
    }

    onSearch = async () => {
        if (!this.validate()) {
            return;
        }

        let data = { ...this.state.data };
        console.log(data);
        let resMap = await this.service.getMap(data);
        if (resMap && resMap.data.data) {
            let data = resMap.data.data;
            this.setState({
                squares: data.squares,
                row: data.row,
                column: data.column
            })
        } else {
            this.setState({
                squares: []
            });
            this.Notification.error(MESSAGE.ERROR);
        }
    }

    onChangeCampus = (name, value) => {
        let data = { ...this.state.data };
        let errors = { ...this.state.errors };

        data[name] = value;
        data.locationCode = null;

        errors[name] = '';
        errors.locationCode = '';

        this.setState({
            data,
            errors
        });

        this.loadSelectLocation(value || '');
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
                                title={trans('map:viewMap.title')}
                                breadcrumbList={[trans('map:map'), trans('map:viewMap.title')]}
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
                                                    onChange={(e, value) => onChangeValue(this, 'locationCode', e)}
                                                    placeholder={trans('common:all')}
                                                    // defaultValue=""
                                                    value={this.state.data.locationCode}
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
                                                help={this.state.errors.floor}
                                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.floor)}
                                            >
                                                <InputNumber
                                                    style={{ width: '100%' }}
                                                    id="floor"
                                                    min={1}
                                                    max={20}
                                                    value={this.state.data.floor}
                                                    onChange={(e) => onChangeValue(this, 'floor', e)} />
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
                        {this.state.squares && this.state.squares.length > 0 ?
                            <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "10px" }}>
                                <div id="container-board" className="border-form padding-pannel" style={{ overflow: 'auto', height: '650px' }}>
                                    <div className="board" style={{ justifyContent: 'center' }}>
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
                                                        isUpdate,
                                                        indexRoomUpdate: indexRoom,
                                                        errors: {}
                                                    });
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </Col> : null
                        }
                    </Row>
                </div>
            </>
        );
    }

};

export default withTranslation(['map', 'common'])(ViewMap);

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
        console.log(options.squares)
        for (let i = 0; i < options.squares.length; i++) {
            // document.querySelector('.room' + i + '').addEventListener('click', handleClick.bind(this, i));
            document.querySelectorAll('.room' + i + '').forEach(item => {
                item.addEventListener('click', handleClick.bind(this, i))
            });
        }
    }

    renderBoard(row, column, squares) {
        let containerWidth = document.getElementById('container-board').clientWidth;
        let numberSquare = containerWidth / column;
        console.log(numberSquare, 'check numerb square');
        let html = '';
        for (let i = 0; i < row; i++) {
            html += '<div class="flex-row">';
            for (let j = 0; j < column; j++) {
                html += "<div class='square-view ";
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
                                    roomConfig += ' background-stairs-view';
                                    if (n < 1) {
                                        roomConfig += ' border-top-stairs-view';
                                    }
                                    if (m < 1) {
                                        roomConfig += ' border-left-stairs-view';
                                    }
                                    if (n === item.sizeX - 1) {
                                        roomConfig += ' border-bottom-stairs-view';
                                    }
                                    if (m === item.sizeY - 1) {
                                        roomConfig += ' border-right-stairs-view';
                                    }
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
                                    return roomConfig + " first-border-room room" + index + "'>" + (item?.name?.indexOf('-') !== -1 ? item?.name?.slice(0, 3) : item?.name?.split(' ')?.[0]) || '';
                                }
                                if ((item.x + n == item.x) && (item.y + m == item.y + 1)) {
                                    return roomConfig + " second-border-room room" + index + "'>" + (item?.name?.indexOf('-') !== -1 ? item?.name?.slice(3, 6) : item?.name?.split(' ')[1] || '') || '';
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
