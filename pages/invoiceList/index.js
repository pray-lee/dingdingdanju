var app = getApp()
app.globalData.loadingCount = 0
import {formatNumber, request} from '../../util/getErrorMessage'

Page({
    data: {
        startX: 0, //开始坐标
        startY: 0,
        type: 'zzs',
        typeText: '增值税发票',
        useStatus: 0, // 使用状态
        isPhoneXSeries: false,
        list: [],
        maskHidden: true,
        scrollTop:0,
        hidden: true,
        topHidden: true,
        animationInfo: {},
        animationInfoImg: {},
        animationInfoTopList: {},
        inputValue: '',
        filterList: [],
    },
    onLoad() {
        this.getInvoiceListByType(this.data.type, this.data.useStatus)
    },
    onReady() {

    },
    onShow() {
        // 页面显示
        var animation = dd.createAnimation({
            duration: 250,
            timeFunction: 'ease-in'
        })
        this.animation = animation

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
            animationInfo: animation.export(),
            animationInfoImg: animationImg.export(),
            animationInfoTopList: animationTopList.export()
        })
    },
    onHide() {

    },
    //手指触摸动作开始 记录起点X坐标
    touchstart: function (e) {
        //开始触摸时 重置所有删除
        this.data.list.forEach(function (v, i) {
            if (v.isTouchMove)//只操作为true的
                v.isTouchMove = false;
        })
        this.setData({
            startX: e.changedTouches[0].clientX,
            startY: e.changedTouches[0].clientY,
            list: this.data.list,
            filterList: this.data.list
        })
    },
    //滑动事件处理
    touchmove: function (e) {
        var that = this,
            index = e.currentTarget.dataset.index,//当前索引
            startX = that.data.startX,//开始X坐标
            startY = that.data.startY,//开始Y坐标
            touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
            touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
            //获取滑动角度
            angle = that.angle({X: startX, Y: startY}, {X: touchMoveX, Y: touchMoveY});
        that.data.filterList.forEach(function (v, i) {
            v.isTouchMove = false
            //滑动超过30度角 return
            if (Math.abs(angle) > 30) return;
            if (i == index) {
                if (touchMoveX > startX) //右滑
                    v.isTouchMove = false
                else //左滑
                    v.isTouchMove = true
            }
        })
        //更新数据
        that.setData({
            list: that.data.list,
            filterList: this.data.list
        })
    },
    /**
     * 计算滑动角度
     * @param {Object} start 起点坐标
     * @param {Object} end 终点坐标
     */
    angle: function (start, end) {
        var _X = end.X - start.X,
            _Y = end.Y - start.Y
        //返回角度 /Math.atan()返回数字的反正切值
        return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
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
    getInvoiceList(e) {
        this.animationImg.rotate(0).step()
        this.animationTopList.translateY('-200%').step()
        const type = e.currentTarget.dataset.type
        this.setTypeText(type)
        this.getInvoiceListByType(type, this.data.useStatus)
    },
    setTypeText(type) {
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
            typeText
        })
    },
    getInvoiceListByType(type, useStatus) {
        console.log(type, useStatus, 'alksdjflasdkjf')
    },
    getInvoiceListByUseStatus() {
        // 已使用 1 未使用 0
        const useStatus = this.data.useStatus
        if(useStatus == 1) {
            this.getInvoiceListByType(this.data.type, useStatus)
            this.setData({
                useStatus: 0
            })
        }else{
            this.getInvoiceListByType(this.data.type, useStatus)
            this.setData({
                useStatus: 1
            })
        }
    },
})
