import { env } from '../../../constants/Constants';
import { BaseApi } from "../../BaseApi";
import {
    CATEGORY_GET_ALL,
    CATEGORY_SAVE,
    CATEGORY_GET_LIST,
    CATEGORY_DELETE
} from "../../../constants/AppPath";

export class AssetCategoryService extends BaseApi {

    getAllCategory = async () => {
        var url = env.path + CATEGORY_GET_ALL;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    deleteCategory = async (data) => {
        var url = env.path + CATEGORY_DELETE + '?id=' + data;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    saveCategory = async (item) => {
        var url = env.path + CATEGORY_SAVE;
        try {
            let res = await this.execute_post(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getListCategory = async (item) => {
        var url = env.path + CATEGORY_GET_LIST;
        try {
            let res = await this.execute_post(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }
}