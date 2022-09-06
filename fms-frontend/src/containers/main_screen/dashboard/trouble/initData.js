import moment from 'moment';
export function initData(data, userInfo) {
    console.log(data);
    let report =  {
        id: data.id,
        areaID: data.area,
        summary: data.summary,
        emergency: data.emergency ? true : false,
        description: data.description,
        inAreaTime: moment(data.inAreaTime),
        workflowID: data.status,
        createdBy: userInfo ? userInfo.username : "Anonymous"
    };
    let reportImage = data.fileList;

    let shooting = {
        id: data.shootingId,
        reportID: data.id,
        technician: data.technician,
        categoryID: data.category || 0,
        resolved: data.isResolved,
        priority: data.priority || 0,
        issueReview: data.issueReview,
        solution: data.solution,
        createdBy: userInfo ? userInfo.username : "Anonymous"
    };
    let shootImage = data.fileListResolveImage;

    
    return {
        report : report,
        reportImage : reportImage,
        shootImage : shootImage,
        shooting : shooting
    };
}