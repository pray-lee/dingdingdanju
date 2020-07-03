import moment from "moment";
import clone from "lodash/cloneDeep";

const app = getApp()
Page({
    data: {
        baoxiaoDetail: {},
        extraList: [],
        extraMessage: [],
        subjectExtraConf: null,
    },
    onLoad() {
        dd.getStorage({
            key: 'subjectExtraConf',
            success: res => {
                this.setData({
                    subjectExtraConf: res.data,
                })
                dd.getStorage({
                    key: 'extraBaoxiaoDetail',
                    success: res1 => {
                        this.setData({
                            baoxiaoDetail: res1.data
                        })
                        if(!res1.data.extraList.length){
                            this.onAddExtra()
                        }
                    }
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
            // 看哪一个是附加信息金额
            this.data.baoxiaoDetail.extraList[0].conf.forEach((item,index) => {
                if(item.field == '金额') {
                    app.globalData.caculateIndex = index
                }
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
        this.setApplicationAmount()
    },
    cancelExtra() {
        dd.navigateBack({
            delta: 1
        })
    },
    onExtraInput(e) {
        var idx = e.currentTarget.dataset.index
        var extraIdx = e.currentTarget.dataset.extraIndex
        var tempData = clone(this.data.baoxiaoDetail)
        tempData.extraMessage[extraIdx][idx] = e.detail.value
        // 算附加信息金额
        const field = tempData.extraList[extraIdx].conf[idx].field
        if(field == '金额') {
            app.globalData.caculateIndex = idx
        }
        this.setData({
            baoxiaoDetail: tempData
        })
        this.setApplicationAmount()
    },
    deleteExtra(e) {
        var idx = e.currentTarget.dataset.index
        var tempData = clone(this.data.baoxiaoDetail)
        if(tempData.extraList.length <= 1) {
            return
        }
        tempData.extraMessage = tempData.extraMessage.filter((item, index) => index != idx)
        tempData.extraList = tempData.extraList.filter((item, index) => index != idx)
        this.setData({
            baoxiaoDetail: tempData
        })
        this.setApplicationAmount()
    },
    setApplicationAmount() {
        let applicationAmount = 0
        this.data.baoxiaoDetail.extraMessage.forEach(item => {
            applicationAmount += Number(item[app.globalData.caculateIndex])
        })
        this.setData({
            baoxiaoDetail:{
                ...this.data.baoxiaoDetail,
                applicationAmount
            }
        })
    },

    onExtraSubmit() {
        // this.onExtraHide()
        this.addLoading()
        this.setApplicationAmount()
        var tempData = clone(this.data.baoxiaoDetail)
        console.log(tempData, 'tempDasta')
        let applicationAmount = 0
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
