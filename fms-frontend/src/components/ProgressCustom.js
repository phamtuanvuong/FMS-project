import React from "react";
import { Modal, Spin } from "antd";
import 'antd/dist/antd.min.css';

export var showProgress = function () {
    // console.log('show progress');
    this.setState({ visible: true });
};

export var hideProgress = function () {
    // console.log('hideProgress')
    this.setState({ visible: false });
};

class ProgressCustom extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false
        };

    }

    componentDidMount() {
        showProgress = showProgress.bind(this);
        hideProgress = hideProgress.bind(this);
        // console.log('componentDidMount dialog')
    }

    render() {
        return (
            <div style={{
                position: 'relative',
                zIndex: '99999999',
                display: 'block',
                backgroundColor: 'rgba(0,0,0,0.1)',
                border: 'none',
                boxShadow: 'none'
            }}>
                <Modal
                    zIndex={99999999}
                    title={null}
                    visible={this.state.visible}
                    // onOk={this.state.onOk}
                    footer={null}
                    closable={false}
                    width={this.state.width}
                    centered={true}
                    className={'modal-progress'}
                >
                    <Spin size="large" tip="Loading..." />
                </Modal>
            </div>
        );
    }
}

export default ProgressCustom;
