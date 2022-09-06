import { env } from '../../../constants/Constants';
import { BaseApi } from "../../BaseApi";
import {
    DASH_CHECKLIST,
    DASH_WAREHOUSE
} from "../../../constants/AppPath";

export class HomeService extends BaseApi {

    geChecklistNotify = async () => {
        var url = env.path + DASH_CHECKLIST;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    geWarehouseNotify = async () => {
        var url = env.path + DASH_WAREHOUSE;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }


}