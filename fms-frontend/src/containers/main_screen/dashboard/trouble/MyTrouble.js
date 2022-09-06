import React, { Component } from 'react';
import { Col, Label, Row } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../layout/Home.css';
import '../../../../layout/MyTrouble.css';
import '../../../../layout/Common.css';
import {
    DatePicker, Table, Image, Select, Button, Pagination, Tooltip, Tag
} from 'antd';
import 'antd/dist/antd.min.css';
import HeaderPannel from '../../../../components/HeaderPannel';
import { Link } from 'react-router-dom';
import { MyTroubleService } from '../../../../services/main_screen/trouble/MyTroubleService';
import shareIcon from '../../../../assets/send.png';
import removeIcon from '../../../../assets/bin.png';
import cancelIcon from '../../../../assets/multiply.png';
import editIcon from '../../../../assets/edit.png';
import viewIcon from '../../../../assets/view.png';
import SelectCustom from '../../../../components/SelectCustom';
import moment from "moment";
import { WorkflowService } from '../../../../services/main_screen/configuration/WorkflowService';
import { AreaRoomService } from '../../../../services/main_screen/configuration/AreaRoomService';
import { Notification } from '../../../../components/Notification';
import { LocationService } from '../../../../services/main_screen/configuration/LocationService';
import AppContext from '../../../../context/AppContext';
import { formatDateDataTable, handleHideNav, trans } from '../../../../components/CommonFunction';
import { UserService } from '../../../../services/main_screen/configuration/UserService';
import { showConfirm, hideDialogConfirm } from '../../../../components/MessageBox';
import { ACTION, MESSAGE, STATUS } from '../../../../constants/Constants';
import { withTranslation } from 'react-i18next';
import { SettingOutlined } from '@ant-design/icons';

class MyTrouble extends Component {
    constructor(props) {
        super(props);
        this.state = {
            resolved: [
                'Resolved',
                'None',
            ],
            //data: {},
            workflows: [],
            location: [],
            area: [],

            filter: {
                paging: {
                    pageSize: 10,
                    currentPage: 1,
                    rowsCount: 0
                },
                fromDate: null,
                toDate: null,
                // workflowId: 2,
                locationCode: null,
                roomCode: null,
                roleID: 0,
                campus: null,
                user: ""
            },
            areaFilter: {
                paging: { pageSize: 9999, currentPage: 1, rowsCount: 0 }
            },
            userInfo: JSON.parse(localStorage.getItem('cont')),
            data: [],
            technician: [],
            exportFilter: {},
            counter: {
                open: 0, process: 0, done: 0, total: 0, cancel: 0, upwork: 0
            },
        };
        this.service = new MyTroubleService();
        this.WorkflowService = new WorkflowService();
        this.AreaRoomService = new AreaRoomService();
        this.Notification = new Notification();
        this.LocationService = new LocationService();
        this.UserService = new UserService();
    }

    componentDidMount() {
        document.querySelector('.container').addEventListener('click', handleHideNav);
        let filter = { ...this.state.filter };
        let role = this.state.userInfo?.userInfo?.role;
        if (role !== null) {
            if (role === 3 || role === 2) {
                filter.workflowId = 2
            } else if (role === 4) {
                filter.workflowId = 3
            }
        }
        this.setState({ filter: filter });
        setTimeout(() => { this.loadData() }, 200);

    }

    loadData = async () => {
        await this.loadWorkflow();
        await this.loadLocationData();
        await this.loadAreaData();
        await this.loadTechnicians();
        await this.loadForm();
        await this.loadCounter();
    }

    loadForm = async () => {
        let filter = { ...this.state.filter };
        let user = { ...this.state.userInfo };

        filter.roleID = user.userInfo.role;
        filter.campus = user.userInfo.campus.name;
        filter.user = user.userInfo.username;
        let res = await this.service.getList(filter);
        if (res && res?.status === 200 && res.data) {
            filter.paging = res.data?.paging;
            if (filter.paging.currentPage !== 1 && (filter.paging.currentPage * filter.paging.pageSize - 10) >= filter.paging.rowsCount) {
                filter.paging.currentPage = 1;
                await this.setState({ filter });
                this.loadForm();
            }
            this.setState({ data: res.data?.listData, filter: filter, exportFilter: filter });
        } else {
            this.Notification.error(MESSAGE.ERROR);
        }
    }

