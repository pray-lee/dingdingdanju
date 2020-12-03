var app = getApp()
Page({
    data:{
        isPhoneXSeries: false,
        capitalList: [],
        searchResult: [],
        inputValue: ''
    },
    onLoad() {
        this.setData({
            isPhoneXSeries: app.globalData.isPhoneXSeries
        })
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
        this.setData({
            inputValue: value
        })
        this.searchFn(value)
    },
    clearWord() {
        this.setData({
            inputValue: ''
        })
        this.searchFn('')
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
