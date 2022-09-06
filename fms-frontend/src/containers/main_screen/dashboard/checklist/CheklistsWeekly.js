import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../layout/Home.css';
import '../../../../layout/CheklistsWeekly.css';
import '../../../../layout/Common.css';
import {
    Menu, Input, Steps, Collapse
} from 'antd';
import 'antd/dist/antd.min.css';
import HeaderPannel from '../../../../components/HeaderPannel';
import { UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { ChecklistService } from '../../../../services/main_screen/checklist/ChecklistService';
import {
    formatDateDataTable,
    handleHideNav,
    trans
} from '../../../../components/CommonFunction';
import { withTranslation } from 'react-i18next';
import { Notification } from "../../../../components/Notification";
import { ACTION, MESSAGE, STATUS } from '../../../../constants/Constants';

const { TextArea } = Input;
const { Step } = Steps;
const { Panel } = Collapse;

class CheklistsWeekly extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            params: JSON.parse(localStorage.getItem('weeklyParams')),
            user: JSON.parse(localStorage.getItem('cont'))
        }
        this.ChecklistService = new ChecklistService();
        this.Notification = new Notification();
    }

    componentDidMount() {
        this.loadData();
        document.querySelector('.container')?.addEventListener('click', handleHideNav);
    }

    loadData = async () => {
        console.log(this.state.params)
        await this.ChecklistService.getWeekly(this.state.params).then(res => {
            console.log(res)
            if (res && res?.status === 200 && res.data) {
                this.setState({ data: res.data?.listData });
            } else {
                console.log('adasjhdkajshdk')
                this.Notification.error(MESSAGE.ERROR);
            }
        })
    }

    renderHeader = (name, status) => {
        return (
            <Row style={{ marginTop: 5 }}>
                <Col xs={12} sm={12} md={3} lg={3} xl={2} style={{ fontWeight: 700 }}>
                    {name}
                </Col>
                <Col xs={12} sm={12} md={3} lg={3} xl={3} style={{ color: '#838080' }}>
                    {this.state.user?.userInfo?.campus?.name} {'>'} {this.state.params?.locationName}
                </Col>
                <Col xs={12} sm={12} md={3} lg={3} xl={3} style={{ color: '#838080' }}>
                    {trans('checklist:weeklyChecklist.from')} {formatDateDataTable(this.state.params?.fromDate)} {trans('checklist:weeklyChecklist.to')} {formatDateDataTable(this.state.params?.endDate)}
                </Col>
                <Col xs={12} sm={12} md={3} lg={3} xl={3} style={{ color: status === 'OK' ? '#0FC100' : '#FF2222', fontWeight: 700 }}>
                    {trans('checklist:weeklyChecklist.status')}: {status}
                </Col>
            </Row>
        )
    }

    renderRoomMap = (details, type) => {
        console.log(type, 'chekc type');
        return (
            <>
                {
                    details.map((elm) => {
                        // console.log(elm, 'check');
                        return (
                            <div className="floor-container">
                                {
                                    type === 'CÁC PHÒNG BÊN TRONG TOÀ NHÀ' ?
                                        <div className="header-floor">
                                            <div className="title-number-floor">{trans('checklist:weeklyChecklist.floor')} {elm.floor}</div>
                                            <div className="status-floor" style={{ color: elm.status === 'OK' ? '#0FC100' : '#FF2222' }}>{trans('checklist:weeklyChecklist.status')}: {elm.status}</div>
                                        </div>
                                        :
                                        null
                                }

                                <div className="display-rooms" style={{ cursor: 'pointer' }}>
                                    {
                                        elm.areaDetails.map(function (room) {
                                            let backgroundColor = room.status === 'OK' ? '#C6EECD' : '#FFC7CE';
                                            if (room.status === '?') {
                                                backgroundColor = '#FFEB9C'
                                            }
                                            return (
                                                <>
                                                    <div className="room" style={{ backgroundColor }}>
                                                        <Link to={{
                                                            pathname: '/checklistDetail/' + room?.id,
                                                        }} style={{ color: 'black' }}>{room.areaName}
                                                        </Link>
                                                    </div>
                                                </>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        );
                    })
                }
            </>
        );
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
                                title={trans('checklist:weeklyChecklist.title')}
                                breadcrumbList={[trans('checklist:weeklyChecklist.checklist'), trans('checklist:weeklyChecklist.title')]}
                            />
                        </Col>
                        <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "10px" }}>
                            <div className="room-inside-container">
                                {
                                    this.state.data ?
                                        <>
                                            {this.state.data.map((elm, index) => {
                                                if (elm.details.length !== 0) {
                                                    return (
                                                        <>
                                                            <Collapse
                                                                expandIconPosition="end"
                                                                style={{ marginBottom: 10 }}
                                                                defaultActiveKey={elm.details.length > 0 ? [index] : []}
                                                            >
                                                                <Panel key={index} extra={this.renderHeader(elm.checklistType, elm.status)}>
                                                                    <Row>
                                                                        <Col xs={12} sm={12} md={10} lg={10} xl={10}>
                                                                            {this.renderRoomMap(elm.details, elm.checklistType)}
                                                                        </Col>
                                                                        {/* <Col xs={12} sm={12} md={2} lg={2} xl={2}>
                                                                            <Row>
                                                                                {
                                                                                    elm.details.length > 0 ?
                                                                                        <>
                                                                                            <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                                                                <div style={{ fontWeight: "700" }}>Review</div>
                                                                                                <TextArea
                                                                                                    autoSize={{ minRows: 2, maxRows: 3 }} disabled={true}
                                                                                                />
                                                                                            </Col>
    
                                                                                        </>
                                                                                        : null
                                                                                }
    
                                                                            </Row>
                                                                        </Col> */}
                                                                    </Row>
                                                                </Panel>
                                                            </Collapse>
                                                        </>
                                                    );
                                                }

                                            })}
                                        </>
                                        : null
                                }

                            </div>
                        </Col>
                    </Row>
                </div>
            </>
        );
    }

};

export default withTranslation(['checklist', 'common'])(CheklistsWeekly);
