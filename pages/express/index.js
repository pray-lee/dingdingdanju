var app = getApp()
app.globalData.loadingCount = 0
import {formatNumber, request} from '../../util/getErrorMessage'
Page({
    data: {
        startX: 0, //开始坐标
        startY: 0,
        isPhoneXSeries: false,
        type: '',
        scrollTop: 0,
        list: [],
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
            list: this.data.list
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
            angle = that.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
            that.data.list.forEach(function (v, i) {
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
            list: that.data.list
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
    onLoad() {
        this.setData({
            isPhoneXSeries: app.globalData.isPhoneXSeries,
        })
        this.setData({
            list: [
                {
                    username: '李晓勇',
                    phone: '18518885324',
                    address: '北京市通州区玉桥西路'
                },
                {
                    username: '李晓勇',
                    phone: '18518885324',
                    address: '北京市通州区玉桥西路'
                }
            ]
        })
        // 页面加载完成,设置请求地址
        this.addLoading()
        const url = ''
        request({
            hideLoading: this.hideLoading,
            url: url,
            method: 'GET',
            success: res => {

            },
            fail: res => {
                console.log(res, 'failed')
            },
        })
    },
    addLoading() {
        if(app.globalData.loadingCount < 1) {
            dd.showLoading({
                content: '加载中...'
            })
        }
        app.globalData.loadingCount +=1
    },
    hideLoading() {
        if(app.globalData.loadingCount <= 1) {
            dd.hideLoading()
            app.globalData.loadingCount = 0
        }else{
            app.globalData.loadingCount-=1
        }
    },
    onShow() {
    },
    addExpressInfo() {
        dd.navigateTo({
            url: '/pages/addExpressInfo/index'
        })
    },
    deleteBill(e) {
        const url = ''
        dd.confirm({
            title: '温馨提示',
            content: '确认删除该物流信息吗?',
            confirmButtonText: '是',
            cancelButtonText: '否',
            success: res => {
                this.setData({
                    x: 0
                })
                if(res.confirm) {
                    this.addLoading()
                    request({
                        hideLoading: this.hideLoading,
                        url,
                        method: 'GET',
                        success: res => {
                            console.log(res)
                            if(res.data.success) {
                                // 删除成功
                            }else{
                                dd.alert({
                                    content: '单据删除失败',
                                    buttonText: '好的'
                                })
                            }
                        },
                    })
                }
            }
        })
    }
})