    loadLocationData = async () => {
        this.LocationService.getAll().then(res => {
            if (res && res.status === 200 && res.data) {
                this.setState({ location: res.data?.listData });
            }
        })
    }

    loadAreaData = async () => {
        let filter = { ...this.state.areaFilter };
        await this.AreaRoomService.getListAreaRoom(filter).then(res => {
            if (res && res.status === 200 && res.data) {
                this.setState({ area: res.data?.listData });
            }
        })
    }

    loadWorkflow = async () => {
        await this.WorkflowService.getByType("Trouble").then(res => {
            if (res && res.status === 200 && res.data?.listData) {
                this.setState({
                    workflows: res.data?.listData
                });
            }
        })
    }

    loadTechnicians = async () => {
        await this.UserService.getByRole("Technician").then(res => {
            if (res && res.status === 200 && res.data?.listData) {
                let technician = res.data?.listData.filter(item => item.isActive !== false);
                this.setState({
                    technician: technician
                });
            }
        })
    }

    loadCounter = async () => {
        let userInfo = { ...this.state.userInfo};
        let counter = { ...this.state.counter };
        if (userInfo) {
            await this.service.count({
                paging: {
                    rowsCount: 0
                },
                roleID: userInfo?.userInfo?.role,
                campus: userInfo?.userInfo?.campus?.name,
                user: userInfo?.userInfo?.username
            }).then(res => {
                if (res && res.status === 200) {
                    if (res.data?.listData) {
                        for (var item of res.data?.listData) {
                            switch (item.stepName) {
                                case 'Opening':
                                    counter.open = item.quantity;
                                    break;
                                case 'Processing':
                                    counter.process = item.quantity;
                                    break;
                                case 'Done':
                                    counter.done = item.quantity;
                                    break;
                                case 'Cancel':
                                    counter.cancel = item.quantity;
                                    break;
                                case 'Up Work':
                                    counter.upwork = item.quantity;
                                    break;

                            }
                        }
                    }
                    counter.total = res?.data?.paging?.rowsCount;
                    this.setState({
                        counter: counter
                    });
                }
            });
        }
    }

    renderActionColumn(data, index) {
        return (
            <>
                <div style={{ textAlign: 'left', justifyContent: 'space-around', display: 'flex' }}>
                    {
                        data.status !== 'Cancel' ?
                            this.state.userInfo.userInfo.role === 1 ?
                                <>
                                    <Link to={data.status === 'Draft' ? '/updateTrouble/' + data?.reportID : '/detailTrouble/' + data?.reportID}
                                        data={data}
                                    >
                                        <Button type="link" style={{ padding: 0 }}
                                            title={data.status !== 'Draft' ? 'View' : 'Edit'}
                                        >
                                            <Image src={data.status !== 'Draft' && data.status !== 'Opening' ? viewIcon : editIcon} preview={false} width={20} ></Image>
                                        </Button>
                                    </Link>
                                    {
                                        data.status === 'Draft' ?
                                            <Button type="link" style={{ padding: 0 }}
                                                title="Delete report"
                                                onClick={() => this._openDeletePopConfirm(data)}
                                            >
                                                <Image src={removeIcon} preview={false} width={20} ></Image>
                                            </Button> : null
                                    }
                                </>
                                :
                                <>
                                    <Link to={data.status === 'Draft' ? '/updateTrouble/' + data?.reportID : '/detailTrouble/' + data?.reportID}
                                        data={data}
                                    >
                                        <Button type="link" style={{ padding: 0 }}
                                            title={data.status === 'Done' ? 'View' : 'Edit'}
                                        >
                                            <Image src={data.status === 'Done' ? viewIcon : editIcon} preview={false} width={20} ></Image>
                                        </Button>
                                    </Link>
                                    {
                                        data.status === 'Opening'
                                            && (this.state.userInfo.userInfo.role === 3 || this.state.userInfo.userInfo.role === 2)
                                            ?
                                            <>
                                                {/* <Divider type='vertical' /> */}
                                                <Button type="link" style={{ padding: 0 }}
                                                    title="Assign technician"
                                                    onClick={() => this._openAssignPopConfirm(data, index)}
                                                >
                                                    <Image src={shareIcon} preview={false} width={20} ></Image>
                                                </Button>
                                            </>
                                            :
                                            null
                                    }
                                    {
                                        data.status === "Opening"
                                            ?
                                            <>
                                                {/* <Divider type='vertical' /> */}

                                                <Button type="link" style={{ padding: 0 }}
                                                    title="Cancel report"
                                                    onClick={() => this._openCancelPopConfirm(data)}
                                                >
                                                    <Image src={cancelIcon} preview={false} width={20} ></Image>

                                                </Button>
                                            </>
                                            : null
                                    }
                                    {
                                        data.status === 'Draft' ?
                                            <Button type="link" style={{ padding: 0 }}
                                                title="Delete report"
                                                onClick={() => this._openDeletePopConfirm(data)}
                                            >
                                                <Image src={removeIcon} preview={false} width={20} ></Image>
                                            </Button> : null
                                    }
                                </>
                            :
                            <Button type="link" style={{ padding: 0 }}
                                title="Delete report"
                                onClick={() => this._openDeletePopConfirm(data)}
                            >
                                <Image src={removeIcon} preview={false} width={20} ></Image>
                            </Button>
                    }



                </div>
            </>
        );
    }

