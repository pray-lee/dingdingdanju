Page({
    data: {
        type: '',
        maskHidden: true,
        animationInfo: {}
    },
    onLoad(query) {
        console.log(query.type)
        this.setData({
            type: query.type
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
        animation.translateY(360).step()
        this.setData({
            animationInfo: animation.export(),
            maskHidden: true
        })
    },
    onShowAddBill(e) {
        var type = e.currentTarget.dataset.type
        dd.navigateTo({
            url: '../addBill/index?type=' + type
        })
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
    }
})
