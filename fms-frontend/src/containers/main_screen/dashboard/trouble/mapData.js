// export 

export function mapData(data, apiData, userInfo) {
    // console.log(apiData);
    data.summary = apiData?.report?.summary;
    data.emergency = apiData?.report?.emergency;
    data.description = apiData?.report?.description;
    data.status = apiData?.report?.workflowID;
    data.fileList = apiData?.reportImage;
    data.technician = apiData?.shooting?.technician;
    data.inAreaTime = apiData?.report?.inAreaTime;
    data.reporter = apiData?.report?.createdBy;
    data.location = apiData?.report?.locationCode;
    data.areaID = apiData?.report?.areaID;
    data.id = apiData?.report?.id;
    data.priority = apiData?.shooting?.priority === 0 ? null : apiData?.shooting?.priority;
    data.shootingId = apiData?.shooting?.id;
    data.isResolved = apiData?.shooting?.resolved;
    data.issueReview = apiData?.shooting?.issueReview;
    data.solution = apiData?.shooting?.solution;
    data.fileListResolveImage = apiData?.shootImage;
    data.category = apiData?.shooting?.categoryID === 0 ? null : apiData?.shooting?.categoryID;
    if (data.permission) {
        data.permission.reporter = (data.status <= 2);
        data.permission.reporter = data.permission.reporter && (userInfo.username === data.reporter);
        data.permission.technician = userInfo.username === data.technician?.toLowerCase();
        // debugger;
        data.permission.manager = (userInfo.role === 2 || userInfo.role === 3);
    }

    data.currentStatus = apiData?.report?.workflowID;
    data.currentTechnician = apiData?.shooting?.technician;
    
    return data;
}