    _openAssignPopConfirm = (data, index) => {
        if (data.technician === null || data.technician === '') {
            this.Notification.error("Hãy chọn một kỹ thuật viên/ Please choose a technician!");

        }
        else {
            showConfirm
                (
                    trans('trouble:myTrouble.notiForwardTech'),
                    () => this.onAssignTechnician(data),
                    trans('common:noty.title')
                )
        }
    }

    _openCancelPopConfirm = (data) => {
        showConfirm
            (
                trans('trouble:myTrouble.notiCancel'),
                () => this.onCancelReport(data?.reportID),
                "Warning"
            );
    }

    onCancelReport = async (reportID) => {
        // data.createdBy = 'admin';
        await this.service.cancelReport(reportID).then(res => {
            if (res?.status === 200) {
                hideDialogConfirm();
                this.Notification.success("Cancel report successfully.");
                setTimeout(() => {
                    this.loadForm();
                }, 200);

            }
            else {
                hideDialogConfirm();
                this.Notification.error(res?.data?.message);
            }
        })
    }

    onAssignTechnician = async (data) => {
        data.createdBy = this.state.userInfo?.userInfo?.username;
        await this.service.changeTechnician(data).then(res => {
            if (res.status === 200) {
                hideDialogConfirm();
                this.Notification.success("Lưu kỹ thuật viên thành công/ Change technician successfully.");
                setTimeout(() => {
                    this.loadForm();
                }, 200);

            }
            else {
                hideDialogConfirm();
                this.Notification.error(res.data.message);
            }
        })
    }

    _openDeletePopConfirm = (data) => {
        showConfirm
            (
                "Are you sure delete this report?",
                () => this.onDeleteReport(data?.reportID),
                "Warning"
            );
    }

    onDeleteReport = async (reportID) => {
        // data.createdBy = 'admin';
        await this.service.deleteReport(reportID).then(res => {
            if (res?.status === 200) {
                hideDialogConfirm();
                this.Notification.success("Delete report successfully.");
                setTimeout(() => {
                    this.loadForm();
                }, 200);

            }
            else {
                hideDialogConfirm();
                this.Notification.error(res?.data?.message);
            }
        })
    }

    disabledFromDate = (current) => {
        // Can not select days before today and today
        // console.log('data = ', current);
        if (this.state.filter.toDate) {
            return moment(current, 'DD/MM/YYYY') > moment(this.state.filter.toDate, 'YYYY-MM-DD').endOf('day');
        }
        return '';
    };

    disabledToDate = (current) => {
        // Can not select days before today and today
        // console.log('data = ', current);
        if (this.state.filter.fromDate) {
            return moment(current, 'DD/MM/YYYY') < moment(this.state.filter.fromDate, 'YYYY-MM-DD');
        }
        return '';
    };

