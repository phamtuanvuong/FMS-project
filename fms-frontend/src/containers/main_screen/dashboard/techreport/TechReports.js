import React, { Component } from 'react';
import { Col, Row, Label } from "reactstrap";
import 'antd/dist/antd.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../layout/CreateTrouble.css';
import { Form, Collapse, Image, Input, DatePicker, Tag, Descriptions, Table, Button } from 'antd';
import HeaderPannel from '../../../../components/HeaderPannel';
import moment from 'moment';
import {
    onChangeValue,
    focusInvalidInput,
    validateEmpty,
    isUndefindOrEmptyForItemForm,
    handleHideNav,
    formatDateDataTable,
    trans
} from '../../../../components/CommonFunction';
import SelectCustom from '../../../../components/SelectCustom';
import '../../../../layout/CustomizeChecklist.css';
import addressIcon from '../../../../assets/location.png';
import { Link } from 'react-router-dom';
import '../../../../layout/Techreport.css';
import { LocationService } from '../../../../services/main_screen/configuration/LocationService';
import { AreaRoomService } from '../../../../services/main_screen/configuration/AreaRoomService';
import { TechnicalReportService } from '../../../../services/main_screen/techReport/TechnicalReportService';
import viewIcon from '../../../../assets/view.png';
import removeIcon from '../../../../assets/multiply.png';
import createIcon from '../../../../assets/create.png';
import doneIcon from '../../../../assets/checked.png';
import { Notification } from '../../../../components/Notification';
import { ACTION, MESSAGE, STATUS } from '../../../../constants/Constants';
import { withTranslation } from 'react-i18next';
import { SettingOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Panel } = Collapse;
const priority = [
    { id: 1, name: 'Low' }, { id: 2, name: 'Medium' }, { id: 3, name: 'High' }
]

