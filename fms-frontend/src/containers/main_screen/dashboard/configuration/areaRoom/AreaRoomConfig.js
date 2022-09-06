import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../../layout/Common.css';
import {
    Checkbox, Table, Button, Pagination, Input, Image
} from 'antd';
import 'antd/dist/antd.min.css';
import HeaderPannel from '../../../../../components/HeaderPannel';
import { ACTION, STATUS, MESSAGE, URLWEB } from '../../../../../constants/Constants';
import { AreaRoomService } from '../../../../../services/main_screen/configuration/AreaRoomService';
import '../../../../../layout/Configuration.css';
import SelectCustom from '../../../../../components/SelectCustom';
import { showDialog, hideDialog } from '../../../../../components/Dialog';
import { showConfirm, hideDialogConfirm } from '../../../../../components/MessageBox';
import AreaRoomPopup from './AreaRoomPopup';
import { Notification } from "../../../../../components/Notification";
import removeIcon from '../../../../../assets/bin.png';
import editIcon from '../../../../../assets/edit.png';
import {
    handleHideNav,
    trans
} from '../../../../../components/CommonFunction';
import QRCode from "react-qr-code";
import AreaRoomImport from './AreaRoomImport';
import PrintQrCode from './PrintQrCode';
import { withTranslation } from 'react-i18next';
import { SettingOutlined } from '@ant-design/icons';

// import { exportComponentAsJPEG, exportComponentAsPDF, exportComponentAsPNG } from 'react-component-export-image';

