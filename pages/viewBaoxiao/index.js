import {formatNumber} from "../../util/getErrorMessage";
import clone from 'lodash/cloneDeep'

var app = getApp()
app.globalData.loadingCount = 0
Page({
    data: {
        result: null,
        process: null,
    },
    addLoading() {
        if (app.globalData.loadingCount < 1) {
            dd.showLoading({
                content: '加载中...'
            })
        }
        app.globalData.loadingCount++
    },
    hideLoading() {
        app.globalData.loadingCount--
        if (app.globalData.loadingCount === 0) {
            dd.hideLoading()
        }
    },
    previewFile(e) {
        var url = e.currentTarget.dataset.url
        dd.previewImage({
            urls: [url],
        })
    },
    onLoad(query) {
        this.addLoading()
        const id = query.id
        dd.httpRequest({
            url: app.globalData.url + 'reimbursementBillController.do?getDetail&id=' + id,
            method: 'GET',
            dataType: 'json',
            success: res => {
                if (res.data.obj) {
                    const result = clone(res.data.obj)
                    result.applicationAmount = formatNumber(Number(result.applicationAmount).toFixed(2))
                    result.verificationAmount = formatNumber(Number(result.verificationAmount).toFixed(2))
                    result.totalAmount = formatNumber(Number(result.totalAmount).toFixed(2))
                    result.billDetailList.forEach(item => {
                        item.formatApplicationAmount = formatNumber(Number(item.applicationAmount).toFixed(2))
                    })
                    this.setData({
                        result
                    })
                    // 获取钉钉审批流
                    this.getProcessInstance(result.id, result.accountbookId)
                }
                this.hideLoading()
            }
        })
    },
    getProcessInstance(billId, accountbookId) {
        this.addLoading()
        dd.httpRequest({
            url: app.globalData.url + 'dingtalkController.do?getProcessinstanceJson&billType=9&billId=' + billId + '&accountbookId=' + accountbookId,
            method: 'GET',
            dataType: 'json',
            success: res => {
                const { title, operationRecords, tasks, ccUserids } = res.data[0]
                const taskArr = tasks.filter(item => {
                    if(item.taskStatus === 'RUNNING') {
                        if(item.userid.split(',')[2]){
                            item.userName = item.userid.split(',')[2]
                            item.realName = item.userid.split(',')[0].length > 1 ? item.userid.split(',')[0].slice(-2) : item.userid.split(',')[0]
                        }else{
                            item.userName = item.userid.split(',')[0].length > 1 ? item.userid.split(',')[0].slice(-2) : item.userid.split(',')[0]
                        }
                        item.avatar = item.userid.split(',')[1]
                        item.resultName = '（审批中）'
                        item.operationName = '审批人'
                        return item
                    }
                })
                console.log(taskArr)

                const operationArr = operationRecords.filter(item => {
                    if(item.userid.split(',')[2]){
                        item.userName = item.userid.split(',')[2]
                        item.realName = item.userid.split(',')[0].length > 1 ? item.userid.split(',')[0].slice(-2) : item.userid.split(',')[0]
                    }else{
                            item.userName = item.userid.split(',')[0].length > 1 ? item.userid.split(',')[0].slice(-2) : item.userid.split(',')[0]
                    }
                    item.avatar = item.userid.split(',')[1]
                    if(item.operationType === 'START_PROCESS_INSTANCE') {
                        item.operationName = '发起审批'
                    } else if(item.operationType !== 'NONE') {
                        item.operationName = '审批人'
                    }
                    if(item.operationResult === 'AGREE') {
                        item.resultName = '（已同意）'
                    }else if(item.operationResult === 'REFUSE') {
                        item.resultName = '（已拒绝）'
                    }else{
                        item.resultName = ''
                    }
                    if(item.operationType !== 'NONE') {
                        return item
                    }
                })
                this.setData({
                    process: {
                        title,
                        operationRecords: operationArr,
                        tasks: taskArr,
                        ccUserids
                    }
                })
            },
            complete: res => {
                this.hideLoading()
            }
        })
    },
    showBaoxiaoDetail(e) {
        const index = e.currentTarget.dataset.index
        const tempData = clone(this.data.result.billDetailList[index])
        tempData.taxpayerType = this.data.result.accountbook.taxpayerType
        dd.setStorage({
            key: 'baoxiaoDetail',
            data: tempData,
            success: res => {
                dd.navigateTo({
                    url: '/pages/viewBaoxiaoDetail/index'
                })
            }
        })
    }
})
