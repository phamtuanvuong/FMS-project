import React, { Component } from 'react';
import '../../layout/Login.css';
import { Button, Image, Select } from 'antd';
import { Col, Row } from "reactstrap";
import 'antd/dist/antd.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import GoogleLogin from 'react-google-login';
import { env } from '../../constants/Constants';
import AppContext from '../../context/AppContext';
import { Navigate } from 'react-router-dom';
import { CampusService } from '../../services/main_screen/configuration/CampusService';
import { UserService } from '../../services/main_screen/configuration/UserService';
import { Notification } from '../../components/Notification';
import logoFpt from '../../assets/DhFPT_Logo.png';
import SelectCustom from '../../components/SelectCustom';

class Login extends Component {
    constructor(props) {
        super(props);
        this.CampusService = new CampusService();
        this.UserService = new UserService();
        this.Notification = new Notification();
        this.state = {
            campus: [],
            data: {
                email: '',
                imageUrl: '',
                name: '',
                role: '',
                campus: {}
            },
            redirect: false,
            chooseCampus: null
        }

    }

    componentDidMount() {
        this.getData();
        localStorage.clear();
    }

    getData = async () => {
        await this.CampusService.getAll().then(res => {
            if (res && res.status === 200) {
                if (res.data) {
                    this.setState({ campus: res.data.listData });
                }
            }
            else {
                this.Notification.error("Hãy kiểm tra lại kết nối Internet của bạn.", "Error at Internet connection.");
            }

        })
    };

    responseGoogle = async (response) => {
        let resData = response.profileObj;
        let data = { ...this.state.data };
        let campuses = [...this.state.campus];

        if (this.state.chooseCampus === null) {
            this.Notification.error("Hãy chọn campus mà bạn đang học/ làm việc.", "Please, choose a campus.");
            return;
        }

        else {

            if (resData) {
                data.email = resData.email;
                data.imageUrl = resData.imageUrl;
                data.name = resData.name;
                data.username = data.email.substring(0, data.email.indexOf('@'));
            }

            await this.UserService.getUserByEmail(data.email).then(res => {
                if (res && res.status === 200 && res.data && res.data.data) {
                    data.role = res.data.data.roleID;
                }
                else {
                    data.role = 1;
                }
            })

            for (let cam of campuses) {
                if (cam.id === data.campus.id) {
                    data.campus = cam;
                }
            }


            this.setState({
                data: data, redirect: true
            });

            this.context.isAuthen = true;
            this.context.userInfo = data;
            localStorage.setItem('cont', JSON.stringify(this.context));
            setInterval(function(){ localStorage.clear(); }, 60*1000*60);
        }
    }

    onLoginFail = () => {
        this.Notification.error(
            "Tài khoản của bạn không được phép đăng nhập vào hệ thống.", "Don't have permission to access FMS");
    }

    onChange = value => {
        let data = { ...this.state.data };
        data.campus.id = value;
        this.setState({ data: data, chooseCampus: value });
    }

    render() {
        return (
            <>
                <Row noGutters className="container-login-outer">
                    <Col xs={12} sm={12} md={12} lg={12} xl={6} className="container-left-side-login">
                        <div className="left-side-login">
                            <div className="container-exclude-footer">
                                <div className="logo-fpt">
                                    <Image
                                        src={logoFpt}
                                        preview={false}
                                        width={'30%'}
                                    ></Image>
                                </div>
                                <div className="container-login">
                                    <div className="container-infor">
                                        <Row noGutters className="border-box-login-board">
                                            <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                <div className="header-login">FPT Facilities Management System</div>
                                            </Col>
                                            <Col xs={12} sm={12} md={12} lg={12} xl={12} className="common-style-info">
                                                <Select
                                                    className="dropdown-fix-width"
                                                    mode={"combobox"}
                                                    onChange={this.onChange}
                                                    placeholder='Select Campus'
                                                >
                                                    {
                                                        this.state.campus?.map(item => {
                                                            if (item.inService) {
                                                                return <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>
                                                            }

                                                        })
                                                    }
                                                </Select>
                                            </Col>
                                            <Col xs={12} sm={12} md={12} lg={12} xl={12} className="common-style-info">

                                                <GoogleLogin
                                                    clientId={env.ggClientID}
                                                    render={renderProps => (
                                                        <Button
                                                            id="login-button"
                                                            onClick={renderProps.onClick}
                                                        >
                                                            <Image src='../../assets/Google_Logo.png' preview={false} width={24} />
                                                            &nbsp; &nbsp;Sign in with Google
                                                        </Button>

                                                    )}
                                                    buttonText="Login"
                                                    onSuccess={this.responseGoogle}
                                                    onFailure={this.onLoginFail}
                                                    cookiePolicy={'single_host_origin'}
                                                />
                                            </Col>
                                            <Col xs={12} sm={12} md={12} lg={12} xl={12} className="common-style-info">
                                                <Link to='/createTroubleWithoutLogin' className='link-dashboard'>
                                                    <div className="without-button">
                                                        Create Trouble Report
                                                    </div>
                                                </Link>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                            </div>
                            <div className="footer-login">
                                <div className="text-footer">
                                    <b>FPT University</b> © <b>2022</b>, SWP490_G7
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={12} xl={6}>
                        <div className="right-side-login">
                        </div>
                    </Col>
                </Row>

                {
                    (this.state.redirect === true) ?
                        <>
                            <Navigate to="/home" replace={true}></Navigate>
                        </>
                        :
                        null
                }
            </>

        );
    }

}

Login.contextType = AppContext;

export default Login;
