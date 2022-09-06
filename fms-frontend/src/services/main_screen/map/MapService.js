import { env } from '../../../constants/Constants';
import { BaseApi } from "../../BaseApi";
import {
    MAP_GET_MAP,
    MAP_GET_ALL_TYPE_ROOM,
    CAMPUS_GET_ALL,
    LOCATION_GET_ALL,
    LOCATION_GET_LIST,
    MAP_GET_AREA_SELECT,
    MAP_SAVE_MAP
} from "../../../constants/AppPath";

export class MapService extends BaseApi {
    getAllTypeRoom = () => {
        var url =  env.path + MAP_GET_ALL_TYPE_ROOM;
        try{
            let res = this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }   

    getMap = (data) => {
        var url = env.path + MAP_GET_MAP;
        try {
            let res = this.execute_post(url, data);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    saveMap = (data) => {
        var url = env.path + MAP_SAVE_MAP;
        try {
            let res = this.execute_post(url, data);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getAreaSelect = (data) => {
        var url = env.path + MAP_GET_AREA_SELECT;
        try {
            let res = this.execute_post(url, data);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getAllCampus = () => {
        var url =  env.path + CAMPUS_GET_ALL;
        try{
            let res = this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getAllLocation = async () => {
        var url =  env.path + LOCATION_GET_ALL;
        try{
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getListLocation = async (data) => {
        var url = env.path + LOCATION_GET_LIST;
        try {
            let res = await this.execute_post(url, data);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

}