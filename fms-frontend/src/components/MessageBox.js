import React from "react";
import { Modal, Button } from "antd";
import '../layout/Common.css';

const _ = require('lodash');

export var hideDialogConfirm = function () {
    this.setState({
        visible: false,
        content: ''
    });
};

export var showConfirm = function (
    _message,
    _onConfirm,
    _title = '',
    _onNotConfirm = null
) {
    this.setState({
        visible: true,
        color: '',
        background: '#007292',
        buttonColor: '#007292',
        showConfirmBtn: true,
        title: _title,
        message: _message,
        onConfirm: _onConfirm,
        onNotConfirm: _onNotConfirm,
        type: "confirm"
    });
    // document.getElementById("btnConfirmYes").focus();
};

class MessageBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            // className: 'modal-primary'
        };

        this.onCancel = this.onCancel.bind(this);
    }

    componentDidMount() {
        showConfirm = showConfirm.bind(this);

        hideDialogConfirm = hideDialogConfirm.bind(this);
        // console.log('componentDidMount dialog')
    }


    onCancel = () => {
        if (this.state.onCancel)
            this.state.onCancel();
        else hideDialogConfirm();
    }

    onConfirm = () => {
        if (this.state.onConfirm)
            this.state.onConfirm();
    }

    render() {

        return (
            <div>
                <Modal
                    style={{ top: "170px" }}
                    title={this.state.title}
                    visible={this.state.visible}
                    // onOk={this.state.onConfirm}
                    footer={[
                        <Button id="btnConfirmYes" key="submit" type="primary" onClick={this.onConfirm}>
                            Confirm
                        </Button>,
                        <Button key="back" onClick={this.onCancel}>
                            Cancel
                        </Button>
                    ]}
                    confirmLoading={this.state.confirmLoading}
                    onCancel={this.onCancel}
                    width={"20%"}
                    className="message-modal"
                >
                    {this.state.message}
                </Modal>
            </div>
        );

    }
}

export default MessageBox;

