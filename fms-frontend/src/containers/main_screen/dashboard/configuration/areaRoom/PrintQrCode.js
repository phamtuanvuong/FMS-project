import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../../layout/Common.css';
import {
    Checkbox, Table, Button, Pagination, Input, Form
} from 'antd';
import 'antd/dist/antd.min.css';
import { ACTION, STATUS, MESSAGE, URLWEB } from '../../../../../constants/Constants';
import { AreaRoomService } from '../../../../../services/main_screen/configuration/AreaRoomService';
import '../../../../../layout/Configuration.css';
import SelectCustom from '../../../../../components/SelectCustom';
import { showDialog, hideDialog } from '../../../../../components/Dialog';
import { showConfirm, hideDialogConfirm } from '../../../../../components/MessageBox';
import AreaRoomPopup from './AreaRoomPopup';
import { Notification } from "../../../../../components/Notification";
import editIcon from '../../../../../assets/edit.png';
import ReactToPrint from "react-to-print";
import {
    handleHideNav,
    trans
} from '../../../../../components/CommonFunction';
import QRCode from "react-qr-code";
import '../../../../../layout/RoomAreaConfig.css';
import { withTranslation } from 'react-i18next';

// import { exportComponentAsJPEG, exportComponentAsPDF, exportComponentAsPNG } from 'react-component-export-image';

class PrintQrCode extends Component {
    constructor(props) {
        super(props);
        this.state = {
            columnTable: this.columnTable,
            dataTable: [],
            data: {},
            dataCreate: {},
            errors: {},
            filter: {
                paging: {
                    pageSize: 9999999,
                    currentPage: 1,
                    rowsCount: 0
                },
            },
            campus: []
        };
        this.qrRef = React.createRef();
        this.Notification = new Notification();
        this.service = new AreaRoomService();
    }

    componentDidMount() {
        this.loadSelect();
        this.loadForm();
        document.querySelector('.container').addEventListener('click', handleHideNav);
    }

    loadForm = async (currentPage = 1) => {
        let filter = { ...this.state.filter };
        filter.paging.currentPage = currentPage;

        if (typeof filter.roomCode === 'string') {
            filter.roomCode = filter.roomCode.trim();
            if (filter.roomCode.length === 0) {
                filter.roomCode = null;
            }
        }
        this.service.getListAreaRoomNoCondition(filter).then(res => {
            if (res && res.status === 200) {
                if (res.data) {
                    let filter = { ...this.state.filter };
                    filter.paging.rowsCount = res.data.paging.rowsCount;
                    let data = res.data.listData;
                    let key = 1;
                    for (let item of data) {
                        item.key = key;
                        key++;
                    }
                    this.setState({ dataTable: data, filter: filter, dataTableOrigin: data });
                }
            } else {
                this.Notification.error(MESSAGE.ERROR);
            }
        });
    }

    loadSelect = async () => {
        const resCampus = await this.service.getAllCampusNoCondition();
        const resLocation = await this.service.getAllLocationNoCondition();
        if (resCampus.data.status !== STATUS.SUCCESS || resLocation.data.status !== STATUS.SUCCESS) {
            this.Notification.error(MESSAGE.ERROR);
        } else {
            let campus = resCampus?.data?.listData;
            let location = resLocation?.data?.listData;
            this.setState({
                campus,
                location
            });
        }
    }



    onCheckGenQr = (selectedRowKeys, selectedRows) => {
        console.log(selectedRows);
        this.setState({
            listQRcode: selectedRows
        })
    }

    onCancel = () => {
        this.setState({
            visible: false
        });
    };

    handleCreate = () => {
        this.onOpenModalCreate(ACTION.CREATE, {});
    }

    onShowSizeChange = (current, pageSize) => {
        let filter = { ...this.state.filter };
        filter.paging.currentPage = 1;
        filter.paging.pageSize = pageSize;
        this.setState({ filter: filter });

        setTimeout(() => {
            this.loadForm();
        }, 100);

    };

    onPageChange = (page, pageSize) => {
        let filter = { ...this.state.filter };
        filter.paging.currentPage = page;
        this.setState({ filter: filter });
        setTimeout(() => {
            this.loadForm(page);
        }, 100);

    };

    onChange = (value, name) => {
        let filter = { ...this.state.filter };

        filter[name] = value;
        this.setState({
            filter: filter
        });
    }

    onSearchDataTable = (campus, location, roomCode) => {
        let dataTableOrigin = [...this.state.dataTableOrigin];
        console.log(campus, location, roomCode)

        let dataSearch = campus ? dataTableOrigin.filter(item => item.campusName === campus) : dataTableOrigin;

        dataSearch = location ? dataSearch.filter(item => item.locationCode === location) : dataSearch;

        dataSearch = roomCode ? dataSearch.filter(item => item.name === roomCode) : dataSearch;

        console.log(dataSearch, 'check data search');

        this.setState({
            dataTable: dataSearch
        });
    }

    loadLocationSelect = async (value) => {
        let resListLocation = await this.service.getListLocationNoCondition({
            "paging": {
                "currentPage": 1,
                "pageSize": 99999999,
                "rowsCount": 0
            },
            "campus": value,
            "locationCode": null
        });

        if (resListLocation.data.status === STATUS.SUCCESS) {
            let location = resListLocation.data.listData;
            this.setState({
                location
            });
        } else {
            this.Notification.error(MESSAGE.ERROR);
        }
    }

