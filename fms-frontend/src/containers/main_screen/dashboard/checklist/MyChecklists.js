import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../layout/Home.css';
import '../../../../layout/MyTrouble.css';
import '../../../../layout/Common.css';
import {
    DatePicker, Table, Image, Pagination, Button, Tag
} from 'antd';
import 'antd/dist/antd.min.css';
import HeaderPannel from '../../../../components/HeaderPannel';
import { ACTION, MESSAGE, STATUS } from '../../../../constants/Constants';
import { Link, Navigate } from 'react-router-dom';
import SelectCustom from '../../../../components/SelectCustom';
import moment from "moment";
import {
    formatDateDataTable,
    onChangeSelectBox,
    handleHideNav,
    trans
} from '../../../../components/CommonFunction';
import CreatePopup from './CreatePopup';
import { hideDialog, showDialog } from '../../../../components/Dialog';
import { ChecklistService } from '../../../../services/main_screen/checklist/ChecklistService';
import removeIcon from '../../../../assets/bin.png';
import editIcon from '../../../../assets/edit.png';
import overdueIcon from '../../../../assets/overdue.png';
import notstartIcon from '../../../../assets/24-hours.png';
import { LocationService } from '../../../../services/main_screen/configuration/LocationService';
import { Notification } from "../../../../components/Notification";
import { SettingOutlined } from '@ant-design/icons';
import { withTranslation } from 'react-i18next';
import { hideDialogConfirm, showConfirm } from '../../../../components/MessageBox';

const Status = [
    { id: 'OK', name: 'OK' }, { id: 'NOK', name: 'NOK' }, { id: '?', name: 'Uncheck' }
]

const ChecklistType = [{ name: 'Daily' }, { name: 'Weekly' }]

