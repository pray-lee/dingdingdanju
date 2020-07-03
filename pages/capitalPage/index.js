var app = getApp()
Page({
    data:{
        capitalList: [],
        searchResult: [],
    },
    onLoad() {
        dd.getStorage({
            key: 'capitalList',
            success: res => {
                this.setData({
                    capitalList: res.data,
                    searchResult: res.data
                })
            }
        })
    },
    goBack(e) {
        const id = e.currentTarget.dataset.id
        const name = e.currentTarget.dataset.name
        const obj = {id, name}
        dd.setStorageSync({
            key: 'capital',
            data: obj,
        })
        console.log('设置资金计划成功...')
        dd.navigateBack({
            delta: 1
        })
    },
    onInput(e) {
        const value = e.detail.value
        if(!!app.globalData.timeOutInstance) {
            clearTimeout(app.globalData.timeOutInstance)
        }
        this.searchFn(value)
    },
    searchFn(value) {
        app.globalData.timeOutInstance = setTimeout(() => {
            var searchResult = this.data.capitalList.filter(item => item.name.indexOf(value) !== -1)
            this.setData({
                searchResult: searchResult
            })
        }, 300)
    }
})