    onChangeFilter(name, value) {
        let filter = { ...this.state.filter };
        filter[name] = value;
        this.setState({ filter: filter });
    }

    onChangeDateFilter(name, value) {
        let filter = { ...this.state.filter };
        filter[name] = value ? moment(value, 'DD/MM/YYYY').format('YYYY-MM-DD') : null;
        this.setState({ filter: filter });
    }

    onSelectLocationChange = async (value) => {
        let data = { ...this.state.filter };
        let filter = { ...this.state.areaFilter };
        console.log(value);
        data.locationCode = value;
        data.roomCode = null;
        filter.locationCode = value;

        await this.setState({
            filter: data,
            areaFilter: filter,
        });
        this.loadAreaData();
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


    onPageChange = async (page, pageSize) => {
        let filter = { ...this.state.filter };
        filter.paging.currentPage = page;
        await this.setState({ filter: filter });
        this.loadForm(page);

    };

    onExport = async () => {
        let filter = { ...this.state.exportFilter };
        var filename = 'ListTroubles.xlsx';
        await this.service.exportTrouble(filter).then(res => {
            if (res) {
                const downloadUrl = window.URL.createObjectURL(res.data);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.remove();
            }
        });
    }

    render() {
        const columnTroubleReport = [
            {
                title: '#',
                dataIndex: 'index',
                key: 'index',
                width: 40,
                render: function (text, record, index) {
                    return <div>
                        {++index}
                    </div>
                }
            },
            {
                title: trans('trouble:myTrouble.roomArea'),
                dataIndex: 'areaName',
                key: 'areaName',
                width: 120
            },
            {
                title: trans('trouble:myTrouble.createdDate'),
                dataIndex: 'createDate',
                key: 'createDate',
                width: 110,
                render: (dataCell) => formatDateDataTable(dataCell)
            },
            {
                title: trans('trouble:myTrouble.priority'),
                dataIndex: 'priority',
                key: 'priority',
                width: 110,
                // className: 'columnStatus',
                render: (value, data) => {
                    var piority = '';
                    var backgroundColor = 'white';
                    var color = 'black';
                    switch (value) {
                        case 1:
                            piority = 'Low';
                            backgroundColor = '#C6EFCE';
                            color = '#177A56';

                            break;
                        case 2:
                            piority = 'Medium';
                            backgroundColor = '#FFEB9C';
                            color = '#C08024';
                            break;
                        case 3:
                            piority = 'High'
                            backgroundColor = '#FFC7CE';
                            color = '#F12023'
                            break;
                        default:
                            piority = '';
                    }
                    return (
                        <>
                            {
                                data.sla > 24 ?
                                    <Tag color={'geekblue'}>
                                        {'Over 24 hours'}
                                    </Tag> : ''
                            }
                            {
                                piority ?
                                    <Tag color={color}>
                                        {piority}
                                    </Tag> : ''
                            }
                        </>
                    )
                }
            },
            {
                title: trans('trouble:myTrouble.category'),
                dataIndex: 'categoryName',
                width: 120,
                key: 'categoryName'
            },
            {
                title: trans('trouble:myTrouble.summary'),
                dataIndex: 'summary',
                key: 'summary',
                width: 150,
                ellipsis: {
                    showTitle: false,
                },
                render: (dataCell) => (
                    <Tooltip placement="topLeft" title={dataCell}>
                        {dataCell}
                    </Tooltip>
                )
            },
            {
                title: trans('trouble:myTrouble.description'),
                dataIndex: 'description',
                key: 'description',
                width: 150,
                ellipsis: {
                    showTitle: false,
                },
                render: (dataCell) => (
                    <Tooltip placement="topLeft" title={dataCell}>
                        {dataCell}
                    </Tooltip>
                )
            },
            {
                title: trans('trouble:myTrouble.reporter'),
                dataIndex: 'reporter',
                key: 'reporter',
                width: 150,
            },
            {
                title: trans('trouble:myTrouble.status'),
                dataIndex: 'status',
                key: 'status',
                width: 100,
                // className: 'columnStatus',
                render: (value) => {
                    let color = '';
                    switch (value) {
                        case 'Done':
                            color = '#177A56';
                            break;
                        case 'Opening':
                            color = '#C62DDF';
                            break;
                        case 'Processing':
                            color = '#15D1FA';
                            break;
                        case 'Cancel':
                            color = '#BA1C30';
                            break;
                        default:
                            color = 'grey';
                    }
                    return <Tag color={color} style={{ textAlign: 'center' }}>
                        {value}
                    </Tag>
                }
            },
            {
                title: trans('trouble:myTrouble.technician'),
                dataIndex: 'technician',
                key: 'technician',
                width: 180,
                render: (review, record, index) => {
                    return (
                        (record.status === 'Opening'
                            && (this.state.userInfo.userInfo.role === 2 || this.state.userInfo.userInfo.role === 3)) ?
                            <>
                                <Select
                                    showSearch
                                    mode={"combobox"}
                                    onChange={(value, e) => {
                                        let data = [...this.state.data];
                                        data[index].technician = value;
                                        this.setState({ data: data });
                                    }}
                                    value={review}
                                    placeholder={trans('trouble:myTrouble.selectTech')}
                                    style={{ width: '100%' }}
                                    allowClear
                                >
                                    {
                                        this.state.technician ? this.state.technician.map((item, index) => {
                                            return <Select.Option key={index} value={item.userName}> {item.userName}</Select.Option>
                                        })
                                            : null
                                    }
                                </Select>

                            </>
                            :
                            <Label>{review}</Label>
                    )
                }
            },
            {
                title: trans('trouble:myTrouble.issueReview'),
                dataIndex: 'issueReview',
                key: 'issueReview',
                width: 150,
                ellipsis: {
                    showTitle: false,
                },
                render: (dataCell) => (
                    <Tooltip placement="topLeft" title={dataCell}>
                        {dataCell}
                    </Tooltip>
                )
            },
            {
                title: trans('trouble:myTrouble.solution'),
                dataIndex: 'solution',
                key: 'solution',
                width: 150,
                ellipsis: {
                    showTitle: false,
                },
                render: (dataCell) => (
                    <Tooltip placement="topLeft" title={dataCell}>
                        {dataCell}
                    </Tooltip>
                )
            },
            {
                title: <SettingOutlined />,
                dataIndex: 'action',
                key: 'action',
                width: 150,
                render: (review, record, index) => this.renderActionColumn(record, index)
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
                                classNameCustom="checklist-report"
                                title={trans('trouble:myTrouble.title')}
                                breadcrumbList={[trans('trouble:myTrouble.trouble'), trans('trouble:myTrouble.title')]}
                            />
                        </Col>
                        <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "10px" }}>
                            <div className="daily-checklist-container border-form padding-pannel">
                                <Row >
                                    <Col xs={12} sm={12} md={6} lg={4} xl={2} className="col-xl-2-custom">
                                        <div className="location-search-title">
                                            {trans('trouble:myTrouble.status')}
                                        </div>
                                        <div className="location-search-combobox">
                                            <SelectCustom
                                                onChange={(value) => this.onChangeFilter("workflowId", value)}
                                                // defaultValue="Opening"
                                                placeholder='Select Status'
                                                value={this.state.filter.workflowId}
                                                options={this.state.workflows}
                                                clear={true}
                                                keyValue="id"
                                                lable="stepName"
                                            />
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={6} lg={4} xl={2} className="col-xl-2-custom">
                                        <div className="location-search-title">
                                            {trans('trouble:myTrouble.location')}
                                        </div>
                                        <div className="location-search-combobox">
                                            <SelectCustom
                                                onChange={(e) => this.onSelectLocationChange(e)}
                                                // defaultValue="Student1212"
                                                placeholder='Select Location'
                                                value={this.state.filter.locationCode}
                                                options={this.state.location}
                                                clear={true}
                                                keyValue="code"
                                                lable="code"
                                            />
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={6} lg={4} xl={2} className="col-xl-2-custom">
                                        <div className="location-search-title">
                                            {trans('trouble:myTrouble.roomArea')}
                                        </div>
                                        <div className="location-search-combobox">
                                            <SelectCustom
                                                id="roomCode"
                                                onChange={(e, value) => this.onChangeFilter('roomCode', e)}
                                                // defaultValue="Student1212"
                                                placeholder='Select Room/ Area'
                                                value={this.state.filter.roomCode}
                                                options={this.state.area}
                                                keyValue={"name"}
                                                clear={true}
                                            >
                                            </SelectCustom>
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={6} lg={4} xl={2} className="col-xl-2-custom">
                                        <div className="location-search-title">
                                            {trans('trouble:myTrouble.from')}
                                        </div>
                                        <div className="location-search-combobox">
                                            <DatePicker
                                                disabledDate={this.disabledFromDate}
                                                onChange={(e, timeString) =>
                                                    this.onChangeDateFilter('fromDate', timeString)}
                                                format='DD/MM/YYYY'
                                            />
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={6} lg={4} xl={2} className="col-xl-2-custom">
                                        <div className="location-search-title">
                                            {trans('trouble:myTrouble.to')}
                                        </div>
                                        <div className="location-search-combobox">
                                            <DatePicker
                                                disabledDate={this.disabledToDate}
                                                onChange={(e, timeString) =>
                                                    this.onChangeDateFilter('toDate', timeString)}
                                                format='DD/MM/YYYY'
                                            />
                                        </div>
                                    </Col>

                                    <Col xs={12} sm={12} md={6} lg={4} xl={2} className="col-search" style={{
                                        marginTop: '19px',
                                        display: 'flex',
                                        justifyContent: 'flex-end'
                                    }}>
                                        <Button
                                            className="button-submit button"
                                            onClick={() => { this.loadForm() }}
                                        >
                                            {trans('common:search')}
                                        </Button>
                                        <Button
                                            className="button-submit button daily-checklist-searchbtn"
                                            onClick={() => { this.onExport() }}
                                        >
                                            {trans('common:export')}
                                        </Button>
                                    </Col>
                                   
                                    <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginTop: "15px" }}>
                                        <Table
                                            columns={columnTroubleReport}
                                            dataSource={this.state.data}
                                            pagination={false}
                                            size="middle"
                                            scroll={{
                                                y: 490,
                                                // x: 1500,
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

                                    <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                        <Row className="row-process">
                                            <Col xs={12} sm={3} md={3} lg={3} xl={2} className="col-process">
                                                <div className="infor-process-opening infor-process">
                                                    <div className="opening-title">
                                                        {trans('home:opening')}
                                                    </div>
                                                    <div className="opening-counter counter">
                                                        {this.state.counter.open}
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col xs={12} sm={3} md={3} lg={3} xl={2} className="col-process">
                                                <div className="infor-process-processing infor-process">
                                                    <div className="processing-title">
                                                        {trans('home:processing')}
                                                    </div>
                                                    <div className="processing-counter counter">
                                                        {this.state.counter.process}
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col xs={12} sm={3} md={3} lg={3} xl={2} className="col-process">
                                                <div className="infor-process-upwork infor-process">
                                                    <div className="processing-title">
                                                        {trans('home:upwork')}
                                                    </div>
                                                    <div className="processing-counter counter">
                                                        {this.state.counter.upwork}
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col xs={12} sm={3} md={3} lg={3} xl={2} className="col-process">
                                                <div className="infor-process-done infor-process">
                                                    <div className="done-title">
                                                        {trans('home:done')}
                                                    </div>
                                                    <div className="done-counter counter">
                                                        {this.state.counter.done}
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col xs={12} sm={3} md={3} lg={3} xl={2} className="col-process">
                                                <div className="infor-process-cancel infor-process">
                                                    <div className="done-title">
                                                        {trans('home:cancel')}
                                                    </div>
                                                    <div className="done-counter counter">
                                                        {this.state.counter.cancel}
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col xs={12} sm={3} md={3} lg={3} xl={2} className="col-process">
                                                <div className="infor-process-all infor-process">
                                                    <div className="all-title">
                                                        {trans('home:all')}
                                                    </div>
                                                    <div className="all-counter counter">
                                                        {this.state.counter.total}
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
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

MyTrouble.contextType = AppContext;

export default withTranslation(['trouble', 'common'])(MyTrouble);
