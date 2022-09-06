import React, { Component, useState } from "react";

import AppContext from "./AppContext";

export default class extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: 'nhatbnhe140280@fpt.edu.vn',
            imageUrl: '',
            name: '',
            role: '',
            campus: ''
        }

        this.updateAppContext = this.updateAppContext.bind(this);
    }

    updateAppContext(data){
        this.setState({
            email : data.email,
            imageUrl : data.imageUrl,
            name : data.name,
            role : data.role,
            campus : data.campus
        });
    }
    render() {
        return (
            <>
                <AppContext.Provider value={{data : this.state, updateContext : this.updateAppContext}} >
                    {this.props.children}
                </AppContext.Provider>
            </>
        );
    }
}