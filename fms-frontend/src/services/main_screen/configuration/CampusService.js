import { env } from '../../../constants/Constants';
import { BaseApi } from "../../BaseApi";
import {
    CAMPUS_GET_ALL,
    CAMPUS_SAVE,
    CAMPUS_DELETE,
    CAMPUS_GETLIST,
    CAMPUS_CHANGE_ACTIVE,
    CAMPUS_GETLIST_NO_CONDITION,
    CAMPUS_GET_ALL_NO_CONDITION
} from "../../../constants/AppPath";

export class CampusService extends BaseApi {
    getAll = () => {
        var url =  env.path + CAMPUS_GET_ALL;
        try{
            let res = this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getAllNoCondition = () => {
        var url =  env.path + CAMPUS_GET_ALL_NO_CONDITION;
        try{
            let res = this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    changeIsActive = (data) => {
        var url = env.path + CAMPUS_CHANGE_ACTIVE;
        try {
            let res = this.execute_post(url, data);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    saveCampus = (data) => {
        var url =  env.path + CAMPUS_SAVE;
        try{
            let res = this.execute_post(url, data);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    deleteCampus = (id) =>{
        var url =  env.path + CAMPUS_DELETE+ '?id=' +id;
        try{
            let res = this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getList = (data) => {
        var url =  env.path + CAMPUS_GETLIST;
        try{
            let res = this.execute_post(url, data);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getListNoCondition = (data) => {
        var url =  env.path + CAMPUS_GETLIST_NO_CONDITION;
        try{
            let res = this.execute_post(url, data);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }
}