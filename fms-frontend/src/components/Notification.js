import { notification } from "antd";

export class Notification {
    success = (mess, title = 'Successfully') => {
        return notification.success({
            message: title,
            description: mess
        });
    }

    error = (mess, title = 'Error') => {
        return notification.error({
            message: title,
            description: mess
        });
    }

    info = (mess, title = 'Notification') => {
        return notification.info({
            message: title,
            description: mess
        });
    }
}