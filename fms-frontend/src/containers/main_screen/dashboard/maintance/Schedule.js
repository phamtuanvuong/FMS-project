import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../layout/Home.css';
import '../../../../layout/MyTrouble.css';
import '../../../../layout/Common.css';
import {
    Dropdown, Button, message, Space, DatePicker, Table, Image
} from 'antd';
import 'antd/dist/antd.min.css';
import { DownOutlined } from '@ant-design/icons';
import HeaderPannel from '../../../../components/HeaderPannel';
import { ACTION, STATUS, MESSAGE  } from '../../../../constants/Constants';
import { Link } from 'react-router-dom';
import { MyTroubleService } from '../../../../services/main_screen/trouble/MyTroubleService';
import shareIcon from '../../../../assets/share-icon.png';
import SelectCustom from '../../../../components/SelectCustom';
import moment from "moment";
import {
    onChangeSelectBox,
    onChangeValue
} from '../../../../components/CommonFunction';
import { formatDateDataTable } from '../../../../components/CommonFunction';
import SchedulePopupCreate from './SchedulePopupCreate';
import { showDialog, hideDialog } from '../../../../components/Dialog';

class Schedule extends Component {
    constructor(props) {
        super(props);
        this.state = {
            resolved: [
                'Resolved',
                'None',
            ],
            columnTroubleReport: this.columnTroubleReport,
            dataTableTroubleReport: this.dataTableTroubleReport,
            data: {},
            campus: [
                {
                    id: 1,
                    name: 'Student'
                },
                {
                    id: 2,
                    name: 'Student1'
                }            
            ]
        };
        this.service = new MyTroubleService();
    }

    componentDidMount() {
        // this.loadForm();
    }

    loadForm = async () => {
        const res = await this.service.loadTrouble();
        console.log(res);
    }

