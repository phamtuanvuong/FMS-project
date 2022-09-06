import { env } from '../../../constants/Constants';
import { BaseApi } from "../../BaseApi";
import {
    CAMPUS_GET_ALL,
    USER_GET_USER_BY_EMAIL,
    USER_GET_LIST,
    USER_SAVE,
    USER_DELETE,
    ROLE_GET_ALL,
    USER_CHANGE_ACTIVE,
    GET_BY_ROLE,
    CAMPUS_GET_ALL_NO_CONDITION
} from "../../../constants/AppPath";

export class UserService extends BaseApi {

    getAllCampus = async () => {
        var url = env.path + CAMPUS_GET_ALL;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getAllCampusNoCondition = () => {
        var url =  env.path + CAMPUS_GET_ALL_NO_CONDITION;
        try{
            let res = this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    deleteUser = async (data) => {
        var url = env.path + USER_DELETE + '?username=' + data;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    saveUser = async (item) => {
        var url = env.path + USER_SAVE;
        try {
            let res = await this.execute_post(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    changeIsActive = async (data) => {
        var url = env.path + USER_CHANGE_ACTIVE;
        try {
            let res = await this.execute_post(url, data);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getUserByEmail = async (email) => {
        var url = env.path + USER_GET_USER_BY_EMAIL + '?email=' + email;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getListUser = async (item) => {
        var url = env.path + USER_GET_LIST;
        try {
            let res = await this.execute_post(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getAllRole = async () => {
        var url = env.path + ROLE_GET_ALL;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getByRole = async (role) => {
        var url = env.path + GET_BY_ROLE + role;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }
}