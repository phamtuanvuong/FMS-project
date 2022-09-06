import moment from 'moment';
import { Trans } from 'react-i18next';

export const onChangeValue = (context, name, value) => {
    // console.log(value)
    let data = { ...context.state.data };
    let errors = { ...context.state.errors };
    data[name] = value;
    errors[name] = '';

    context.setState({
        data,
        errors
    });
}

export const onChangeSelectBox = (context, name, value) => {
    let data = { ...context.state.data };
    let errors = { ...context.state.errors };

    data[name] = value.children;
    errors[name] = '';

    context.setState({
        data: data,
        errors
    });
}

export const onChangeDate = (context, name, dateString) => {
    console.log(dateString);
    const data = context.state.data;
    context.setState({
        data: {
            ...data,
            [name]: dateString
        }
    })
};

export const focusInvalidInput = (errors) => {
    // const arrayError = Object.keys(errors);
    // let i = 0;
    // for (i = 0; i < arrayError.length; i++) {
    //     if (errors[arrayError[i]].error === 'error') break;
    // }
    // console.log('check array errors', errors);
    // const id = arrayError[i];
    // console.log(id, 'checl ID');
    // const element = document.getElementById(id);
    // console.log(element, 'check ID');
    const id = Object.keys(errors)[0];
    const element = document.getElementById(id);

    if (element) {
        element.focus();
    }
};

export const stringNullOrEmpty = (string) => {
    if (string === undefined || string === null || string === "") return true
    return false
}

export const validateEmpty = (data, listFields, message) => {
    let isValid = true, errors = {};
    listFields.map(field => {
        if (!stringNullOrEmpty(field) && (stringNullOrEmpty(data[field]) || String(data[field]).trim() === ""
            || data[field].length === 0)) {
            isValid = false;
            errors[field] = <Trans i18nKey={'common:error.empty'}></Trans>;
            if (field === message?.field) {
                errors[field] = message.message;
            }
        }
    });
    return [isValid, errors];
}

export const isUndefindOrEmptyForItemForm = (variable) => {
    if (variable === '' || variable === undefined) {
        return '';
    }
    return 'error';
}

export const onChangeSelectBoxValue = (context, name, value) => {
    let data = { ...context.state.data };
    let errors = { ...context.state.errors };

    data[name] = value.value;
    errors[name] = '';

    context.setState({
        data: data,
        errors
    });
}

export const formatDateDataTable = (value) => {
    if (value) {
        return moment(value, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY');
    }
    return null;

}

export const handleHideNav = function () {
    let target = document.getElementById('navigation-bar');
    // console.log(target);
    let hasClass = target.classList.contains('show-navigation');
    if (hasClass) {
        target.classList.remove('show-navigation');
    }
}

export const trans = (name) => {
    // console.log(<Trans i18nKey={name} />)
    return <Trans i18nKey={name} />;
}