class MyChecklists extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            filter: {
                paging: {
                    currentPage: 1,
                    pageSize: 10,
                    rowsCount: 0
                },
                locationCode: null,
                campusName: null,
                checklistType: null,
                status: null,
                fromDate: null,
                toDate: null
            },
            location: [],
            userInfo: JSON.parse(localStorage.getItem('cont')),
            weekRedir: false
        };
        this.service = new ChecklistService();
        this.LocationService = new LocationService();
        this.Notification = new Notification();

    }

    componentDidMount() {
        this.loadForm();
        this.loadLocationData();
        document.querySelector('.container').addEventListener('click', handleHideNav);

    }

    loadForm = async () => {
        let filter = { ...this.state.filter };
        let user = { ...this.state.userInfo };
        filter.campus = user.userInfo.campus.name;

        let res = await this.service.getList(filter);
        if (res?.status === 200 && res.data) {
            filter.paging = res.data?.paging;
            if (filter.paging.currentPage !== 1 && (filter.paging.currentPage * filter.paging.pageSize - 10) >= filter.paging.rowsCount) {
                filter.paging.currentPage = 1;
                await this.setState({ filter });
                this.loadForm();
            }
            this.setState({ data: res.data?.listData, filter: filter });
        } else {
            this.Notification.error(MESSAGE.ERROR);
        }
    }

    loadLocationData = async () => {
        await this.LocationService.getAll().then(res => {
            if (res?.status === 200 && res.data) {
                this.setState({ location: res.data?.listData });
            }
        });
    }

    renderActionColumn(review, data) {
        var now = new Date();
        return (
            <>
                <div style={{ textAlign: 'center', justifyContent: 'space-around', display: 'flex' }}>

                    {
                        now >= moment(data.fromDate) ?
                            data.checklistType === 'Daily' ?
                                <Link to={{
                                    pathname: '/checklistDetail/' + data?.id,
                                }}>
                                    <Button type='link'>
                                        <Image src={editIcon} preview={false} width={20} />
                                    </Button>

                                </Link>
                                :
                                <Button
                                    type='link'
                                    title='Edit'
                                    onClick={() => {
                                        localStorage.setItem('weeklyParams', JSON.stringify(data));
                                        this.setState({ weekRedir: true });
                                    }}
                                >
                                    <Image src={editIcon} preview={false} width={20} />
                                </Button>
                            :
                            null
                    }
                    {
                        now >= moment(data.fromDate) && data.checklistType === 'Daily' ?
                            <>
                                <Button
                                    type='link'
                                    onClick={() => this._openDeletePopConfirm(data.id)}
                                >
                                    <Image src={removeIcon} preview={false} width={20} />
                                </Button>
                            </>
                            : null
                    }
                </div>
            </>
        );
    }

    _openDeletePopConfirm = (data) => {
        showConfirm
            (
                "Are you sure delete this checklist?",
                () => this.onDelete(data),
                "Warning"
            );
    }

    onDelete = async (checklistID) => {
        // data.createdBy = 'admin';
        await this.service.delete(checklistID).then(res => {
            if (res?.status === 200) {
                hideDialogConfirm();
                this.Notification.success("Delete checklist successfully.");
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

    handleCreate = () => {
        showDialog(
            this._openCreateDialog(),
            trans('checklist:myChecklist.createNewTile')
        );
    }

    _openCreateDialog = () => {
        return (
            <CreatePopup
                options={{
                    data: {},
                    dataNew: {},
                    action: ACTION.CREATE,
                    onComplete: async (rowData) => {
                        const res = await this.service.create(rowData);
                        // console.log(res, 'check apiiii');
                        if (res?.data?.status === STATUS.SUCCESS) {
                            hideDialog();
                            this.loadForm();
                            this.Notification.success(MESSAGE.CREATE_SUCCESS);
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
        );
    }

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

    renderIssuesColumn = (dataCell, dataRow) => {
        // console.log(dataCell?.split(';'));
        let render = null;
        if (dataCell) {
            let dataCellSplit = dataCell.split(';');
            // for (let i = 0; i < dataCellSplit.length; i++) {
            //     dataContent += 
            // }
            render = dataCellSplit.map((item, index) => {
                return <div key={index} style={{ textAlign: 'center', backgroundColor: '#BA1C30', marginBottom: '2px', color: 'white', borderRadius: '2px' }}>
                    {item.split(']')[1]?.slice(1)}
                </div>;
            })
        }
        return render;
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
                title: trans('checklist:myChecklist.location'),
                dataIndex: 'locationName',
                key: 'locationName',
                width: 140,
            },
            {
                title: trans('checklist:myChecklist.checklistType'),
                dataIndex: 'checklistType',
                key: 'checklistType',
                width: 120,
            },
            {
                title: trans('checklist:myChecklist.fromDate'),
                dataIndex: 'fromDate',
                key: 'fromDate',
                width: 100,
                render: (dataCell) => formatDateDataTable(dataCell)
            },
            {
                title: trans('checklist:myChecklist.toDate'),
                dataIndex: 'endDate',
                width: 100,
                render: (dataCell) => formatDateDataTable(dataCell)
            },
            {
                title: trans('checklist:myChecklist.checklistName'),
                dataIndex: 'checklistName',
                key: 'checklistName',
                width: 190,
            },
            {
                title: trans('checklist:myChecklist.status'),
                dataIndex: 'status',
                key: 'status',
                width: 100,
                className: 'columnStatus',
                render: function (value) {
                    var backgroundColor = 'white';
                    var color = 'black';
                    switch (value) {
                        case 'OK':
                            color = '#177A56';
                            break;
                        case '?':
                            color = '#E5BF27';
                            break;
                        case 'NOK':
                            color = '#BA1C30'
                            break;
                    }
                    return (
                        <Tag color={color} style={{ textAlign: 'center' }}>
                            {value}
                        </Tag>
                    )
                }
            },
            {
                title: trans('checklist:myChecklist.technician'),
                dataIndex: 'technician',
                key: 'technician',
                width: 150,
            },
            {
                title: trans('checklist:myChecklist.review'),
                dataIndex: 'review',
                key: 'review',
                width: 200
            },
            {
                title: trans('checklist:myChecklist.issues'),
                dataIndex: 'issues',
                key: 'issues',
                width: 290,
                render: (review, record) => this.renderIssuesColumn(review, record)
            },
            {
                title: trans('checklist:myChecklist.solution'),
                dataIndex: 'solution',
                key: 'solution',
                width: 200
            },
            {
                title: trans('checklist:myChecklist.note'),
                dataIndex: 'overdue',
                key: 'overdue',
                width: 130,
                // fixed: 'right',
                render: function (text, record) {
                    var now = new Date();
                    var txt = "";
                    var icon = null;

                    if (text == 'OVERDUE') {
                        txt = trans('checklist:myChecklist.overdue')
                        icon = <Image src={overdueIcon} preview={false} width={20}></Image>;
                    }
                    else {
                        if (now < moment(record.fromDate)) {
                            txt = trans('checklist:myChecklist.notNow');
                            icon = <Image src={notstartIcon} preview={false} width={20}></Image>;
                        }
                    }

                    return (
                        <div style={{ color: '#BA1C30', fontWeight: 'bold', textAlign: 'left' }}>
                            {icon} &nbsp; {txt}
                        </div>
                    )
                }
            },
            {
                title: <SettingOutlined />,
                dataIndex: 'action',
                key: 'action',
                width: 100,
                fixed: 'right',
                render: (review, record) => this.renderActionColumn(review, record)
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
                                title={trans('checklist:myChecklist.title')}
                                breadcrumbList={[trans('checklist:myChecklist.checklist'), trans('checklist:myChecklist.title')]}
                                buttons={[
                                    {
                                        title: trans('common:create'),
                                        classNameCustom: 'submit',
                                        action: () => this.handleCreate,
                                        disable: {...this.state.userInfo?.userInfo?.role === 1 
                                            || this.state.userInfo?.userInfo?.role === 4}
                                    }
                                ]}
                            />
                        </Col>
                        <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "10px" }}>
                            <div className="daily-checklist-container border-form padding-pannel">
                                <Row >
                                    <Col xs={12} sm={12} md={6} lg={4} xl={2} className="col-xl-2-custom">
                                        <div className="location-search-title">
                                            {trans('checklist:myChecklist.location')}
                                        </div>
                                        <div className="location-search-combobox">
                                            <SelectCustom
                                                id="location"
                                                onChange={(e, value) => this.onChangeFilter('locationCode', value?.children)}
                                                placeholder={trans('common:all')}
                                                clear={true}
                                                value={this.state.filter.locationCode}
                                                options={this.state.location}
                                                lable="code"
                                                keyValue="code"
                                            >
                                            </SelectCustom>
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={6} lg={4} xl={2} className="col-xl-2-custom">
                                        <div className="location-search-title">
                                            {trans('checklist:myChecklist.status')}
                                        </div>
                                        <div className="location-search-combobox">
                                            <SelectCustom
                                                id="status"
                                                onChange={(e, value) => this.onChangeFilter('status', value?.value)}
                                                placeholder={trans('common:all')}
                                                value={this.state.filter.status}
                                                options={Status}
                                                clear={true}
                                                keyValue="id"
                                            >
                                            </SelectCustom>
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={6} lg={4} xl={2} className="col-xl-2-custom">
                                        <div className="location-search-title">
                                            {trans('checklist:myChecklist.checklistType')}
                                        </div>
                                        <div className="location-search-combobox">
                                            <SelectCustom
                                                id="checklistType"
                                                onChange={(e, value) => this.onChangeFilter('checklistType', value?.children)}
                                                // defaultValue="Student1212"
                                                placeholder={trans('common:all')}
                                                value={this.state.filter.checklistType}
                                                options={ChecklistType}
                                                clear={true}
                                            >
                                            </SelectCustom>
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={6} lg={4} xl={2} className="col-xl-2-custom">
                                        <div className="location-search-title">
                                            {trans('checklist:myChecklist.from')}
                                        </div>
                                        <div className="location-search-combobox">
                                            <DatePicker disabledDate={this.disabledFromDate}
                                                onChange={(e, timeString) => this.onChangeDateFilter('fromDate', timeString)}
                                                format='DD/MM/YYYY'
                                            />
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={6} lg={4} xl={2} className="col-xl-2-custom">
                                        <div className="location-search-title">
                                            {trans('checklist:myChecklist.to')}
                                        </div>
                                        <div className="location-search-combobox">
                                            <DatePicker disabledDate={this.disabledToDate}
                                                onChange={(e, timeString) => this.onChangeDateFilter('toDate', timeString)}
                                                format='DD/MM/YYYY'
                                            />
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={6} lg={4} xl={2} className="col-search" style={{
                                        marginTop: '24px',
                                        display: 'flex',
                                        justifyContent: 'flex-end'

                                    }}>
                                        <Button
                                            className="button-submit button"
                                            onClick={() => { this.loadForm() }}
                                        >
                                            {trans('common:search')}
                                        </Button>
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginTop: "15px" }}>
                                        <Table
                                            columns={columnTroubleReport}
                                            dataSource={this.state.data}
                                            pagination={false}
                                            size="small"
                                            scroll={{
                                                y: 490,
                                                x: 1900,
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
                {
                    this.state.weekRedir ? <Navigate to='/checklistsWeekly'></Navigate> : null
                }
            </>
        );
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

};

export default withTranslation(['checklist', 'common'])(MyChecklists);
