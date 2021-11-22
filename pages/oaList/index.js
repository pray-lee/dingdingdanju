var app = getApp()
app.globalData.loadingCount = 0
import {formatNumber, request} from '../../util/getErrorMessage'

Page({
    data: {
        isPhoneXSeries: false,
        undo: true,
        list: [
            {formatTotalAmount: '1.1111', remark: '哈哈哈', billName: '单据名称', billCode: '12987398123'},
            {formatTotalAmount: '1.1111', remark: '哈哈哈', billName: '单据名称', billCode: '12987398123'},
            {formatTotalAmount: '1.1111', remark: '哈哈哈', billName: '单据名称', billCode: '12987398123'},
        ],
        scrollTop: 0,
        statusObj: {
            10: "待提交",
            20: "待审批",
            25: "审批驳回",
            30: "已审批",
            60: "已提交付款",
            80: "已付款",
            100: "已完成"
        },
    },
    onLoad() {
        console.log(1)
        this.getOaList()
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
    getOaList() {
        const url = this.data.undo ?
            app.globalData.url + 'oaTaskController.do?todoDatagrid&field=id,accountbookId,billType,billCode,taskName,billId,createDate,processInstanceId'
            :
            app.globalData.url + 'oaTaskController.do?finishDatagrid&field=id,accountbookId,billType,billCode,taskName,billId,createDate,processInstanceId'
        this.addLoading()
        request({
            hideLoading: this.hideLoading,
            url,
            method: 'GET',
            success: res => {
                console.log(res)
            }
        })
    },
    toggleUndo() {
        this.setData({
            undo: !this.data.undo
        })
        this.getOaList()
    }
})
