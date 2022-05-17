import clone from "lodash/cloneDeep";
import {formatNumber, request} from '../../util/getErrorMessage'
var app = getApp()
app.globalData.loadingCount = 0
Page({
    data: {
        startX: 0, //开始坐标
        startY: 0,
        isPhoneXSeries: false,
        list: [],
        accountbookIndex: 0,
        accountbookList: [],
    },
    //手指触摸动作开始 记录起点X坐标
    touchstart: function (e) {
        //开始触摸时 重置所有删除
        this.data.list.forEach(function (v, i) {
            if (v.isTouchMove)//只操作为true的
                v.isTouchMove = false;
        })
        this.setData({
            startX: e.changedTouches[0].clientX,
            startY: e.changedTouches[0].clientY,
            list: this.data.list,
        })
    },
    //滑动事件处理
    touchmove: function (e) {
        var that = this,
            index = e.currentTarget.dataset.index,//当前索引
            startX = that.data.startX,//开始X坐标
            startY = that.data.startY,//开始Y坐标
            touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
            touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
            //获取滑动角度
            angle = that.angle({X: startX, Y: startY}, {X: touchMoveX, Y: touchMoveY});
        that.data.list.forEach(function (v, i) {
            v.isTouchMove = false
            //滑动超过30度角 return
            if (Math.abs(angle) > 30) return;
            if (i == index) {
                if (touchMoveX > startX) //右滑
                    v.isTouchMove = false
                else //左滑
                    v.isTouchMove = true
            }
        })
        //更新数据
        that.setData({
            list: that.data.list,
        })
    },
    /**
     * 计算滑动角度
     * @param {Object} start 起点坐标
     * @param {Object} end 终点坐标
     */
    angle: function (start, end) {
        var _X = end.X - start.X,
            _Y = end.Y - start.Y
        //返回角度 /Math.atan()返回数字的反正切值
        return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
    },
    onShow() {
        this.getInvoiceAccountbookIdFromStorage()
        this.getEditInvoiceDetailFromStorage()
    },
    onLoad() {
        this.setData({
            isPhoneXSeries: app.globalData.isPhoneXSeries,
        })
        this.getAccountbookList()
        this.getOcrListFromStorage()
    },
    onHide() {},
    getAccountbookList() {
        this.addLoading()
        request({
            hideLoading: this.hideLoading,
            url: app.globalData.url + 'accountbookController.do?getAccountbooksJsonByUserId&agentId=' + app.globalData.agentId,
            method: 'GET',
            success: res => {
                if(res.data.success && res.data.obj.length) {
                    var accountbookIndex = 0
                    this.setData({
                        accountbookList: res.data.obj,
                        accountbookIndex: accountbookIndex,
                    })
                }else{
                    dd.alert({
                        content: res.data.msg,
                        buttonText: '好的',
                        success: res => {
                            dd.reLaunch({
                                url: '/pages/index/index'
                            })
                        }
                    })
                }
            },
        })
    },
    bindObjPickerChange(e) {
        var name = e.currentTarget.dataset.name
        var listName = e.currentTarget.dataset.list
        var value = e.detail.value
        var index = e.currentTarget.dataset.index
        if(name !== 'accountbookId') {
            this.setData({
                [index]: e.detail.value,
            })
        }else{
            this.setData({
                [index]: e.detail.value,
            })
        }
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
        if (app.globalData.loadingCount <= 0) {
            dd.hideLoading()
        }
    },
    getOcrListFromStorage() {
        const list = dd.getStorageSync({
            key: 'ocrList'
        }).data
        if(list && list.length) {
            this.setData({
                list: list.map(item => ({
                    ...item,
                    uploadType: '2',
                }))
            })
            dd.removeStorage({
                key:'ocrList',
                success: () => {}
            })
        }
    },
    getInvoiceAccountbookIdFromStorage() {
        const accountbookId = dd.getStorageSync({key: 'accountbookId'}).data
        let idx = 0
        if(accountbookId) {
            this.data.accountbookList.forEach((item, index) => {
                if (item.id === accountbookId) {
                    idx = index
                }
            })
            this.setData({
                accountbookIndex: idx,
            })
            dd.removeStorage({
                key: 'accountbookId'
            })
        }
    },
    getEditInvoiceDetailFromStorage() {
        const editInvoiceDetail = dd.getStorageSync({key: 'editInvoiceDetail'}).data
        dd.removeStorage({
            key: 'editInvoiceDetail',
            success: () => {}
        })
        const index = dd.getStorageSync({key: 'editInvoiceDetailIndex'}).data
        if(editInvoiceDetail) {
            const newList = clone(this.data.list)
            newList[index] = editInvoiceDetail
            this.setData({
                list: newList
            })
            dd.removeStorage({
                key: 'editInvoiceDetail'
            })
            dd.removeStorage({
                key: 'editInvoiceDetailIndex'
            })
        }
    },
    goToEdit(e) {
        const index = e.currentTarget.dataset.index
        dd.setStorageSync({
            key: 'editInvoiceDetailIndex',
            data: index
        })
        dd.setStorageSync({
            key: 'accountbookId',
            data: this.data.accountbookList[this.data.accountbookIndex]
        })
        dd.setStorage({
            key: 'editInvoiceDetail',
            data: this.data.list[index],
            success: () => {
                dd.navigateTo({
                    url: '/pages/invoiceInput/index'
                })
            }
        })
    },
    deleteInvoice(e) {
        dd.confirm({
            title: '温馨提示',
            content: '确认删除该发票吗?',
            confirmButtonText: '是',
            cancelButtonText: '否',
            success: res => {
                if(res.confirm) {
                    const index = e.currentTarget.dataset.index
                    const tempList = clone(this.data.list)
                    tempList.splice(index, 1)
                    this.setData({
                        list: tempList
                    })
                }
            }
        })
    },
    submitOcrList() {
        const submitData = this.data.list.map(item => ({
            ...item,
            accountbookId: this.data.accountbookList[this.data.accountbookIndex].id
        }))
        dd.setStorage({
            key: 'selectOcrList',
            data: submitData,
            success: res => {
                dd.navigateBack({
                    delta: 1
                })
            }
        })
    }
})
