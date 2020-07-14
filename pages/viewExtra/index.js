import moment from "moment";
import clone from "lodash/cloneDeep";
import {formatNumber} from "../../util/getErrorMessage";

const app = getApp()
app.globalData.loadingCount = 0
Page({
    data: {
        isPhoneXSeries: false,
        baoxiaoDetail: null
    },
    onLoad() {
        this.setData({
            isPhoneXSeries: app.globalData.isPhoneXSeries
        })
        dd.getStorage({
            key: 'extraObj',
            success: res => {
                let {subjectExtraConf, extraMessage, applicationAmount} = res.data
                subjectExtraConf = JSON.parse(subjectExtraConf)
                extraMessage = JSON.parse(extraMessage)
                let extraList = []
                const array = this.generateExtraList(subjectExtraConf)
                extraMessage.forEach(item => {
                    extraList.push({conf: array})
                })
                const tempData = {
                    extraList,
                    extraMessage,
                    applicationAmount: formatNumber(Number(applicationAmount).toFixed(2))
                }
                console.log(tempData)
                this.setData({
                    baoxiaoDetail: tempData,
                })
            },
        })
    },
    generateExtraList(conf) {
        var tempData = clone(conf)
        var array = []
        tempData.name.forEach((item, index) => {
            var obj = {}
            obj.field = item
            obj.type = tempData.type[index]
            array.push(obj)
        })
        return array
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
})
