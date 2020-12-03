var app = getApp()
Page({
    data:{
        isPhoneXSeries: false,
        subjectList: [],
        searchResult: [],
        inputValue: ''
    },
    onLoad() {
        this.setData({
            isPhoneXSeries: app.globalData.isPhoneXSeries
        })
        dd.getStorage({
            key: 'subjectList',
            success: res => {
                this.setData({
                    subjectList: res.data,
                    searchResult: res.data
                })
            }
        })
    },
    goBack(e) {
        const id = e.currentTarget.dataset.id
        const name = e.currentTarget.dataset.name
        const subjectExtraId = e.currentTarget.dataset.extraId
        const obj = {id, name, subjectExtraId}
        console.log(obj, 'goBack')
        dd.setStorageSync({
            key: 'subject',
            data: obj,
        })
        console.log('设置科目id成功')
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
            var searchResult = this.data.subjectList.filter(item => item.name.indexOf(value) !== -1)
            this.setData({
                searchResult: searchResult
            })
        }, 300)
    }
})
