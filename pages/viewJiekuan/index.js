import moment from 'moment';
import clone from "lodash/cloneDeep";
import {getErrorMessage, submitSuccess, formatNumber} from "../../util/getErrorMessage";

var app = getApp()
Page({
    data: {
        result: null
    },
    addLoading() {
        if (app.globalData.loadingCount < 1) {
            dd.showLoading({
                content: '加载中...'
            })
        }
        app.globalData.loadingCount += 1
    },
    hideLoading() {
        if (app.globalData.loadingCount <= 1) {
            dd.hideLoading()
            app.globalData.loadingCount = 0
        } else {
            app.globalData.loadingCount -= 1
        }
    },
    onHide() {
        // 清理借款人缓存
        dd.removeStorage({
            key: 'borrowId',
            success: function () {
                console.log('借款人缓存删除成功')
            }
        });
    },
    previewFile(e) {
        var url = e.currentTarget.dataset.url
        dd.previewImage({
            urls: [url],
        })
    },
    onLoad(query) {
        console.log(query.id)
        this.addLoading()
        dd.httpRequest({
            url: app.globalData.url + 'borrowBillController.do?getDetail&id=' + query.id,
            method: 'GET',
            dataType: 'json',
            success: res => {
                console.log(res.data.obj)
                if(res.data.success) {
                    this.setData({
                        result: res.data.obj
                    })
                }else{
                    dd.showToast({
                        type: 'none',
                        content:'数据请求失败'
                    })
                }
            },
            fail: res => {
                dd.showToast({
                    type: 'none',
                    content:'数据请求失败'
                })
            },
            complete: res => {
                console.log('complete', res)
                this.hideLoading()
            }
        })
    },
})
