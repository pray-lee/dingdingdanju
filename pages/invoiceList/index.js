var app = getApp()
app.globalData.loadingCount = 0
import {formatNumber, request} from '../../util/getErrorMessage'

Page({
    data: {
        startX: 0, //开始坐标
        startY: 0,
        type: 'zzs',
        typeText: '增值税发票',
        typeClass: 'zzs',
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
        const typeClass = e.currentTarget.dataset.class
        this.setType(type, typeClass)
        this.getInvoiceListByType(type, this.data.useStatus)
    },
    setType(type, typeClass) {
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
    getInvoiceListByType(type, useStatus) {
        this.addLoading()
        request({
            hideLoading: this.hideLoading,
            url: app.globalData.url + 'invoiceInfoController.do?getInvoiceInfoList',
            data: {
                invoiceType: type,
                useStatus: '1',
            },
            method: 'GET',
            success: res => {
                console.log(res, '发票列表........')
                if(res.data.success) {
                    this.setData({
                        list: res.data.obj.results || [],
                        filterList: res.data.obj.results || [],
                    })
                }
            }
        })
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
    onAddShow() {
        this.animation.translateY(0).step()
        this.setData({
            animationInfo: this.animation.export(),
            maskHidden: false
        })
    },
    onAddHide() {
        this.animation.translateY('100%').step()
        this.setData({
            animationInfo: this.animation.export(),
            maskHidden: true
        })
    },
    handleUpload() {
        dd.chooseImage({
            count: 9,
            success: res => {
                this.uploadFile(res.filePaths)
            },
            fail: res => {
                console.log('用户取消操作')
            }
        })
    },
    invoiceInput() {
        dd.navigateTo({
            url: '/pages/invoiceInput/index'
        })
    },
    /**
     *
     * @param 上传图片字符串列表
     */
    uploadFile(array) {
        if (array.length) {
            let promiseList = []
            array.forEach(item => {
                promiseList.push(new Promise((resolve, reject) => {
                    this.addLoading()
                    dd.uploadFile({
                        url: app.globalData.url + 'aliyunController/uploadImages.do',
                        fileType: 'image',
                        fileName: item,
                        filePath: item,
                        formData: {
                            accountbookId: 'accountbook-invoice',
                            submitterDepartmentId: 'department-invoice'
                        },
                        success: res => {
                            const result = JSON.parse(res.data)
                            if (result.obj && result.obj.length) {
                                const file = result.obj[0]
                                resolve(file)
                            } else {
                                reject('上传失败')
                            }
                        },
                        fail: res => {
                            reject(res)
                        },
                        complete: res => {
                            this.hideLoading()
                        }
                    })
                }))
            })
            Promise.all(promiseList).then(res => {
                // 提交成功的处理逻辑
                var billFilesList = []
                res.forEach(item => {
                    billFilesList.push(item)
                })
                console.log(billFilesList, 'billFilesList')
            }).catch(error => {
                dd.alert({
                    content: '上传失败',
                    buttonText: '好的',
                    success: res => {
                        console.log(res, '上传失败')
                    }
                })
            })
        }
    },
    previewFile(e) {
        var url = e.currentTarget.dataset.url
        dd.previewImage({
            urls: [url],
        })
    },
    onInput(e) {
        const text = e.detail.value
        this.setData({
            inputValue: text
        })
        this.handleFilter(text)
    },
    clearWord() {
        this.setData({
            inputValue: ''
        })
        this.handleFilter('')
    },
    handleFilter(text) {
        const filterList = this.data.list.filter(item => {
            // 发票金额 账簿名称 发票号码
            const str = item.accountbookName + item.fphm + item.jshj
            if (str.indexOf(text) != -1) {
                return item
            }
        })
        this.setData({
            filterList
        })
    },
    goToEdit(e) {
        const invoiceDetail = this.data.filterList.filter(item => item.id == e.currentTarget.dataset.id)[0]
        dd.setStorage({
            key: 'invoiceDetail',
            data: invoiceDetail,
            success: res => {
                dd.navigateTo({
                    url: '/pages/invoiceInput/index'
                })
            }
        })
    }
})
