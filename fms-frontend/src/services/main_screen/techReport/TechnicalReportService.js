import { env } from '../../../constants/Constants';
import { BaseApi } from "../../BaseApi";
import {
    TECH_REPORT_EXPORT_REPORT,
    TECH_REPORT_GET_REPORT
} from "../../../constants/AppPath";

export class TechnicalReportService extends BaseApi {

    getReport = async (data) => {
        var url = env.path + TECH_REPORT_GET_REPORT;
        try {
            let res = await this.execute_post(url, data);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    exportReport = async (item) =>{
        var url = env.path + TECH_REPORT_EXPORT_REPORT;
        try {
            let res = await this.export(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

}