class AreaRoomConfig extends Component {
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
                    pageSize: 10,
                    currentPage: 1,
                    rowsCount: 0
                },
            },
            campus: []
        };
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
                    filter.paging.rowsCount = res.data.paging.rowsCount;
                    let data = res.data.listData;
                    let stt = 1;
                    for (let item of data) {
                        item.stt = stt;
                        stt++;
                    }
                    this.setState({ dataTable: data, filter: filter });
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

   

    onCheckIsActive = async (value, dataRow) => {
        let resIsActive = await this.service.changeIsActive({
            id: dataRow.id,
            inService: value
        });
        if (resIsActive && resIsActive.data.status === STATUS.SUCCESS) {
            let filter = { ...this.state.filter };
            this.Notification.success("Change in service successfully.")
            this.loadForm(filter.paging.currentPage);
        } else {
            this.Notification.error(MESSAGE.ERROR);
        }
    }

    renderColumnCheckbox(dataCell, dataRow) {
        return <div style={{ textAlign: 'center' }}>
            <Checkbox checked={dataCell} onChange={e => this.onCheckIsActive(e.target.checked, dataRow)}></Checkbox>
        </div >
    }

    renderQrCodeColumn = (review, data, index) => {
        let refQr = React.createRef();
        return <div style={{ textAlign: 'center', justifyContent: 'space-around', display: 'flex' }}>
            <div style={{ textAlign: 'center', cursor: 'pointer' }}
            // ref={refQr}
            // onClick={() => this.onClickAction(data, ACTION.EXPORTQR, index)}
            >
                {/* <Image
                    // src={refQr}
                    preview={true}
                    width={50}
                    onClick={() => this.handleSubmitRoom()}
                > */}
                <QRCode id={index + '-qr'} value={URLWEB.path + "/" + data.campusName + "/" + data.locationCode + "/" + data.name} size={50} />
                {/* </Image> */}
            </div>
        </div>
    }

    renderActionColumn(review, data) {
        return <div style={{ textAlign: 'center', justifyContent: 'space-around', display: 'flex' }}>
            <div style={{ textAlign: 'center', cursor: 'pointer' }}
                onClick={() => this.onOpenModalCreate(ACTION.UPDATE, data)}
            >
                <img src={editIcon} alt="" width="20px" />
            </div>
            {/* <div style={{ textAlign: 'center', cursor: 'pointer' }}
                onClick={() => this.onClickAction(data, ACTION.DELETE)}
            >
                <img src={removeIcon} alt="" width="20px" />
            </div> */}
        </div>;
    }

    onClickAction = (data, action, index) => {
        if (action === ACTION.DELETE) {
            showConfirm(
                trans("common:notiTitleDelete"),
                () => this.onDelete(data),
                trans("common:notify")
            )
        } 
        // else if (action === ACTION.EXPORTQR) {
        //     let component = document.getElementById(index + '-qr');
        //     const s = new XMLSerializer().serializeToString(component);
        //     this.svgString2Image(s, 600, 600, 'png', function (pngData) {
        //         let link = document.createElement('a');
        //         link.href = pngData;

        //         link.download = true;
        //         link.click();
        //     });
        // }
    }

    svgString2Image = (svgString, width, height, format, callback) => {
        // set default for format parameter
        format = format ? format : 'png';
        // SVG data URL from SVG string
        var svgData = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
        // create canvas in memory(not in DOM)
        var canvas = document.createElement('canvas');
        // get canvas context for drawing on canvas
        var context = canvas.getContext('2d');
        // set canvas size
        canvas.width = width;
        canvas.height = height;
        // create image in memory(not in DOM)
        var image = new Image();
        // later when image loads run this
        image.onload = function () { // async (happens later)
            // clear canvas
            context.clearRect(0, 0, width, height);
            // draw image with SVG data to canvas
            context.drawImage(image, 0, 0, width, height);
            // snapshot canvas as png
            var pngData = canvas.toDataURL('image/' + format);
            // pass png data URL to callback
            callback(pngData);
        }; // end async
        // start loading SVG data into in memory image
        image.src = svgData;
        // return svgData;
    }

    onDelete = async (data) => {
        // console.log('delete')
        let res = await this.service.deleteAreaRoom(data.id);
        // console.log(res);
        if (res.data.status === STATUS.SUCCESS) {
            hideDialogConfirm();
            this.Notification.success(MESSAGE.DELETE_SUCCESS);
            this.loadForm();
        } else {
            hideDialogConfirm();
            this.Notification.error(MESSAGE.ERROR);
        }
    }

    onCancel = () => {
        this.setState({
            visible: false
        });
    };

    handleCreate = () => {
        this.onOpenModalCreate(ACTION.CREATE, {});
    }

    onOpenModalCreate = (action, data) => {
        showDialog(
            this.getCampusForm(action, data),
            action === ACTION.CREATE ? trans('configuration:areaRoom.createAreaRoom') : trans('configuration:areaRoom.updateAreaRoom') ,
        )
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

    getCampusForm = (action, {...data}) => {
        let campus = [...this.state.campus];
        campus = campus.filter(item => item.inService === true);
        let roomCodeInitial = data.name ? data.name : null;
        data.name = data.name ? data.name.slice(data.name.indexOf('-') + 1) : null;

        console.log(data.name);
        return (
            <AreaRoomPopup
                options={{
                    action,
                    data,
                    dataNew: data,
                    campus,
                    roomCodeInitial,
                    onComplete: async (rowData) => {
                        console.log(rowData);
                        const res = await this.service.saveAreaRoom(rowData);
                        // console.log(res, 'check apiiii');
                        if (res.data.status === STATUS.SUCCESS) {
                            hideDialog();
                            this.loadForm();
                            if (action === ACTION.UPDATE) {
                                this.Notification.success(MESSAGE.UPDATE_SUCCESS);
                            } else if (action === ACTION.CREATE) {
                                this.Notification.success(MESSAGE.CREATE_SUCCESS);
                            }
                        } else {
                            this.Notification.error(MESSAGE.ERROR);
                        }
                    },
                    onCancel: (rowData) => {
                        // console.log('ádasdas')
                        hideDialog(true, rowData);
                    }
                }}
            />
        )
    }

    onChange = (value, name) => {
        let data = { ...this.state.filter };
        data[name] = value
        this.setState({ filter: data });
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
        filter[name] = value;
        filter.locationCode = null;
        console.log(value);
        this.setState({ filter });

        this.loadLocationSelect(value);
    }

    onOpenDialogImport = () => {
        showDialog(
            this.getImportForm(),
            trans('configuration:importFromExcel'),
        )
    }

    getImportForm = () => {
        return (
            <AreaRoomImport
                options={{
                    // data: { ...data },
                    // dataNew: data,

                    onComplete: async (rowData) => {
                        const res = await this.service.saveImportExcel(rowData);
                        console.log(res.data.data, 'check res.data');

                        if (res.data.status === STATUS.SUCCESS) {
                            hideDialog();

                            this.loadForm();
                            this.Notification.success(MESSAGE.UPDATE_SUCCESS);


                        } else {
                            this.Notification.error(MESSAGE.ERROR);
                        }
                    },
                    onCancel: (rowData) => {
                        // console.log('ádasdas')
                        hideDialog(false, rowData);
                    }
                }}
            />
        )
    }

    onOpenDialogPrintQR = () => {
        let dataTable = [...this.state.dataTable];
        showDialog(
            this.getPrintQrCodeForm(dataTable),
            trans('configuration:exportQR'),
        )
    }

    getPrintQrCodeForm = (dataTable) => {
        return (
            <PrintQrCode
                options={{
                    // data: { ...data },
                    // dataNew: data,
                    dataTable,
                    onComplete: async (rowData) => {
                        const res = await this.service.saveImport(rowData);
                        console.log(res.data.data, 'check res.data');

                        if (res.data.status === STATUS.SUCCESS) {
                            hideDialog();
                            let update = res.data?.data;

                            let data = { ...this.state.data };
                            console.log(data, 'check data');
                            data.componentId = update.componentId;
                            await this.setState({
                                data: data
                            });
                            this.loadForm();
                            this.Notification.success(MESSAGE.UPDATE_SUCCESS);


                        } else {
                            this.Notification.error(MESSAGE.ERROR);
                        }
                    },
                    onCancel: (rowData) => {
                        // console.log('ádasdas')
                        hideDialog(false, rowData);
                    }
                }}
            />
        )
    }

    render() {
       var columnTable = [
            {
                title: trans('configuration:no'),
                dataIndex: 'stt',
                key: 'stt',
                width: 25
            },
            {
                title: trans('configuration:areaRoom.campus'),
                dataIndex: 'campusName',
                key: 'campusName',
                width: 100,
            },
            {
                title: trans('configuration:areaRoom.locationCode'),
                dataIndex: 'locationCode',
                key: 'locationCode',
                width: 100,
            },
            {
                title: trans('configuration:areaRoom.areaRoomCode'),
                dataIndex: 'name',
                key: 'name',
                width: 140,
            },
            {
                title: trans('configuration:areaRoom.areaFullName'),
                dataIndex: 'fullName',
                key: 'fullName',
                width: 280,
            },
            {
                title: trans('configuration:areaRoom.floorNum'),
                dataIndex: 'floor',
                key: 'floor',
                width: 50,
            },
            {
                title: trans('configuration:inService'),
                dataIndex: 'inService',
                key: 'inService',
                width: 80,
                render: (dataCell, dataRow) => this.renderColumnCheckbox(dataCell, dataRow)
            },
            {
                title: <SettingOutlined/>,
                dataIndex: 'action',
                key: 'action',
                width: 70,
                render: (review, record, index) => this.renderActionColumn(review, record, index)
            }
        ];
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
                                // classNameCustom="checklist-report"
                                title={trans("configuration:areaRoom.title")}
                                breadcrumbList={[trans("configuration:areaRoom.configuration"), trans("configuration:areaRoom.areaRoom")]}
                                buttons={[
                                    {
                                        title: trans("configuration:areaRoom.printQR"),
                                        classNameCustom: 'submit',
                                        action: () => this.onOpenDialogPrintQR
                                    },
                                    {
                                        title: trans("common:button.import"),
                                        classNameCustom: 'submit',
                                        action: () => this.onOpenDialogImport
                                    },
                                    {
                                        title: trans("common:button.create"),
                                        classNameCustom: 'submit',
                                        action: () => this.handleCreate
                                    }
                                ]}
                            />
                        </Col>
                        <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "10px" }}>
                            <div className="daily-checklist-container border-form padding-pannel">
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
                                            onClick={() => { this.loadForm() }}
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
                                                y: 340,
                                            }}
                                        />

                                        <div className="page-div">
                                            <Pagination
                                                showSizeChanger
                                                onShowSizeChange={this.onShowSizeChange}
                                                showTotal={(total, range) => { return (<span>{range[0]} - {range[1]} {trans('common:of')} {total} {trans('common:items')}</span>) }}
                                                onChange={this.onPageChange}
                                                defaultCurrent={1}
                                                total={this.state.filter.paging.rowsCount}
                                                current={this.state.filter.paging.currentPage}
                                                pageSizeOptions={['1', '10', '20', '30', '40']}
                                                defaultPageSize={15}
                                                pageSize={this.state.filter.paging.pageSize}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </Col>
                    </Row>

                </div>
            </>
        );
    }

};

export default withTranslation(['configuration', 'common'])(AreaRoomConfig);
