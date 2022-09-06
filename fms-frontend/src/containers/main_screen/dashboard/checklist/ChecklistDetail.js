import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../layout/Home.css';
import '../../../../layout/CheklistsWeekly.css';
import '../../../../layout/Common.css';
import {
    Form, Input, Steps, Collapse, Checkbox, Switch
} from 'antd';
import 'antd/dist/antd.min.css';
import HeaderPannel from '../../../../components/HeaderPannel';
import {
    formatDateDataTable,
    handleHideNav,
    trans
} from '../../../../components/CommonFunction';
import '../../../../layout/ChecklistDetail.css'
import { ChecklistService } from '../../../../services/main_screen/checklist/ChecklistService';
import { Notification } from '../../../../components/Notification';
import { Navigate } from 'react-router-dom';
import Error from '../../../notfound_page/Error';
import { withTranslation } from 'react-i18next';
import { hideDialogConfirm, showConfirm } from '../../../../components/MessageBox';

const { TextArea } = Input;
const { Step } = Steps;
const { Panel } = Collapse;

class ChecklistDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            notFound: false,
            user: JSON.parse(localStorage.getItem('cont')),
            redirectError: false
        }
        this.ChecklistService = new ChecklistService();
        this.Notification = new Notification();
    }

    componentDidMount() {
        this.loadData();
        document.querySelector('.container')?.addEventListener('click', handleHideNav);
    }

    loadData = async () => {
        await this.ChecklistService.getDetail(this.getUrlParameter()).then(res => {
            // console.log(res);
            if (res && res.status === 200 && res?.data?.data) {
                this.setState({ data: res?.data?.data })
            }
            else {
                this.setState({ redirectError: true });
            }
        })
    }

    getUrlParameter() {
        var url = window.location.href;
        var param = url.slice(url.lastIndexOf('/') + 1);
        return param;
    };

    renderHeader = (part) => {
        return (
            <Row style={{ marginTop: 5 }}>
                <Col xs={12} sm={12} md={2} lg={4} xl={5} style={{ fontWeight: 700 }}>
                    {part}
                </Col>
                <Col xs={12} sm={6} md={5} lg={4} xl={4} style={{ color: '#838080' }}>
                    {this.state.data?.checklistInfo?.campusName ? this.state.data?.checklistInfo?.campusName + ' >' : ''} &nbsp;
                    {this.state.data?.checklistInfo?.locationName ? this.state.data?.checklistInfo?.locationName : ''} &nbsp;
                    {this.state.data?.checklistInfo?.areaName ? '> ' + this.state.data?.checklistInfo?.areaName : ''}
                </Col>
                <Col xs={12} sm={6} md={5} lg={4} xl={3} style={{ color: '#838080' }}>
                    {trans('checklist:detailChecklist.from')}: &nbsp; {formatDateDataTable(this.state.data?.checklistInfo?.fromDate)} &nbsp;{trans('checklist:detailChecklist.to')}&nbsp;{formatDateDataTable(this.state.data?.checklistInfo?.endDate)}
                </Col>
            </Row>
        )
    }

    renderHeaderConponent = (part, component) => {
        return (
            <Row style={{ marginTop: 5 }}>
                <Col xs={12} sm={12} md={6} lg={6} xl={4} style={{ fontWeight: 700 }}>
                    {part}: &nbsp;{component.name}
                </Col>
                <Col xs={12} sm={12} md={6} lg={6} xl={1}>
                    {component.status}
                </Col>
                <Col xs={12} sm={6} md={6} lg={6} xl={4} style={{ color: '#838080' }}>
                    {this.state.data?.checklistInfo?.campusName ? this.state.data?.checklistInfo?.campusName + ' >' : ''} &nbsp;
                    {this.state.data?.checklistInfo?.locationName ? this.state.data?.checklistInfo?.locationName : ''} &nbsp;
                    {this.state.data?.checklistInfo?.areaName ? '> ' + this.state.data?.checklistInfo?.areaName : ''}
                </Col>
                <Col xs={12} sm={6} md={6} lg={6} xl={3} style={{ color: '#838080' }}>
                    {trans('checklist:detailChecklist.from')}: &nbsp; {formatDateDataTable(this.state.data?.checklistInfo?.fromDate)} &nbsp;{trans('checklist:detailChecklist.to')}&nbsp;{formatDateDataTable(this.state.data?.checklistInfo?.endDate)}
                </Col>
            </Row>
        )
    }

    onChangeValueCustom = (indexContain, index, value, indexComponent) => {
        let data = { ...this.state.data };
        data.componentList[indexComponent].itemList[indexContain].requirementList[index].value = value;

        var status = true;
        var NOK = '';
        var issueList = [];
        let itemListUpdate = data.componentList[indexComponent].itemList[indexContain];
        itemListUpdate.requirementList.forEach(element => {
            status &= element.value;
            if (element.value === false) {
                NOK += element.name + '; ';
            }
        });
        itemListUpdate.status = status ? 'OK' : 'NOK';
        itemListUpdate.nok = NOK.length > 0 ? NOK.substring(0, NOK.length - 2) : null;

        var componentStatus = 'OK'
        data.componentList[indexComponent].itemList.forEach(element => {
            if (element.status === 'NOK') {
                componentStatus = 'NOK';
            }
        });
        data.componentList[indexComponent].status = componentStatus;

        var summaryStatus = 'OK'
        data.componentList.forEach(element => {
            if (element.status === 'NOK') {
                summaryStatus = 'NOK';
            }
        });
        data.checklistInfo.status = summaryStatus;

        data.componentList.forEach(com => {
            com.itemList.forEach(item => {
                if (item.nok && item.nok?.trim().length > 0) {
                    issueList.push(`[${com.name}][${item.name}] - vấn đề tại: ${item.nok}`);
                }
            })
        });

        data.componentList[indexComponent].itemList[indexContain] = itemListUpdate;
        data.checklistInfo.issuesList = issueList;

        itemListUpdate.isChecked = true; //Khi check vào từng requirement thì tự động check vào đã kiểm tra

        this.setState({
            data: data
        })
    }

    onChangeValueCustomInput = (name, value) => {
        let dataUpdate = { ...this.state.data };
        dataUpdate[name] = value;
        this.setState({
            data: dataUpdate
        })
    }

    handleClickSubmit = async () => {
        let data = { ...this.state.data };
        let user = { ...this.state.user };
        data.checklistInfo.technician = data.checklistInfo.technician ? data.checklistInfo.technician : user?.userInfo?.username;
        await this.ChecklistService.save(data).then(res => {
            if (res && res.status === 200) {
                this.Notification.success(res?.data?.message);
            }
            else {
                this.Notification.error(res?.data?.message);
            }
        });
        setTimeout(() => {
            this.loadData();
        }, 300);
    }


    onChangeNote = (index, note, indexComponent) => {
        // debugger
        let updateData = { ...this.state.data };
        updateData.componentList[indexComponent].itemList[index].note = note;

        this.setState({ data: updateData });
    }

    onChangeSummary = (name, value) => {
        let updateData = { ...this.state.data };
        updateData.checklistInfo[name] = value;

        this.setState({ data: updateData });
    }

    onChangeValueIsChecked = (index, indexComponent, value) => {
        let componentList = [...this.state.data.componentList];
        let itemCheck = componentList[indexComponent].itemList[index];

        itemCheck.isChecked = value;
        if (value === true) {
            itemCheck.status = 'OK';
            itemCheck.requirementList.forEach(requirement => {
                requirement.value = true;
            });
        } else {
            itemCheck.status = 'Chưa kiểm tra';
            itemCheck.requirementList.forEach(requirement => {
                requirement.value = false;
            });
        }

        this.setState({
            componentList
        })

    }

    _openDeletePopConfirm = () => {
        showConfirm
            (
                "Are you sure delete this checklist?",
                () => this.onDelete(this.getUrlParameter()),
                "Warning"
            );
    }

    onDelete = async (checklistID) => {
        await this.ChecklistService.delete(checklistID).then(res => {
            if (res?.status === 200) {
                hideDialogConfirm();
                this.Notification.success("Delete checklist successfully.");
                this.setState({redirectError: true})

            }
            else {
                hideDialogConfirm();
                this.Notification.error(res?.data?.message);
            }
        })
    }

    render() {
        let context = this;
        const renderChecklistsContent =
            this.state.data?.componentList ?
                this.state.data?.componentList.map(function (component, indexComponent) {
                    return (
                        <Collapse
                            key={indexComponent}
                            expandIconPosition="end"
                            defaultActiveKey={["1"]}
                        >
                            <Panel key="1" extra={context.renderHeaderConponent(trans('checklist:detailChecklist.headerColapse'), component)}>
                                <Row>
                                    {
                                        component.itemList.map(function (item, indexContain) {
                                            return (
                                                <>
                                                    <Col xs={12} sm={9} md={9} lg={10} xl={10} style={{ display: 'flex' }}>
                                                        <Switch
                                                            defaultChecked={item.isChecked}
                                                            value={item.isChecked} //Thêm biến isChecked vào api nằm trong itemList
                                                            onChange={e =>
                                                                context.onChangeValueIsChecked(indexContain, indexComponent, e)
                                                            } />
                                                        <div style={{ marginLeft: "15px" }} >

                                                            <b>{(indexContain < 10 ? ('0' + (indexContain + 1)) : (indexContain + 1)) + '. ' + item.name}</b>
                                                        </div>
                                                        {/* <Checkbox
                                                            checked={item.isChecked} //Thêm biến isChecked vào api nằm trong itemList
                                                            onChange={e =>
                                                                context.onChangeValueIsChecked(indexContain, indexComponent, e.target.checked)
                                                            }
                                                            style={{ marginLeft: "15px" }}
                                                        /> */}
                                                    </Col>
                                                    <Col xs={12} sm={3} md={3} lg={2} xl={2} style={{ textAlign: 'right' }} className="status-require">
                                                        <span style={{ color: item.isChecked && item.status === 'OK' ? '#0FC100' : '#FF2222', fontWeight: 'bold' }}>
                                                            {trans('checklist:detailChecklist.status')}: {item.isChecked === true ? item.status : 'Chưa kiểm tra'}
                                                        </span>
                                                    </Col>
                                                    <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                        <Row>
                                                            {
                                                                item.requirementList.map(function (requirement, index) {
                                                                    return (
                                                                        <Col xs={12} sm={6} md={4} lg={3} xl={2} key={index} className="requirement">
                                                                            <Checkbox
                                                                                checked={requirement.value}
                                                                                onChange={e =>
                                                                                    context.onChangeValueCustom(indexContain, index, e.target.checked, indexComponent)
                                                                                }
                                                                                style={{ marginLeft: "15px" }}
                                                                            />
                                                                            <span style={{ marginLeft: "5px" }}>{requirement.name}</span>
                                                                        </Col>
                                                                    )
                                                                })
                                                            }
                                                        </Row>
                                                    </Col>
                                                    <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ display: 'flex' }}>
                                                        <span style={{ width: '60px' }}>{trans('checklist:detailChecklist.note')}</span>&nbsp;&nbsp;
                                                        <TextArea
                                                            autoSize={{ minRows: 1, maxRows: 3 }}
                                                            value={item.note}
                                                            onChange={e => context.onChangeNote(indexContain, e.target.value, indexComponent)}
                                                        />
                                                    </Col>

                                                </>
                                            );
                                        })
                                    }
                                </Row>
                            </Panel>
                        </Collapse>
                    )
                }) : null;

        return (
            // <>
            //     {!this.state.user?.userInfo ?
            //         <Navigate to="/login" replace={true}></Navigate>
            //         :
            //         this.state.redirectError ?
            //             <>
            //                 <Error
            //                     title='Error at: Load template failed!'
            //                     description='Please contact with admin to verify Template./ Hãy liên hệ với admin để kiểm tra lại.'
            //                 />
            //             </>
            //             :
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
                                title={trans('checklist:detailChecklist.title')}
                                breadcrumbList={[trans('checklist:detailChecklist.checklist'), trans('checklist:detailChecklist.title')]}
                                buttons={[
                                    {
                                        title: trans('common:submit'),
                                        classNameCustom: 'submit',
                                        action: () => this.handleClickSubmit
                                    },
                                    {
                                        title: trans('common:button.delete'),
                                        classNameCustom: 'other',
                                        action: () => this._openDeletePopConfirm
                                    }
                                ]}
                            />
                        </Col>
                        <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "10px" }}>
                            <Form layout="horizontal">
                                <div className="room-inside-container">

                                    {renderChecklistsContent}

                                    <Collapse
                                        expandIconPosition="end"
                                        defaultActiveKey={["1"]}
                                    >
                                        <Panel key="1" extra={this.renderHeader('Summary')}>
                                            <Row>
                                                <Col xs={12} sm={12} md={6} lg={6} xl={4}>
                                                    <span style={{
                                                        color: this.state.data.checklistInfo?.status === null
                                                            || this.state.data.checklistInfo?.status === 'OK' || this.state.data.checklistInfo?.status === "True" ? '#0FC100' : '#FF2222',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {trans('checklist:detailChecklist.status')}: {this.state.data.checklistInfo?.status === null ?
                                                            'OK' : this.state.data.checklistInfo?.status === "True" || this.state.data.checklistInfo?.status === 'OK' ? 'OK' : 'NOK'}
                                                    </span>,  {this.state.data.checklistInfo?.checkingDate ?
                                                        <span>{trans('checklist:detailChecklist.checkingAt')}  {formatDateDataTable(this.state.data.checklistInfo?.checkingDate)}</span> : ""}
                                                </Col>
                                                <Col xs={12} sm={12} md={6} lg={6} xl={8} style={{ display: 'flex' }}>
                                                    <span style={{ width: '120px' }}>{trans('checklist:detailChecklist.technician')}</span>
                                                    <Input
                                                        value={this.state.data.checklistInfo?.technician ? this.state.data.checklistInfo?.technician : this.state.user.userInfo.username}
                                                        readOnly={true}
                                                        style={{ marginLeft: '10px', marginTop: '-5px' }}
                                                    />
                                                </Col>

                                                <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                    {this.state.data.checklistInfo?.issuesList?.length > 0 ?
                                                        <>
                                                            <b>{trans('checklist:detailChecklist.issues')}</b>
                                                            <ul>
                                                                {
                                                                    this.state.data.checklistInfo?.issuesList ?
                                                                        this.state.data.checklistInfo?.issuesList.map(function (issue, index) {
                                                                            return (
                                                                                <li key={index}>{(index < 10 ? ('0' + (index + 1)) : (index + 1)) + '. '}
                                                                                    <b style={{ color: 'red' }}>[{trans('checklist:detailChecklist.failed')}]</b> {issue}</li>
                                                                            )
                                                                        })
                                                                        : null
                                                                }
                                                            </ul>
                                                        </> : null
                                                    }
                                                </Col>
                                                <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                                                    <div style={{ fontWeight: "700" }}>
                                                        {trans('checklist:detailChecklist.review')}
                                                    </div>
                                                    <TextArea
                                                        autoSize={{ minRows: 3, maxRows: 5 }}
                                                        value={this.state.data.checklistInfo?.review}
                                                        onChange={e => this.onChangeSummary('review', e.target.value)} />
                                                </Col>
                                                <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                                                    <div style={{ fontWeight: "700" }}>
                                                        {trans('checklist:detailChecklist.solution')}
                                                    </div>
                                                    <TextArea
                                                        autoSize={{ minRows: 3, maxRows: 5 }}
                                                        value={this.state.data.checklistInfo?.solution}
                                                        onChange={e => this.onChangeSummary('solution', e.target.value)} />
                                                </Col>
                                            </Row>
                                        </Panel>
                                    </Collapse>
                                </div>
                            </Form>
                        </Col>
                    </Row>
                </div>
                {
                    this.state.redirectError?
                    <Navigate to="/checklist" replace={true}/>
                    : null
                }
            </>
            // }
            //     </>
        );

    }

};

export default withTranslation(['trouble', 'common'])(ChecklistDetail);