    onChangeCampus = (name, value) => {
        let filter = { ...this.state.filter };
        let dataTableOrigin = [...this.state.dataTableOrigin];
        filter[name] = value;


        // if (value) {
        //     let dataSearch = dataTableOrigin.filter(item => {
        //         return item.campusName === value;
        //     });
        //     console.log(dataSearch, 'check data search');

        //     this.setState({
        //         filter,
        //         dataTable: dataSearch
        //     });
        // } else {
        //     this.setState({
        //         filter,
        //         dataTable: dataTableOrigin
        //     });
        // }
        this.setState({
            filter,
            //         dataTable: dataTableOrigin
        });

        this.loadLocationSelect(value);
    }

    render() {
        var columnTable = [
            {
                title: trans('configuration:no'),
                dataIndex: 'key',
                width: 25
            },
            {
                title: trans('configuration:areaRoom.campus'),
                dataIndex: 'campusName',
                width: 100,
            },
            {
                title: trans('configuration:areaRoom.locationCode'),
                dataIndex: 'locationCode',
                width: 100,
            },
            {
                title: trans('configuration:areaRoom.areaRoomCode'),
                dataIndex: 'name',
                width: 140,
            },
            {
                title: trans('configuration:areaRoom.areaFullName'),
                dataIndex: 'fullName',
                width: 280,
            },
            Table.SELECTION_COLUMN,
        ];
        return (
            <>
                <Form layout="vertical">
                    <Row>
                        <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "10px" }}>
                            <div className="daily-checklist-container padding-pannel">
                                <Row >
                                    <Col xs={12} sm={12} md={4} lg={4} xl={3}>
                                        <div className="location-search-title title-input">
                                        {trans("configuration:areaRoom.campus")}
                                        </div>
                                        <div className="location-search-combobox">
                                            <SelectCustom
                                                id="search"
                                                placeholder={trans("common:all")}
                                                onChange={(e, value) => this.onChangeCampus('campus', e)}
                                                value={this.state.filter.campus}
                                                options={this.state.campus}
                                                clear={true}
                                                keyValue="name"
                                            />
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={4} lg={4} xl={3}>
                                        <div className="location-search-title title-input">
                                        {trans("configuration:areaRoom.location")}
                                        </div>
                                        <div className="location-search-combobox">
                                            <SelectCustom
                                                id="locationCode"
                                                placeholder={trans("common:all")}
                                                onChange={(e, value) => this.onChange(value ? value.value : null, 'locationCode')}
                                                value={this.state.filter.locationCode}
                                                options={this.state.location}
                                                keyValue="code"
                                                lable="code"
                                                clear={true}
                                            />
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={4} lg={4} xl={3}>
                                        <div className="location-search-title title-input">
                                        {trans("configuration:areaRoom.roomCode")}
                                        </div>
                                        <div className="location-search-combobox">
                                            <Input
                                                id="roomCode"
                                                placeholder=''
                                                value={this.state.filter.roomCode}
                                                onChange={e => this.onChange(e.target.value.length === 0 ? null : e.target.value, 'roomCode')}
                                            />
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={12} xl={3} style={{
                                        marginTop: '24px',
                                        display: 'flex',
                                        justifyContent: 'flex-end'
                                    }}>
                                        <Button
                                            className="button-submit button"
                                            onClick={() => { this.onSearchDataTable(this.state.filter.campus, this.state.filter.locationCode, this.state.filter.roomCode) }}
                                        >
                                            {trans("common:button.search")}
                                        </Button>
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginTop: "15px" }}>
                                        <Table
                                            columns={columnTable}
                                            dataSource={this.state.dataTable}
                                            pagination={false}
                                            size="small"
                                            scroll={{
                                                y: 300,
                                            }}
                                            rowSelection={{
                                                type: 'checkbox',
                                                onChange: (selectedRowKeys, selectedRows) => this.onCheckGenQr(selectedRowKeys, selectedRows)
                                            }}
                                        />
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{
                                        marginTop: '24px',
                                        display: 'flex',
                                        justifyContent: 'flex-end'
                                    }}>
                                        {/* <Button className="button-submit button">Print QR code</Button>          */}
                                        <ReactToPrint
                                            trigger={() => { return <Button className="button-submit button">{trans("configuration:areaRoom.printQRCode")}</Button> }}
                                            content={() => this.componentRef}
                                            documentTitle="SWP409_G7"
                                            pageStyle={"print"}
                                        />
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ display: "none" }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap' }} ref={el => (this.componentRef = el)}>
                                            {
                                                this.state.listQRcode ? this.state.listQRcode.map((item, index) => {
                                                    return <div className="qrCode-component" key={index}>
                                                        <div>
                                                            <QRCode value={URLWEB.path + "/" + item.campusName + "/" + item.locationCode + "/" + item.name} size={80} />
                                                        </div>
                                                        <div className="qrCode-info">
                                                            <div className="title-qrCode"><b>Quét để báo cáo sự cố hoặc tick kiểm tra</b></div>
                                                            <div className="info-room-qrCode"><b>Phòng {item.name}</b></div>
                                                        </div>
                                                    </div>
                                                }) : null
                                            }
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </Col>
                    </Row>
                </Form>
            </>
        );
    }

};

export default withTranslation(['configuration', 'common'])(PrintQrCode);
