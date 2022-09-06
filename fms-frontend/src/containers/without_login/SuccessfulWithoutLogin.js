import { Result, Button } from 'antd';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import {
    trans
} from '../../components/CommonFunction';

class SuccessfulWithoutLogin extends Component {

    onCreateAnother = () => {
        this.props.options.onCreateAnother();
    }

    render() {
        // console.log(this.props.options.reportID, 'check report id');
        return (
            <>
                <div className="container-without-login">
                    <div style={{ marginTop: '100px' }}>
                        <Result
                            status={'success'}
                            title={'Create trouble report successfully!'}
                            subTitle={'Thanks for the information you provided, we will get back to you soon!'}
                            extra={
                                [                                  
                                    <Link
                                        to={{ pathname: '/createTroubleWithoutLogin'}}
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

export default withTranslation(['trouble', 'common'])(SuccessfulWithoutLogin);