class TechReports extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: {
                date: '',
                // systemRoom: '',
                // location: '',
                equipment: '',
                troubleshootingReport: [],
                totalTroubles: 0,
                checklistReport: [],
                totalChecklists: 0
            },
            errors: {},
            locations: [],
            areas: [],
            areaFilter: {
                paging: { pageSize: 9999, currentPage: 1, rowsCount: 0 }
            },
            filter: {
                paging: {
                    pageSize: 9999,
                    currentPage: 1,
                    rowsCount: 0
                },
                fromDate: null,
                toDate: null,
                locationCode: null,
                roomCode: null,
                roleID: 0,
                campus: null,
                user: ""
            },
            causes: [],
            solutions: [],
            plans: [],
            cValue: JSON.parse(localStorage.getItem('cont'))
        }
        this.LocationService = new LocationService();
        this.AreaRoomService = new AreaRoomService();
        this.service = new TechnicalReportService();
        this.Notification = new Notification();
    }

    componentDidMount() {
        document.querySelector('.container').addEventListener('click', handleHideNav);
        this.loadLocationData();
        this.loadAreaData();
    }

    loadLocationData = async () => {
        this.LocationService.getList({
            paging: { pageSize: 9999, currentPage: 1, rowsCount: 0 },
            campusName: this.state.cValue.userInfo.campus.name
        }).then(res => {
            if (res?.status === 200 && res.data) {
                this.setState({ locations: res.data?.listData });
            } else {
                this.Notification.error(MESSAGE.ERROR);
            }
        })
    }

    loadAreaData = async (value) => {
        let filter = { ...this.state.areaFilter };
        filter.locationCode = value;
        await this.AreaRoomService.getListAreaRoom(filter).then(res => {
            if (res.status === 200 && res.data) {
                this.setState({ areas: res.data?.listData });
            }
        })
    }

    loadData = async () => {
        let filter = { ...this.state.filter };
        let user = { ...this.state.cValue };

        filter.roleID = user.userInfo.role;
        filter.campus = user.userInfo.campus.name;
        filter.user = user.userInfo.username;
        await this.service.getReport(filter).then(res => {
            if (res.status === 200 && res.data) {
                this.setState({ data: res?.data?.data });
            }
            else {
                this.Notification.error(res.message);
            }
        });
    }

    onSearch = (e) => {
        e.preventDefault();
        if (!this.validate('search')) {
            return;
        }
        // xử lý sau validate
        this.setState({
            isSearch: true
        })
        this.loadData();
    }

    onExport = async (e) => {
        e.preventDefault();
        if (!this.validate('search')) {
            return;
        }
        // xử lý sau validate
        let data = { ...this.state.data };
        let user = { ...this.state.cValue };
        data.causes = [...this.state.causes];
        data.solutions = [...this.state.solutions];
        data.plans = [...this.state.plans];
        data.currentUser = user.userInfo.name;

        var filename = 'TechnicalReport.xlsx';
        await this.service.exportReport(data).then(res => {
            if (res) {
                const downloadUrl = window.URL.createObjectURL(res.data);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.remove();
            }
            else {
                this.Notification.error('Export error!')
            }
        });
    }

    disabledFromDate = (current) => {
        if (this.state.filter.toDate) {
            return moment(current, 'DD/MM/YYYY') > moment(this.state.filter.toDate, 'YYYY-MM-DD').endOf('day') || moment(current, 'DD/MM/YYYY') > moment();
        } else {
            return moment(current, 'DD/MM/YYYY') > moment();
        }
    };

    disabledToDate = (current) => {
        if (this.state.filter.fromDate) {
            return moment(current, 'DD/MM/YYYY') < moment(this.state.filter.fromDate, 'YYYY-MM-DD') || moment(current, 'DD/MM/YYYY') > moment();
        } else {
            return moment(current, 'DD/MM/YYYY') > moment();
        }
    };

    validate(type) {
        var data = type === 'search' ? { ...this.state.filter } : { ...this.state.data };

        let fieldName = [];

        if (type === 'causeAnalysis') {
            fieldName = ["causeDescription", "priority"];
        } else if (type === 'solution') {
            fieldName = ["solutionDescription"];
        } else if (type === 'repairmentPlan') {
            fieldName = ["planDescription"];
        } else if (type === 'search') {
            fieldName = ["locationCode", "fromDate", "toDate"];
        }
        const [isValid, errors] = validateEmpty(data, fieldName);
        // console.log(errors, isValid, 'check errorsss');
        if (!isValid) {
            focusInvalidInput(errors);
        }

        this.setState({
            errors
        });
        return isValid;
    }

    handleSubmit = (type) => {
        let data = { ...this.state.data };

        if (type === 'solution') {
            if (!this.validate(type)) {
                return;
            }
            //handle call api here
            let update = [...this.state.solutions];
            update.push(data.solutionDescription);
            this.setState({ solutions: update });
        } else if (type === 'causeAnalysis') {
            if (!this.validate(type)) {
                return;
            }
            //handle call api here
            let updateCause = [...this.state.causes];
            updateCause.push({ priority: data.priority, value: data.causeDescription });
            this.setState({ causes: updateCause });
        } else if (type === 'repairmentPlan') {
            if (!this.validate(type)) {
                return;
            }
            //handle call api here
            let update = [...this.state.plans];
            update.push(data.planDescription);
            this.setState({ plans: update });
        }

    }

    handleClear = (type, index) => {
        let data = { ...this.state.data };
        if (type === 'solution') {
            data.solutionDescription = "";
            //handle call api here
            var update = [...this.state.solutions];
            update.splice(index - 1);
            this.setState({ solutions: update });
        } else if (type === 'causeAnalysis') {
            data.causeDescription = "";
            data.priority = "";
            //handle call api here
            var updateCause = [...this.state.causes];
            updateCause.splice(index - 1);
            this.setState({ causes: updateCause });
        } else if (type === 'repairmentPlan') {
            data.planDescription = "";
            //handle call api here
            var update = [...this.state.plans];
            update.splice(index - 1);
            this.setState({ plans: update });
        }

        this.setState({
            data: data
        })
    }

    onChangeValueCustom = (name, refName, value) => {
        let data = { ...this.state.data };
        let errors = { ...this.state.errors };
        data[name] = value;
        errors[refName] = '';
        errors[name] = '';

        this.setState({
            data,
            errors
        })
    }

    onSelectLocationChange = async (value) => {
        let filter = { ...this.state.filter };
        let errors = { ...this.state.errors };

        filter.locationCode = value;
        filter.roomCode = null;

        this.setState({
            filter,
            errors: {
                ...errors,
                locationCode: '',
                roomCode: ''
            }
        });

        await this.loadAreaData(value);

    }

    onChangeFilter(name, value) {
        let filter = { ...this.state.filter };
        let errors = { ...this.state.errors };
        console.log(name, value)
        filter[name] = value;
        this.setState({
            filter: filter,
            errors: {
                ...errors,
                roomCode: ''
            }
        });
    }

    onChangeDateFilter(name, value) {
        let filter = { ...this.state.filter };
        let errors = { ...this.state.errors };

        filter[name] = value ? moment(value, 'DD/MM/YYYY').format('YYYY-MM-DD') : null;
        errors[name] = '';
        this.setState({
            filter,
            errors
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
                title: trans('techreport:createdDate'),
                dataIndex: 'createDate',
                key: 'createDate',
                width: 110,
                render: (dataCell) => formatDateDataTable(dataCell)
            },
            {
                title: trans('techreport:status'),
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
                title: trans('techreport:priority'),
                dataIndex: 'priority',
                key: 'priority',
                width: 110,
                // className: 'columnStatus',
                render: (value, data) => {
                    var piority = '';
                    var color = 'black';
                    switch (value) {
                        case 1:
                            piority = 'Low';
                            color = '#177A56';

                            break;
                        case 2:
                            piority = 'Medium';
                            color = '#C08024';
                            break;
                        case 3:
                            piority = 'High'
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
                title: trans('techreport:summary'),
                dataIndex: 'summary',
                key: 'summary',
                width: 150,
            },
            {
                title: trans('techreport:reporter'),
                dataIndex: 'reporter',
                key: 'reporter',
                width: 150,
            },

            {
                title: trans('techreport:technician'),
                dataIndex: 'technician',
                key: 'technician',
                width: 150
            },
            {
                title: <SettingOutlined />,
                dataIndex: 'action',
                key: 'action',
                width: 150,
                render: (review, record) => {
                    return (
                        <Link to={'/detailTrouble/' + record?.reportID}
                            target='_blank'
                        >
                            <Button type="link" style={{ padding: 0 }}
                                title={'View detail'}
                            >
                                <Image src={viewIcon} preview={false} width={20} ></Image>
                            </Button>
                        </Link>
                    );
                }
            }
        ];

        const columnChecklist = [
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
                title: trans('techreport:createdDate'),
                dataIndex: 'fromDate',
                key: 'fromDate',
                width: 110,
                render: (dataCell) => formatDateDataTable(dataCell)
            },
            {
                title: trans('techreport:endDate'),
                dataIndex: 'endDate',
                width: 100,
                render: (dataCell) => formatDateDataTable(dataCell)
            },
            {
                title: trans('techreport:status'),
                dataIndex: 'status',
                key: 'status',
                width: 100,
                className: 'columnStatus',
                render: function (value) {
                    let colorStatus = "";
                    if (value.toLowerCase() === 'false') {
                        colorStatus = "#FF2222";
                    } else if (value.toLowerCase() === 'true') {
                        colorStatus = "#30BD79";
                    }
                    return (
                        <Tag color={colorStatus} style={{ textAlign: 'center' }}>
                            {value.toLowerCase() === "true" ? 'OK' : 'NOK'}
                        </Tag>
                    )
                }
            },
            {
                title: trans('techreport:technician'),
                dataIndex: 'technician',
                key: 'technician',
                width: 100,
            },
            {
                title: trans('techreport:checkingDate'),
                dataIndex: 'checkingDate',
                key: 'checkingDate',
                width: 100,
                render: (value) => { moment(value).format('DD/MM/YYYY HH:mm:ss') }
            },
            {
                title: trans('techreport:issues'),
                dataIndex: 'issues',
                key: 'issues',
                width: 300,
                render: (value) => {
                    return (
                        <div style={{ textAlign: 'left' }}>
                            {
                                value ? value.split(';').map((elm, index) => {
                                    return (
                                        <p>{index < 9 ? '0' + ++index : index}.{elm}</p>
                                    )
                                })
                                    :
                                    null
                            }
                        </div>

                    );
                }
            },
            {
                title: <SettingOutlined />,
                dataIndex: 'action',
                key: 'action',
                width: 100,
                render: (review, record) => {
                    return (
                        <Link to={'/checklistDetail/' + record?.id}
                            target='_blank'
                        >
                            <Button type="link" style={{ padding: 0 }}
                                title={'View detail'}
                            >
                                <Image src={viewIcon} preview={false} width={20} ></Image>
                            </Button>
                        </Link>
                    );
                }
            }
        ];

        return (
            <>
                <div className="container">
                    <Row>
                        <Col
                            style={{ marginBottom: "10px" }}
                        >
                            <HeaderPannel
                                classNameCustom="create-trouble"
                                title={trans('techreport:title')}
                                breadcrumbList={[trans('techreport:breadcum')]}
                            />
                        </Col>
                        <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "10px" }}>
                            <Form layout="vertical" colon={false}>
                                <div className="infor-user-create padding-pannel">
                                    <Row style={{ marginTop: '10px' }}>
                                        <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                            <Image
                                                src={addressIcon}
                                                preview={false}
                                                width={25}
                                                onClick={this.handleSubmitNewItem}
                                            ></Image>
                                            <span>&emsp;<b>{trans('techreport:campus')}</b>&emsp; {this.state.cValue?.userInfo?.campus?.name}</span>
                                        </Col>
                                        <Col xs={12} sm={12} md={6} lg={4} xl={3}>
                                            <Form.Item
                                                label={trans('techreport:location')}
                                                required={true}
                                                help={this.state.errors.locationCode}
                                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.locationCode)}
                                            >
                                                <SelectCustom
                                                    onChange={(e) => this.onSelectLocationChange(e)}
                                                    placeholder={trans('techreport:locationPlaceholder')}
                                                    value={this.state.filter.locationCode}
                                                    options={this.state.locations}
                                                    clear={true}
                                                    keyValue="code"
                                                    lable="code"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={12} sm={12} md={6} lg={4} xl={3}>
                                            <Form.Item
                                                label={trans('techreport:roomArea')}
                                                help={this.state.errors.roomCode}
                                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.roomCode)}
                                            >
                                                <SelectCustom
                                                    id="roomArea"
                                                    onChange={(e, value) => this.onChangeFilter('roomCode', e)}
                                                    // defaultValue="Student1212"
                                                    placeholder={trans('techreport:roomAreaPlaceholder')}
                                                    value={this.state.filter.roomCode}
                                                    options={this.state.areas}
                                                    clear={true}
                                                    keyValue="name"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={12} sm={12} md={6} lg={4} xl={3}>
                                            <Form.Item
                                                label={trans('techreport:fromDate')}
                                                help={this.state.errors.fromDate}
                                                required
                                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.fromDate)}
                                            >
                                                <DatePicker
                                                    disabledDate={this.disabledFromDate}
                                                    onChange={(e, timeString) =>
                                                        this.onChangeDateFilter('fromDate', timeString)}
                                                    format='DD/MM/YYYY'
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={12} sm={12} md={6} lg={4} xl={3}>
                                            <Form.Item
                                                label={trans('techreport:toDate')}
                                                help={this.state.errors.toDate}
                                                required
                                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.toDate)}
                                            >
                                                <DatePicker
                                                    disabledDate={this.disabledToDate}
                                                    onChange={(e, timeString) =>
                                                        this.onChangeDateFilter('toDate', timeString)}
                                                    format='DD/MM/YYYY'
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={12} sm={12} md={12} lg={12} xl={12} className="col-search" style={{
                                            // marginTop: '18px',
                                            height: '40px',
                                            paddingTop: '3px',
                                            display: 'flex'
                                        }}>
                                            <div className="button button-submit daily-checklist-searchbtn" onClick={this.onSearch}>
                                                {trans('common:button.search')}
                                            </div>
                                            <div className="button button-submit daily-checklist-searchbtn" onClick={this.onExport}>
                                                {trans('common:button.export')}
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </Form>
                        </Col>
                        {this.state.isSearch ?
                            <>
                                <Form layout="horizontal" colon={false}>
                                    <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "10px" }}>
                                        <div className="room-inside-container">
                                            <Collapse
                                                defaultActiveKey={["1", "2", "3"]}
                                                onChange={this.onChangeCollapse}
                                                expandIconPosition="end"
                                            >
                                                <Panel key="1" header={<b>I. {trans('techreport:information')}</b>}>
                                                    <Descriptions bordered>
                                                        <Descriptions.Item label={trans('techreport:exportDate')}>
                                                            {formatDateDataTable(this.state.data.exportDate)}
                                                        </Descriptions.Item>
                                                        <Descriptions.Item label={trans('techreport:location')}>
                                                            {this.state.data.location}
                                                        </Descriptions.Item>
                                                        {this.state.data.systemRoom ?
                                                            <Descriptions.Item label={trans('techreport:room')}>
                                                                {this.state.data.systemRoom}
                                                            </Descriptions.Item> : null
                                                        }
                                                        {
                                                            this.state.data.equipment.length !== 0 ?
                                                                <Descriptions.Item label={trans('techreport:equiments')}>
                                                                    {
                                                                        this.state.data.equipment ?
                                                                            this.state.data.equipment.map((elm, index) => {
                                                                                return (
                                                                                    <p>{index < 9 ? '0' + ++index : ++index}. {trans('techreport:device')}: {elm.name}, {trans('techreport:quantity')}: {elm.quantity} </p>
                                                                                );
                                                                            })
                                                                            :
                                                                            null
                                                                    }
                                                                </Descriptions.Item> : null
                                                        }
                                                    </Descriptions>
                                                </Panel>
                                            </Collapse>
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "10px" }}>
                                        <div className="room-inside-container">
                                            <Collapse
                                                defaultActiveKey={["1", "2", "3"]}
                                                onChange={this.onChangeCollapse}
                                                expandIconPosition="end"
                                            >
                                                <Panel key="1" header={<b>II. {trans('techreport:inforCollection')}</b>}>
                                                    <Row>
                                                        <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                            <Collapse
                                                                defaultActiveKey={["1"]}
                                                                onChange={this.onChangeCollapse}
                                                                expandIconPosition="end"
                                                            >
                                                                <Panel key="1" header={<b>{trans('techreport:troubleShooting')} ({trans('techreport:total')}: {this.state.data.totalTroubles})</b>}>
                                                                    <Table
                                                                        columns={columnTroubleReport}
                                                                        dataSource={this.state.data.troubleshootingReport}
                                                                        pagination={false}
                                                                        size="middle"
                                                                        scroll={{
                                                                            y: 240,
                                                                        }}
                                                                    />
                                                                </Panel>
                                                            </Collapse>
                                                        </Col>
                                                        <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                            <Collapse
                                                                defaultActiveKey={["1"]}
                                                                expandIconPosition="end"
                                                            >
                                                                <Panel key="1" header={<b>{trans('techreport:checklistReport')} ({trans('techreport:total')}: {this.state.data.totalChecklists})</b>}>
                                                                    <Table
                                                                        columns={columnChecklist}
                                                                        dataSource={this.state.data.checklistReport}
                                                                        pagination={false}
                                                                        size="middle"
                                                                        scroll={{
                                                                            y: 240,
                                                                        }}
                                                                    />
                                                                </Panel>
                                                            </Collapse>
                                                        </Col>
                                                    </Row>
                                                </Panel>
                                            </Collapse>
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "10px" }}>
                                        <div className="room-inside-container">
                                            <Collapse
                                                defaultActiveKey={["1", "2", "3"]}
                                                onChange={this.onChangeCollapse}
                                                expandIconPosition="end"
                                            >
                                                <Panel key="1" header={<b>III. {trans('techreport:causeAnalysis')}</b>}>
                                                    <Row>
                                                        <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                            {
                                                                this.state.causes.map((elm, index) => {
                                                                    return (
                                                                        <div>
                                                                            <Image
                                                                                style={{
                                                                                    cursor: 'pointer',
                                                                                    // border: '1px solid #41bf57', backgroundColor: '#e8f6f0' 
                                                                                }}
                                                                                src={removeIcon}
                                                                                preview={false}
                                                                                width={15}
                                                                                onClick={() => this.handleClear('causeAnalysis', index)}
                                                                            ></Image>
                                                                            &nbsp; {trans('techreport:cause')}-{index < 9 ? '0' + ++index : ++index}.
                                                                            &nbsp;
                                                                            <Tag color={elm.priority === 'High' ? '#F12023' :
                                                                                elm.priority === "Medium" ? '#C08024' : '#177A56'
                                                                            } style={{ textAlign: 'center' }}>
                                                                                {elm.priority}
                                                                            </Tag>
                                                                            &nbsp;{elm.value}
                                                                        </div>
                                                                    );
                                                                })
                                                            }
                                                        </Col>
                                                        <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                            <div className="create-checklist">
                                                                <Row>
                                                                    <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                                        <div className="create-checklist-title">
                                                                            <Image src={createIcon} preview={false} width={30} />
                                                                            <b>{trans('techreport:newCauseAnalysis')}</b>
                                                                        </div>
                                                                    </Col>
                                                                    <Col xs={12} sm={12} md={10} lg={7} xl={9}>
                                                                        <Form.Item
                                                                            className="form-block"
                                                                            label={trans('techreport:causeDescription')}
                                                                            help={this.state.errors.causeDescription}
                                                                            required
                                                                            validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.causeDescription)}
                                                                        >
                                                                            <TextArea
                                                                                id="causeDescription"
                                                                                autoSize={{ minRows: 1, maxRows: 3 }}
                                                                                placeholder={""}
                                                                                value={this.state.data?.causeDescription}
                                                                                onChange={e => onChangeValue(this, 'causeDescription', e.target.value)}
                                                                            />
                                                                        </Form.Item>
                                                                    </Col>
                                                                    <Col xs={12} sm={12} md={10} lg={3} xl={2}>
                                                                        <Form.Item
                                                                            className="form-block"
                                                                            required
                                                                            label={trans('techreport:priority')}
                                                                            help={this.state.errors.priority}
                                                                            validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.priority)}
                                                                        >
                                                                            <SelectCustom
                                                                                id="priority"
                                                                                onChange={(e, value) => onChangeValue(this, 'priority', value.children)}
                                                                                // defaultValue="Student1212"
                                                                                placeholder={trans('techreport:high')}
                                                                                value={this.state.data.priority}
                                                                                options={priority}
                                                                            />
                                                                        </Form.Item>
                                                                    </Col>
                                                                    <Col xs={12} sm={12} md={2} lg={2} xl={1}>
                                                                        <div style={{ display: "flex", justifyContent: "space-around" }} className="sub-button-group">
                                                                            <Image
                                                                                style={{
                                                                                    cursor: 'pointer',
                                                                                    // border: '1px solid #41bf57', backgroundColor: '#e8f6f0' 
                                                                                }}
                                                                                src={doneIcon}
                                                                                preview={false}
                                                                                width={35}
                                                                                onClick={() => this.handleSubmit('causeAnalysis')}
                                                                            ></Image>
                                                                        </div>
                                                                    </Col>
                                                                </Row>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Panel>
                                            </Collapse>
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "10px" }}>
                                        <div className="room-inside-container">
                                            <Collapse
                                                defaultActiveKey={["1", "2", "3"]}
                                                onChange={this.onChangeCollapse}
                                                expandIconPosition="end"
                                            >
                                                <Panel key="1" header={<b>IV. {trans('techreport:solution')}</b>}>
                                                    <Row>
                                                        <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                            {
                                                                this.state.solutions.map((elm, index) => {
                                                                    return (
                                                                        <div>
                                                                            <Image
                                                                                style={{
                                                                                    cursor: 'pointer',
                                                                                    // border: '1px solid #41bf57', backgroundColor: '#e8f6f0' 
                                                                                }}
                                                                                src={removeIcon}
                                                                                preview={false}
                                                                                width={15}
                                                                                onClick={() => this.handleClear('solution', index)}
                                                                            ></Image>
                                                                            &nbsp; {trans('techreport:solutionUpper')}-{index < 9 ? '0' + ++index : ++index}.
                                                                            &nbsp; {elm}
                                                                        </div>
                                                                    );
                                                                })
                                                            }
                                                        </Col>
                                                        <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                            <div className="create-checklist">
                                                                <Row>
                                                                    <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                                        <div className="create-checklist-title">
                                                                            <Image src={createIcon} preview={false} width={30} /><b>{trans('techreport:newSolution')}</b>
                                                                        </div>
                                                                    </Col>
                                                                    <Col xs={12} sm={12} md={10} lg={10} xl={11}>
                                                                        <Form.Item
                                                                            className="form-block"
                                                                            label={trans('techreport:solutionDescription')}
                                                                            help={this.state.errors.solutionDescription}
                                                                            required
                                                                            validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.solutionDescription)}
                                                                        >
                                                                            <TextArea
                                                                                id="solutionDescription"
                                                                                autoSize={{ minRows: 1, maxRows: 3 }}
                                                                                placeholder={""}
                                                                                value={this.state.data?.solutionDescription}
                                                                                onChange={e => onChangeValue(this, 'solutionDescription', e.target.value)}
                                                                            />
                                                                        </Form.Item>
                                                                    </Col>
                                                                    <Col xs={12} sm={12} md={2} lg={2} xl={1}>
                                                                        <div style={{ display: "flex", justifyContent: "space-around" }} className="sub-button-group">
                                                                            <Image
                                                                                style={{
                                                                                    cursor: 'pointer',
                                                                                    // border: '1px solid #41bf57', backgroundColor: '#e8f6f0' 
                                                                                }}
                                                                                src={doneIcon}
                                                                                preview={false}
                                                                                width={35}
                                                                                onClick={() => this.handleSubmit('solution')}
                                                                            ></Image>
                                                                        </div>
                                                                    </Col>
                                                                </Row>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Panel>
                                            </Collapse>
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "10px" }}>
                                        <div className="room-inside-container">
                                            <Collapse
                                                defaultActiveKey={["1", "2", "3"]}
                                                onChange={this.onChangeCollapse}
                                                expandIconPosition="end"
                                            >
                                                <Panel key="1" header={<b>V. {trans('techreport:repairmentPlan')}</b>}>
                                                    <Row>
                                                        <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                            {
                                                                this.state.plans.map((elm, index) => {
                                                                    return (
                                                                        <div>
                                                                            <Image
                                                                                style={{
                                                                                    cursor: 'pointer',
                                                                                    // border: '1px solid #41bf57', backgroundColor: '#e8f6f0' 
                                                                                }}
                                                                                src={removeIcon}
                                                                                preview={false}
                                                                                width={15}
                                                                                onClick={() => this.handleClear('repairmentPlan', index)}
                                                                            ></Image>
                                                                            &nbsp; {trans('techreport:plan')}-{index < 9 ? '0' + ++index : ++index}.
                                                                            &nbsp;{elm}
                                                                        </div>
                                                                    );
                                                                })
                                                            }
                                                        </Col>
                                                        <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                            <div className="create-checklist">
                                                                <Row>
                                                                    <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                                        <div className="create-checklist-title">
                                                                            <Image src={createIcon} preview={false} width={30} /><b>{trans('techreport:newPlan')}</b>
                                                                        </div>
                                                                    </Col>
                                                                    <Col xs={12} sm={12} md={10} lg={10} xl={11}>
                                                                        <Form.Item
                                                                            className="form-block"
                                                                            label={trans('techreport:planDescription')}
                                                                            help={this.state.errors.planDescription}
                                                                            required
                                                                            validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.planDescription)}
                                                                        >
                                                                            <TextArea
                                                                                autoSize={{ minRows: 1, maxRows: 3 }}
                                                                                placeholder={"Mô tả chi tiết kế hoạch..."}
                                                                                value={this.state.data?.planDescription}
                                                                                onChange={e => onChangeValue(this, 'planDescription', e.target.value)}
                                                                            />
                                                                        </Form.Item>
                                                                    </Col>
                                                                    <Col xs={12} sm={12} md={2} lg={2} xl={1}>
                                                                        <div style={{ display: "flex", justifyContent: "space-around" }} className="sub-button-group">
                                                                            <Image
                                                                                style={{
                                                                                    cursor: 'pointer',
                                                                                    // border: '1px solid #41bf57', backgroundColor: '#e8f6f0' 
                                                                                }}
                                                                                src={doneIcon}
                                                                                preview={false}
                                                                                width={35}
                                                                                onClick={() => this.handleSubmit('repairmentPlan')}
                                                                            ></Image>
                                                                        </div>
                                                                    </Col>
                                                                </Row>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Panel>
                                            </Collapse>
                                        </div>
                                    </Col>
                                </Form>
                                <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                    <Form layout="horizontal" colon={false} labelCol={{ span: '3' }} labelAlign="left">
                                        <div className="room-inside-container">
                                            <Collapse
                                                defaultActiveKey={["1", "2", "3"]}
                                                onChange={this.onChangeCollapse}
                                                expandIconPosition="end"
                                            >
                                                <Panel key="1" header={<b>VI. {trans('techreport:review')}</b>}>
                                                    <Row>
                                                        <Col xs={12} sm={12} md={10} lg={10} xl={11}>
                                                            <Form.Item
                                                                className="form-block"
                                                                label={<b>{trans('techreport:review')}</b>}
                                                                help={this.state.errors.review}
                                                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.review)}
                                                            >
                                                                <TextArea
                                                                    autoSize={{ minRows: 3, maxRows: 3 }}
                                                                    placeholder={""}
                                                                    value={this.state.data?.review}
                                                                    onChange={e => onChangeValue(this, 'review', e.target.value)}
                                                                />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col xs={12} sm={12} md={10} lg={10} xl={11}>
                                                            <Form.Item
                                                                className="form-block"
                                                                label={<b>{trans('techreport:prediction')}</b>}
                                                                help={this.state.errors.prediction}
                                                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.prediction)}
                                                            >
                                                                <TextArea
                                                                    autoSize={{ minRows: 3, maxRows: 3 }}
                                                                    placeholder={""}
                                                                    value={this.state.data?.prediction}
                                                                    onChange={e => onChangeValue(this, 'prediction', e.target.value)}
                                                                />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                </Panel>
                                            </Collapse>
                                        </div>
                                    </Form>
                                </Col>
                            </> : null
                        }
                    </Row>
                </div>

            </>
        );

    }

};

export default withTranslation(['techreport', 'common'])(TechReports);
