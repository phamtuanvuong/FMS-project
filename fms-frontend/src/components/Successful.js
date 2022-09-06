import { Result, Button } from 'antd';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
    trans
} from './CommonFunction';
import { withTranslation } from 'react-i18next';

class Successful extends Component {

    onCreateAnother = () => {
        this.props.options.onCreateAnother();
    }

    onViewDetail = () => {
        this.props.options.onCancel();
    }

    render() {
        let workflowID = this.props.options.workflowID;
        return (
            <>
                <div className="container">
                    <div style={{ marginTop: '100px' }}>
                        <Result
                            status={'success'}
                            title={workflowID === 1 ? trans('trouble:createTrouble.createDraftSuccess') : trans('trouble:createTrouble.createSuccess')}
                            subTitle={workflowID === 1 ? null : trans('trouble:createTrouble.desCreateSuccess')}
                            extra={
                                [
                                    <Link
                                        to={{ pathname: (workflowID === 1 ? '/updateTrouble/' : '/detailTrouble/') + this.props.options.reportID }}
                                    >
                                        <Button className='button-submit button' style={{ height: '40px' }} onClick={this.onViewDetail}>
                                            {trans('trouble:createTrouble.viewDetial')}
                                        </Button>
                                    </Link>,

                                    <Link
                                        to={{ pathname: '/createTrouble' }}
                                    >
                                        <Button className='button-other button' style={{ height: '40px' }} onClick={this.onCreateAnother}>
                                            {trans('trouble:createTrouble.createAnother')}
                                        </Button>
                                    </Link>

                                ]
                            }
                        />
                    </div>
                </div>
            </>
        );
    }

};

export default withTranslation(['trouble', 'common'])(Successful);
