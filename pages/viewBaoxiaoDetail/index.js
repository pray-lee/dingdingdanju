import {formatNumber} from "../../util/getErrorMessage";
import clone from 'lodash/cloneDeep'

const app = getApp()
Page({
    data: {
        baoxiaoDetail: null
    },
    onLoad() {
        dd.getStorage({
            key: 'baoxiaoDetail',
            success: res => {
                const baoxiaoDetail = clone(res.data)
                baoxiaoDetail.applicationAmount = formatNumber(Number(baoxiaoDetail.applicationAmount).toFixed(2))
                this.setData({
                    baoxiaoDetail
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
        const extraMessage = this.data.baoxiaoDetail.extraMessage
        const subjectExtraConf =this.data.baoxiaoDetail.subjectExtraConf
        const applicationAmount = this.data.baoxiaoDetail.applicationAmount
        dd.setStorage({
            key: 'extraObj',
            data: {
                extraMessage,
                subjectExtraConf,
                applicationAmount
            },
            success: res => {
                dd.navigateTo({
                    url: '/pages/viewExtra/index'
                })
            }
        })
    }
})