    columnTroubleReport = [
        {
            title: '#',
            dataIndex: 'index',
            key: 'index',
            width: 40,
            render: function (text, record, index) {
                return <div>
                    {index}
                </div>
            }
        },
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location',
            width: 150,
        },
        {
            title: 'Area',
            dataIndex: 'area',
            key: 'area',
            width: 150,
        },
        {
            title: 'From Date',
            dataIndex: 'fromDate',
            key: 'fromDate',
            width: 150,
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            width: 150,
        },
        {
            title: 'System',
            dataIndex: 'system',
            key: 'system',
            width: 150,
        },
        {
            title: 'Template',
            dataIndex: 'template',
            key: 'template',
            width: 150,
        },
        {
            title: 'Perform by',
            dataIndex: 'performBy',
            key: 'performBy',
            width: 150,
        },
        {
            title: 'From Date',
            dataIndex: 'fromDate',
            key: 'fromDate',
            width: 250,
            render: (dataCell) => formatDateDataTable(dataCell)
        },
        {
            title: 'End Date',
            dataIndex: 'endDate',
            key: 'endDate',
            width: 250,
            render: (dataCell) => formatDateDataTable(dataCell)
        },
        {
            title: 'Technicians',
            dataIndex: 'performBy',
            key: 'performBy',
            width: 150,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            className: 'columnStatus',
            render: function (review, record) {
                let backgroundColor = review === 'Done' ? '#BBF1CB' : '#FFC4CD';
                if (record.status === 'Openning') backgroundColor = 'white';
                return <div style={{ backgroundColor, textAlign: 'center', padding: '21px' }}>
                    {review}
                </div>
            }
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            width: 100,
            render: (review, record, index) => this.renderActionColumn(review, record)
        },
        {
            title: 'Note',
            dataIndex: 'note',
            key: 'note',
            width: 150
        }
    ];

    dataTableTroubleReport = [
        {
            id: 1,
            location: 'Vuong',
            review: '22',
            note: 'hải bối',
            status: 'Openning',
            technician: 'Vuongpthe14035',
            checklistType: 'Daily'
        },
        {
            id: 2,
            location: 'Vuong',
            review: '22',
            note: 'hải bối',
            status: 'Cancel',
            technician: 'Vuongpthe14035',
            checklistType: 'Weekly'
        },
        {
            id: 3,
            location: 'Vuong',
            review: '22',
            note: 'hải bối',
            status: 'Done',
            technician: 'Vuongpthe14035'
        }
    ];

    renderActionColumn(review, data) {
        return <div style={{ textAlign: 'center', justifyContent: 'space-around', display: 'flex' }}>
            <div style={{ textAlign: 'center', cursor: 'pointer' }}
            // onClick={() => this.onClickAction(data, ACTION.DETAIL)}
            >
                {
                    data.checklistType === 'Daily' ? <Link to={{
                        pathname: '/checklistDetail/' + data?.id,
                    }}>
                        <img src="../../../../assets/icons8-pencil-24.png" alt="" width="20px" />
                    </Link> : <Link to={{
                        pathname: '/checklistsWeekly/' + data?.id,
                    }}>
                        <img src="../../../../assets/icons8-pencil-24.png" alt="" width="20px" />
                    </Link>
                }

            </div>
            <div style={{ textAlign: 'center', cursor: 'pointer' }}
                onClick={() => this.onClickAction(data, ACTION.DELETE)}
            >
                <img src="../../../../assets/icons8-garbage-66.png" alt="" width="20px" />
            </div>
            {/* {
                data.status === 'Openning' ? <div style={{ textAlign: 'center', cursor: 'pointer' }}
                    onClick={() => this.onClickAction(data, ACTION.FORWARD)}
                >
                    <Image
                        src={shareIcon}
                        preview={false}
                        width={20}
                    ></Image>
                </div> : ''
            } */}
        </div>;
    }

    onClickAction = (data, action) => {
        if (action === ACTION.DETAIL) {
        }
    }

    renderTechnicianColumn(review, record) {
        if (record.status === 'Openning') {
            return (
                <SelectCustom
                    id="technician"
                    onChange={(e, value) => onChangeSelectBox(this, 'technician', value)}
                    // defaultValue="Student1212"
                    placeholder='Select Status'
                    value={this.state.data.technician}
                    options={this.state.campus}
                >
                </SelectCustom>
            )
        } else {
            return (
                <div>
                    {review}
                </div>
            )
        }
    }

    onChangeAssetStatus = (checkedValues) => {
        console.log('checked = ', checkedValues);
    };

    onChangeIssueImage = (data) => {
        console.log('data = ', data);
    }

    onClickRow = (data, index) => {
        console.log('data = ', data);
        console.log('index = ', index);
    }

    disabledFromDate = (current) => {
        // Can not select days before today and today
        // console.log('data = ', current);
        if (this.state.data.toDate) {
            return moment(current, 'DD/MM/YYYY') >= moment(this.state.data.toDate, 'DD/MM/YYYY');
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

    onSearch = () => {
        console.log(this.state.data);
    }

    handleCreate = () => {
        this.onOpenModalCreate(ACTION.CREATE, {});
    }

    onOpenModalCreate = (action, data) => {
        showDialog(
            this.getScheduleForm(action, data),
            action === ACTION.CREATE ? "Create Schedule" : "Update Schedule",
        )
    }

    getScheduleForm = (action, data) => {
        let campus = [...this.state.campus];
        // campus.shift();
        console.log(campus);
        return (
            <SchedulePopupCreate
                options={{
                    action,
                    data: { ...data },
                    dataNew: data,
                    campus,
                    onComplete: async (rowData) => {
                        console.log(rowData);
                        const res = await this.service.saveUser(rowData);
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
                                classNameCustom="my-maintenance"
                                title="Maintenance Schedule"
                                breadcrumbList={["Maintenance", "Maintenance Schedule", "FU-HL"]}
                                buttons={[
                                    {
                                        title: 'Create',
                                        classNameCustom: 'submit',
                                        action: () => this.handleCreate
                                    },
                                ]}
                            />
                        </Col>
                        <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "10px" }}>
                            <div className="daily-checklist-container border-form padding-pannel">
                                <Row >
                                    <Col xs={12} sm={12} md={6} lg={4} xl={2}>
                                        <div className="location-search-title">
                                            Category
                                        </div>
                                        <div className="location-search-combobox">
                                            <SelectCustom
                                                id="category"
                                                onChange={(e, value) => onChangeSelectBox(this, 'category', value)}
                                                placeholder='All'
                                                // defaultValue=""
                                                value={this.state.data.category}
                                                options={this.state.campus}
                                            >
                                            </SelectCustom>
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={6} lg={4} xl={3}>
                                        <div className="system-search-title">
                                            System
                                        </div>
                                        <div className="system-search-combobox">
                                            <SelectCustom
                                                id="system"
                                                onChange={(e, value) => onChangeSelectBox(this, 'system', value)}
                                                // defaultValue="Student1212"
                                                placeholder='All'
                                                value={this.state.data.system}
                                                options={this.state.campus}
                                            >
                                            </SelectCustom>
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={6} lg={4} xl={2}>
                                        <div className="location-search-title">
                                            Location
                                        </div>
                                        <div className="location-search-combobox">
                                            <SelectCustom
                                                id="location"
                                                onChange={(e, value) => onChangeSelectBox(this, 'location', value)}
                                                // defaultValue="Student1212"
                                                placeholder='All'
                                                value={this.state.data.location}
                                                options={this.state.campus}
                                            >
                                            </SelectCustom>
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={6} lg={4} xl={2}>
                                        <div className="area-search-title">
                                            Area
                                        </div>
                                        <div className="area-search-combobox">
                                            <SelectCustom
                                                id="area"
                                                onChange={(e, value) => onChangeSelectBox(this, 'area', value)}
                                                // defaultValue="Student1212"
                                                placeholder='All'
                                                value={this.state.data.area}
                                                options={this.state.campus}
                                            >
                                            </SelectCustom>
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={8} xl={3} className={'col-search-button'}>
                                        <div className="button-submit button" onClick={this.onSearch}>
                                            Search
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginTop: "15px" }}>
                                        <Table
                                            columns={this.state.columnTroubleReport}
                                            dataSource={this.state.dataTableTroubleReport}
                                            pagination={{
                                                pageSize: 10,
                                            }}
                                            scroll={{
                                                y: 240,
                                            }}
                                            onRow={(record, rowIndex) => {
                                                return {
                                                    onClick: e => this.onClickRow(record, rowIndex)
                                                }
                                            }}
                                            size="middle"
                                        />
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

export default Schedule;
