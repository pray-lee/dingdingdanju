var app = getApp()
app.globalData.loadingCount = 0
import {formatNumber, request} from '../../util/getErrorMessage'
Page({
    data: {
        type: 'zzs',
        typeClass: 'zzs',
        typeText: '增值税发票',
        zzsIndex: 0,
        zzsList: [
            {
                name: '专用',
                invoiceType: '01'
            },
            {
                name: '电子专用',
                invoiceType: '08'
            },
            {
                name: '普通',
                invoiceType: '04'
            },
            {
                name: '电子普通',
                invoiceType: '10'
            },
        ],
        hidden: true,
        topHidden: true,
        animationImg: {},
        animationInfoTopList: {},
        submitData: {
            invoiceType: 'zzs'
        }
    },
    onShow() {
        var animationImg = dd.createAnimation({
            duration: 250,
            timeFunction: 'linear',
            transformOrigin: 'center center'
        })
        this.animationImg = animationImg
        animationImg.rotate(0).step()

        var animationTopList = dd.createAnimation({
            duration: 250,
            timeFunction: 'linear',
        })
        this.animationTopList = animationTopList
        animationTopList.translateY('-200%').step()
        this.setData({
            animationInfoTopList: animationTopList.export()
        })

    },
    onHide() {

    },
    onLoad() {

    },
    toggleHidden() {
        this.setData({
            hidden: !this.data.hidden
        })
        if (this.data.hidden) {
            this.animationImg.rotate(0).step()
            this.animationTopList.translateY('-200%').step()
            const t = setTimeout(() => {
                this.setData({
                    topHidden: true
                })
                clearTimeout(t)
            })
        } else {
            this.setData({
                topHidden: false
            })
            this.animationImg.rotate(180).step()
            this.animationTopList.translateY(0).step()
        }
        this.setData({
            animationInfoImg: this.animationImg.export(),
            animationInfoTopList: this.animationTopList.export(),
        })
    },
    toggleTemplate(e) {
        this.animationImg.rotate(0).step()
        this.animationTopList.translateY('-200%').step()
        const type = e.currentTarget.dataset.type
        const typeClass = e.currentTarget.dataset.class
        this.setTypeText(type, typeClass)
    },
    setTypeText(type, typeClass) {
        let typeText = ''
        switch(type) {
            case 'zzs':
                typeText = '增值税发票'
                break
            case '95':
                typeText = '定额发票'
                break
            case '93':
                typeText = '飞机行程单'
                break
            case '92':
                typeText = '火车票'
                break
            case '91':
                typeText = '出租车票'
                break
            case '88':
                typeText = '车船票'
                break
            case '98':
                typeText = '过路费'
                break
            case '97':
                typeText = '通用机打发票'
                break
        }
        this.setData({
            hidden: true,
            animationInfoImg: this.animationImg.export(),
            animationInfoTopList: this.animationTopList.export(),
            type,
            typeText,
            typeClass
        })
    },
    bindObjPickerChange(e) {
        var name = e.currentTarget.dataset.name
        var listName = e.currentTarget.dataset.list
        var value = e.detail.value
        var index = e.currentTarget.dataset.index
        this.setData({
            [index]: e.detail.value,
            submitData: {
                ...this.data.submitData,
                [name]: this.data[listName][value].invoiceType
            }
        })
        console.log(this.data.submitData)
    }
})

