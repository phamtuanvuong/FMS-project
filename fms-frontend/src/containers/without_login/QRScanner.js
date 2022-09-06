import React, { Component } from 'react';
import { Col, Label, Row } from "reactstrap";
import 'antd/dist/antd.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
// import '../../../../layout/Home.css';
import '../../layout/CreateTrouble.css';
import { Form, Checkbox, Input, DatePicker, Image, Button } from 'antd';
import AppContext from '../../context/AppContext';
import {
    trans
} from '../../components/CommonFunction';
import { LocationService } from '../../services/main_screen/configuration/LocationService';
import { AreaRoomService } from '../../services/main_screen/configuration/AreaRoomService';
import { MyTroubleService } from '../../services/main_screen/trouble/MyTroubleService';
import { Notification } from '../../components/Notification';
import { ACTION, STATUS, MESSAGE } from '../../constants/Constants';
// import { QrReader, openImageDialog } from 'react-qr-scanner';
import { QrReader } from 'react-qr-reader';
import { withTranslation } from 'react-i18next';

const { TextArea } = Input;

class CreateTrouble extends Component {

    static contextType = AppContext;

    constructor(props) {
        super(props);
        this.state = {
            emergencyStatus: [
                ''
            ],
            isCameraOn: false,
            delay: 100,
            result: 'No result',
            
        };
        this.LocationService = new LocationService();
        this.AreaRoomService = new AreaRoomService();
        this.service = new MyTroubleService();
        this.Notification = new Notification();

    }

    componentDidMount() {
        // this.loadLocationData();
        // this.loadAreaData();
    }


    getUrlParameter() {
        var url = window.location.href;
        var param = url.slice(url.lastIndexOf('createTroubleWithoutLogin') + 26);
        return param;
    };

    handleClickSubmit = (e) => {
        e.preventDefault();
        if (!this.validate()) {
            return;
        }
        this._saveTrouble(2);
    }


    handleScan = (data) => {
        console.log(data);
        this.setState({
            result: data,
        })
    }
    handleError = (err) => {
        console.error(err)
    }

    render() {
        const previewStyle = {
            height: 240,
            width: 320,
        }
        return (
            <div style={{ textAlign: 'center' }}>
                {/* <QrReader
                    delay={this.state.delay}
                    style={previewStyle}
                    onError={this.handleError}
                    onScan={(data) => this.handleScan(data)}
                    legacyMode
                >
                    <div onClick={openImageDialog()}>choose image from device</div>
                </QrReader>
                <p>{this.state.result}</p> */}
                {
                    this.state.isCameraOn ?
                        <>
                            <QrReader
                                scanDelay={500}
                                onResult={(result) => {
                                    console.log(result);
                                    if (result) {
                                        this.setState({
                                            result: result?.text
                                        });
                                    }
                                }}
                                onError={(result) => {
                                    // console.log(result);
                                    if (result) {
                                        console.error(result)
                                    }
                                }}
                                style={{ width: '100%' }}
                            />
                            <p>{this.state.result}</p>
                        </>
                        :  <p>System is maintenancing. Please try again later!</p>
                }
            </div>

        );
    }
};

export default withTranslation(['trouble', 'common'])(CreateTrouble);
