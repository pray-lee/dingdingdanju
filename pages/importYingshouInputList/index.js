import moment from "moment";
import clone from "lodash/cloneDeep";
import {formatNumber, validFn} from "../../util/getErrorMessage";

const app = getApp()
Page({
    data: {
        isPhoneXSeries: false,
        btnHidden: false,
        importList: [],
        remarkIndex: 0,
        remarks: []
    },
    onLoad() {
        this.setData({
            isPhoneXSeries: app.globalData.isPhoneXSeries
        })
    },
    bindObjPickerChange(e) {
        var id = e.currentTarget.dataset.id
        var value = e.detail.value
        // 设置当前框的值
        const importList = this.data.importList.map(item => {
            if(item.id === id) {
                item.remarkIndex = value
                item.remark = this.data.remarks[value].remark
            }
            return item
        })
        this.setData({
           importList
        })
    },
    getImportListFromStorage() {
        const importList = dd.getStorageSync({key: 'importList'}).data
        const savedImportList = dd.getStorageSync({key: 'savedImportList'}).data || []
        console.log(importList, savedImportList)
        if(importList.length) {
            let oldList = savedImportList.concat()
            if(oldList.length) {
                for(let i = 0; i < importList.length; i++) {
                    if(oldList.every(item => item.id !== importList[i].id)) {
                        oldList.push(importList[i])
                    }else{
                        oldList = oldList.map(item => {
                            if(item.id === importList[i].id) {
                                return Object.assign({}, item, importList[i])
                            }else{
                                return item
                            }
                        })
                    }
                    // 数据组合
                    this.setData({
                        importList: oldList
                    })
                }
            }else{
                this.setData({
                    importList: oldList.concat(importList)
                })
            }
        }else{
            this.setData({
                importList: savedImportList
            })
        }
        this.data.importList.forEach(item => {
            item.applicationAmount = item.unverifyAmount
            this.data.remarks.forEach((remark, index) => {
                if(item.remark === remark) {
                    item.remarkIndex = index
                }else{
                    item.remarkIndex = 0
                }
            })
        })
        dd.removeStorageSync({
            key: 'savedImportList'
        })
        dd.removeStorageSync({
            key: 'importList'
        })
    },
    // 获取开票内容
    getRemarksFromStorage(){
        const remarks = dd.getStorageSync({key: 'remarks'}).data
        if(!!remarks && remarks.length) {
            this.setData({
                remarks,
            })
        }
    },
    onShow() {
        this.getRemarksFromStorage()
        this.getImportListFromStorage()
    },
    onInput(e) {
        const value = e.detail.value
        const id = e.currentTarget.dataset.id
        const tempData = clone(this.data.importList)
        tempData.forEach(item => {
            if(item.id === id) {
                item.applicationAmount = value
            }
        })
        this.setData({
            importList: tempData
        })
    },
    saveImportList() {
        dd.removeStorageSync({
            key: 'tempImportList'
        })
        this.data.importList.forEach(item => {
            item.formatApplicationAmount = formatNumber(Number(item.applicationAmount).toFixed(2))
            item.billId = item.id
            item.subjectName = item['subjectEntity.fullSubjectName']
        })
        dd.setStorage({
            key: 'importCommonList',
            data: this.data.importList,
            success: () => {
                dd.navigateBack({
                    delta: 2
                })
            }
        })
    },
    suppleImportList() {
        dd.setStorage({
            key: 'savedImportList',
            data: this.data.importList,
            success: () => {
                dd.navigateBack({
                    delta: 1
                })
            }
        })
    },
    deleteImportInputList(e) {
        const id = e.currentTarget.dataset.id
        const importList = this.data.importList.filter(item => item.id !== id)
        this.setData({
            importList
        })
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
    onKeyboardShow() {
        this.setData({
            btnHidden: true
        })
    },
    onKeyboardHide() {
        this.setData({
            btnHidden: false
        })
    }
})
