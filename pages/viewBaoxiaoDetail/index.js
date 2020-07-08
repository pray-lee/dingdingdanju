import {formatNumber} from "../../util/getErrorMessage";

const app = getApp()
Page({
    data: {
        baoxiaoDetail: null
    },
    onLoad() {
        dd.getStorage({
            key: 'baoxiaoDetail',
            success: res => {
                this.setData({
                    baoxiaoDetail: res.data
                })
                dd.removeStorage({
                    key: 'baoxiaoDetail',
                    success: res => {
                        console.log('删除查看报销详情成功....')
                    }
                })
            }
        })
    },
    openExtraInfo(e) {
        const extraMessage = e.currentTarget.dataset.extraMessage
        const subjectExtraConf = e.currentTarget.dataset.subjectExtraConf
        dd.setStorage({
            key: 'extraObj',
            data: {
                extraMessage,
                subjectExtraConf
            },
            success: res => {
                dd.navigateTo({
                    url: '/pages/viewExtra/index'
                })
            }
        })
    }
})
