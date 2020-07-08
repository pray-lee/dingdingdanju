import moment from "moment";
import clone from "lodash/cloneDeep";
import {formatNumber, validFn} from "../../util/getErrorMessage";

const app = getApp()
Page({
    data: {
        result: null
    },
    onLoad() {
        dd.getStorage({
            key: 'extraObj',
            success: res => {
                this.setData({
                    result: res.data,
                })
            }
        })
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
