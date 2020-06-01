var app = getApp()
console.log(app.globalData)
Page({
    data: {
        animationInfo: {},
        maskHidden: true
    },
    seeAll(e) {
        // 查看全部
        dd.navigateTo({
            url: '../list/index?type=' + e.currentTarget.dataset.type
        })
    },
    onAddShow() {
        var animation = dd.createAnimation({
            duration: 250,
            timeFunction: 'ease-in'
        })
        this.animation = animation
        animation.translateY(0).step()
        this.setData({
            animationInfo: animation.export(),
            maskHidden: false
        })
    },
    onAddHide() {
        var animation = dd.createAnimation({
            duration: 250,
            timeFunction: 'ease-in'
        })
        this.animation = animation
        animation.translateY(260).step()
        this.setData({
            animationInfo: animation.export(),
            maskHidden: true
        })
    },
    onLoad(query) {
        dd.getAuthCode({
            success: (res) => {
                dd.httpRequest({
                    url: "http://192.168.1.116:8080/jeecg/loginController.do?loginDingTalk&code=" + res.authCode,
                    method: "GET",
                    dataType: "json",
                    success: res => {
                        console.log(res);
                    }
                })
            },
            fail: (err) => {
                dd.alert({ content: JSON.stringify(err) })
            }
        })
    },
    onReady() {
        // 页面加载完成
    },
    onShow() {
        // 页面显示
        var animation = dd.createAnimation({
            duration: 250,
            timeFunction: 'ease-in'
        })
        this.animation = animation
        this.setData({
            animationInfo: animation.export()
        })
        // setTimeout(function() {
        //   animation.translate(35).step();
        //   this.setData({
        //     animationInfo:animation.export(),
        //   });
        // }.bind(this), 1500);
    },
    onShowAddJiekuan(e) {
        dd.navigateTo({
            url: '../addJiekuan/index'
        })
    },
    onShowAddBaoxiao(e) {
        dd.navigateTo({
            url: '../addBaoxiao/index'
        })
    },
    onHide() {
        // 页面隐藏
    },
    onUnload() {
        // 页面被关闭
    },
    onTitleClick() {
        // 标题被点击
    },
    onPullDownRefresh() {
        // 页面被下拉
    },
    onReachBottom() {
        // 页面被拉到底部
    },
    // onShareAppMessage() {
    //   // 返回自定义分享信息
    //   return {
    //     title: 'My App',
    //     desc: 'My App description',
    //     path: 'pages/index/index',
    //   };
    // },
});
