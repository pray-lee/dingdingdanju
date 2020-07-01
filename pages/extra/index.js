import moment from "moment";
import clone from "lodash/cloneDeep";

const app = getApp()
Page({
    data: {
        baoxiaoDetail: {},
        extraList: [],
        extraMessage: [],
        subjectExtraConf: null
    },
    onLoad() {
        dd.getStorage({
            key: 'subjectExtraConf',
            success: res => {
                this.setData({
                    subjectExtraConf: res.data,
                })
            }
        })
        dd.getStorage({
            key: 'extraBaoxiaoDetail',
            success: res => {
               this.setData({
                   baoxiaoDetail: res.data
               })
            }
        })
    },
    onShow() {},

    onAddExtra() {
        if (this.data.subjectExtraConf) {
            var obj = this.generateExtraList(this.data.subjectExtraConf)
            var tempData = clone(this.data.baoxiaoDetail)
            tempData.extraList.push({conf: obj.array})
            tempData.extraMessage.push(obj.extraMessage)
            this.setData({
                baoxiaoDetail: tempData
            })
        }
    },

    generateExtraList(conf) {
        var tempData = clone(conf)
        var array = []
        var extraMessage = []
        tempData.name.forEach((item, index) => {
            var obj = {}
            obj.field = item
            obj.type = tempData.type[index]
            array.push(obj)
            if (obj.type == 2) {
                extraMessage.push(moment().format('YYYY-MM-DD'))
            } else {
                extraMessage.push('')
            }
        })
        return {
            array,
            extraMessage
        }
    },
    onExtraDateFocus(e) {
        var idx = e.currentTarget.dataset.index
        var extraIdx = e.currentTarget.dataset.extraIndex
        dd.datePicker({
            format: 'yyyy-MM-dd',
            currentDate: moment().format('YYYY-MM-DD'),
            success: (res) => {
                // var tempData = this.data.extraMessage.concat()
                // tempData[extraIndex][idx] = res.date
                // this.setData({
                //     extraMessage: tempData
                // })
                var tempData = clone(this.data.baoxiaoDetail)
                if (!!res.date) {
                    tempData.extraMessage[extraIdx][idx] = res.date
                    this.setData({
                        baoxiaoDetail: tempData
                    })
                }
                // 解除focus不触发的解决办法。
                this.onClick()
            },
        })
    },
    onExtraBlur(e) {
        var idx = e.currentTarget.dataset.index
        var extraIdx = e.currentTarget.dataset.extraIndex
        var tempData = clone(this.data.baoxiaoDetail)
        tempData.extraMessage[extraIdx][idx] = e.detail.value
        this.setData({
            baoxiaoDetail: tempData
        })
    },
    cancelExtra() {
        dd.navigateBack({
            delta: 1
        })
    },
    deleteExtra(e) {
        var idx = e.currentTarget.dataset.index
        var tempData = clone(this.data.baoxiaoDetail)
        tempData.extraMessage = tempData.extraMessage.filter((item, index) => index != idx)
        tempData.extraList = tempData.extraList.filter((item, index) => index != idx)
        this.setData({
            baoxiaoDetail: tempData
        })
    },
    onExtraSubmit() {
        // this.onExtraHide()
        this.addLoading()
        var tempData = clone(this.data.baoxiaoDetail)
        tempData.subjectExtraConf = JSON.stringify(this.data.subjectExtraConf)
        dd.setStorage({
            key: 'baoxiaoDetail',
            data: tempData,
            success: res => {
                this.hideLoading()
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
})