import moment from "moment";
import clone from "lodash/cloneDeep";
import {formatNumber, validFn} from "../../util/getErrorMessage";

const app = getApp()
Page({
    data: {
        isPhoneXSeries: false,
        btnHidden: false,
        importList: [],
    },
    onLoad() {
        this.setData({
            isPhoneXSeries: app.globalData.isPhoneXSeries
        })

    },
    getImportListFromStorage() {
        const importList = dd.getStorageSync({key: 'importList'}).data
        const savedImportList = dd.getStorageSync({key: 'savedImportList'}).data
        if(!!importList) {
            this.setData({
                importList: Object.assign([], importList, savedImportList)
            })
        }
        dd.removeStorageSync({
            key: 'savedImportList'
        })
        dd.removeStorageSync({
            key: 'importList'
        })
    },
    onShow() {
        this.getImportListFromStorage()
    },
    onInput(e) {
        const value = e.detail.value
        const id = e.currentTarget.dataset.id
        const tempData = clone(this.data.importList)
        tempData.forEach(item => {
            if(item.id === id) {
                item.unverifyAmount = value
            }
        })
        this.setData({
            importList: tempData
        })
    },
    saveImportList() {
        dd.setStorage({
            key: 'importList',
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
