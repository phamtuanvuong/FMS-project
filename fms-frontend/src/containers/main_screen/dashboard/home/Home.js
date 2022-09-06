import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'antd/dist/antd.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../layout/Home.css';
import { Link, Navigate } from 'react-router-dom';
import { Image, Tag } from 'antd';
import iconplus from '../../../../assets/plus.png';
import iconlist from '../../../../assets/list.png';
import iconmap from '../../../../assets/maps.png';
import iconwarehouse from '../../../../assets/warehouse.png';
import iconMychecklist from '../../../../assets/note.png';
import iconTechReport from '../../../../assets/report.png';
import cNotify from '../../../../assets/propaganda.png';
import AppContext from '../../../../context/AppContext';
import { MyTroubleService } from '../../../../services/main_screen/trouble/MyTroubleService';
import {
    handleHideNav,
    trans
} from '../../../../components/CommonFunction';
import { HomeService } from '../../../../services/main_screen/home/HomeService';
import { withTranslation, Trans } from 'react-i18next';
import { ACTION, MESSAGE, STATUS } from '../../../../constants/Constants';
import { Notification } from '../../../../components/Notification';

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            incidentReportNotice: [],
            checklistNotice: [],
            warehouseNotice: [],
            quickAccessItems: [],
            cValue: JSON.parse(localStorage.getItem('cont')),
            counter: {
                open: 0, process: 0, done: 0, total: 0
            },
            filter: {
                paging: {
                    pageSize: 10,
                    currentPage: 1,
                    rowsCount: 0
                },
                fromDate: null,
                toDate: null,
                // workflowId: 0,
                locationCode: null,
                roomCode: null,
                roleID: 0,
                campus: null,
                user: ""
            },

        };
        this.MyTroubleService = new MyTroubleService();
        this.service = new HomeService();
        this.Notification = new Notification();
    }

    static contextType = AppContext;

    componentDidMount() {
        this.loadCounter();
        this.loadWarehouse();
        this.loadChecklist();
        this.loadForm();
        document.querySelector('.container').addEventListener('click', handleHideNav);
    }

    loadCounter = async () => {
        let userInfo = { ...this.state.cValue };
        let counter = { ...this.state.counter };
        if (userInfo) {
            await this.MyTroubleService.count({
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

    loadWarehouse = async () => {
        await this.service.geWarehouseNotify().then(res => { this.setState({ warehouseNotice: res?.data?.listData }) })
    }

    loadChecklist = async () => {
        await this.service.geChecklistNotify().then(res => { this.setState({ checklistNotice: res?.data?.listData }) })
    }

    loadForm = async () => {
        let filter = { ...this.state.filter };
        let user = { ...this.state.cValue };
        filter.roleID = user.userInfo.role;
        filter.campus = user.userInfo.campus.name;
        filter.user = user.userInfo.username;
        await this.MyTroubleService.getList(filter).then(res => {
            if (res && res?.status === 200 && res.data) {
                this.setState({ incidentReportNotice: res.data?.listData });
            } else {
                this.Notification.error(MESSAGE.ERROR);
            }
        })
    }


    render() {
        let userInfo = this.state.cValue?.userInfo;
        // console.log(userInfo)
        //debugger;
        const quickAccessItems = [
            {
                title: trans('home:createTrouble'),
                iconUrl: iconplus,
                path: '/createTrouble'
            },
            {
                title: trans('home:myTrouble'),
                iconUrl: iconlist,
                path: '/trouble'
            },
            {
                title: trans('home:viewMap'),
                iconUrl: iconmap,
                path: '/mapView'
            },
            {
                title: trans('home:warehouseRemain'),
                iconUrl: iconwarehouse,
                path: '/warehouseRemainingReport'
            },
            {
                title: trans('home:myChecklist'),
                iconUrl: iconMychecklist,
                path: '/checklist'
            },
            {
                title: trans('home:technicalReport'),
                iconUrl: iconTechReport,
                path: '/techreport'
            }


        ]

        let panelIncident = this.state.incidentReportNotice.map(function (item, index) {
            var piority = '';
            var color = 'black';
            switch (item.priority) {
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

            let scolor = '';
            let status = '';
            switch (item.status) {
                // case 'Done':
                //     status = trans('home:done');
                //     scolor = '#177A56';
                //     break;
                case 'Opening':
                    status = trans('home:opening');
                    scolor = '#C62DDF';
                    break;
                case 'Processing':
                    status = trans('home:processing');
                    scolor = '#15D1FA';
                    break;
                // case 'Cancel':
                //     status = trans('home:cancel');
                //     scolor = '#BA1C30';
                //     break;
                case 'Up Work':
                    status = trans('home:upwork');
                    scolor = 'grey';
                    break;
                default:
                    status = null;
                    scolor = 'grey';
            }
            return (
                status ?
                    <div key={index} style={{ display: 'flex', flexWrap: 'wrap' }}>
                        <div style={{ width: '80px' }}>
                            <Tag color={scolor}> {status} </Tag>
                        </div>
                        <div style={{ width: '65px' }}>
                            {item.priority ? <Tag color={color}>{piority}</Tag> : null}
                        </div>
                        <div style={{ width: '104px' }}>
                            {item.sla > 24 ? <Tag color={'geekblue'}> {'Over 24 hours'} </Tag> : ''}
                        </div>
                        <div>
                            <b>[{item.summary}]</b>&nbsp;{item.technician ? 'đang xử lý bởi' : 'đang chờ phân công'}<b>&nbsp;{item.technician}</b>.
                            {trans('home:viewDetial')}&nbsp; <a href={'detailTrouble/' + item.reportID} target='_blank'>{trans('home:here')}</a>.
                        </div>
                    </div>
                    : null
            )
        });
        let panelWarehouse = this.state.warehouseNotice ? this.state.warehouseNotice.map(function (item, index) {
            let color = '';
            let warehouseContent = '';
            if (item.overdue === 'Comming') {
                color = 'yellow';
                warehouseContent = trans('home:aFewLeft');
            } else {
                color = 'red';
                warehouseContent = trans('home:outOfStock');
            }
            return (
                <div key={index}>
                    {<Tag color={color}>{warehouseContent}</Tag>}
                    <b>{item.title}</b>&nbsp;{item.content}
                </div>
            )
        }) : null;

        let panelChecklist = this.state.checklistNotice ? this.state.checklistNotice.map(function (item, index) {
            return (
                <div key={index}>
                    {item.overdue === 'Overdue' ? <Tag color={'red'}>{trans('home:overdue')}</Tag> : null}
                    <b>{item.title}</b>&nbsp;{item.content}
                    .&nbsp;{trans('home:viewDetial')}&nbsp;<a href={item.refer} target='_blank'>{trans('home:here')}</a>.
                </div>
            )
        }) : null;

        let quickAccess = quickAccessItems.map((item, index) => {
            return (
                <Col key={index} xs={12} sm={6} md={6} lg={3} xl={2}>
                    <div className="button-quick-access">
                        <a href={item.path}>
                            <div className='icon-quick-access'>
                                <Image
                                    src={item.iconUrl}
                                    preview={false}
                                    width={20}
                                ></Image>

                            </div>
                            <div className='title-quick-access'>
                                {item.title}
                            </div>
                        </a>
                    </div>
                </Col>
            );
        });
        return (
            <>
                {!userInfo ?
                    <Navigate to="/login" replace={true}></Navigate>
                    :
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
                                    <div className="info-pannel">
                                        <Row>
                                            <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                <div className="title-info-pannel">
                                                    {trans('home:dashboard')}
                                                </div>
                                            </Col>
                                            <Col xs={12} sm={3} md={2} lg={2} xl={1} className="avatar-container">
                                                <div className="infor-user-avatar">
                                                    <Image
                                                        src={userInfo ? userInfo.imageUrl : null}
                                                        preview={false}
                                                    ></Image>
                                                </div>
                                            </Col>

                                            <Col xs={12} sm={9} md={9} lg={9} xl={5}>

                                                <div className="infor-user-content">
                                                    <div className="infor-user-name">
                                                        {/* {userInfo ? userInfo.username : ''},  */}
                                                        <b>{userInfo ? userInfo.name : ''}</b>
                                                    </div>
                                                    <div className="infor-user-work-place">
                                                        {userInfo.campus.name}
                                                    </div>
                                                </div>
                                            </Col>

                                            <Col></Col>
                                            <Col xs={12} sm={12} md={12} lg={12} xl={5}>
                                                <Row className="row-process">
                                                    <Col xs={12} sm={3} md={3} lg={3} xl={3} className="col-process">
                                                        <div className="infor-process-opening infor-process">
                                                            <div className="opening-title">
                                                                {trans('home:opening')}
                                                            </div>
                                                            <div className="opening-counter counter">
                                                                {this.state.counter.open}
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12} sm={3} md={3} lg={3} xl={3} className="col-process">
                                                        <div className="infor-process-processing infor-process">
                                                            <div className="processing-title">
                                                                {trans('home:processing')}
                                                            </div>
                                                            <div className="processing-counter counter">
                                                                {this.state.counter.process}
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12} sm={3} md={3} lg={3} xl={3} className="col-process">
                                                        <div className="infor-process-done infor-process">
                                                            <div className="done-title">
                                                                {trans('home:done')}
                                                            </div>
                                                            <div className="done-counter counter">
                                                                {this.state.counter.done}
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12} sm={3} md={3} lg={3} xl={3} className="col-process">
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

                                {
                                    panelIncident?.length !== 0 ?
                                        <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "10px" }}>
                                            <div className="incident-noty-pannel noty-panel">
                                                <div className="incident-pannel-title panel-title">
                                                    <img src="../../../../assets/notification.png" alt="" width="20px" />
                                                    {trans('home:troubleNotice')}
                                                </div>
                                                <div className="incident-pannel-content pannel-content">
                                                    {panelIncident}
                                                </div>
                                            </div>
                                        </Col> : ''
                                }
                                {
                                    panelChecklist?.length !== 0 && userInfo.role > 1 ?
                                        <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "10px" }}>
                                            <div className="incident-noty-pannel noty-panel">
                                                <div className="incident-pannel-title panel-title">
                                                    <img src={cNotify} alt="" width="20px" />
                                                    {trans('home:checklistNotice')}
                                                </div>
                                                <div className="incident-pannel-content pannel-content">
                                                    {panelChecklist}
                                                </div>
                                            </div>
                                        </Col> : ''
                                }
                                {
                                    panelWarehouse?.length !== 0 && userInfo.role > 1 ?
                                        <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "10px" }}>
                                            <div className="warehouse-noty-pannel noty-panel">
                                                <div className="warehouse-pannel-title panel-title">
                                                    <img src="../../../../assets/warning.png" alt="" width="20px" />
                                                    {trans('home:warehouseNotice')}
                                                </div>
                                                <div className="warehouse-pannel-content pannel-content">
                                                    {panelWarehouse}
                                                </div>

                                            </div>
                                        </Col> : ''
                                }
                                {
                                    userInfo.role > 1 ?
                                        <Col
                                            style={{ marginBottom: "10px" }}
                                            xs={12}
                                            sm={12}
                                            md={12}
                                            lg={12}
                                            xl={12}
                                        >
                                            <div className="quick-access-pannel noty-panel">
                                                <div className="quick-access-pannel-title  panel-title">
                                                    <img src="../../../../assets/light-bulb.png" alt="" width="20px" />
                                                    {trans('home:quickAccess')}
                                                </div>
                                                <div className="quick-access-content pannel-content">
                                                    <Row>
                                                        {quickAccess}
                                                    </Row>
                                                </div>
                                            </div>
                                        </Col> : null
                                }
                            </Row>
                        </div>
                    </>
                }
            </>
        );
    }

};


export default withTranslation('home')(Home);
