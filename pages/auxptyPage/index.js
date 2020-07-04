var app = getApp()
Page({
    data:{
        auxptyList: [],
        searchResult: [],
    },
    onLoad() {
        dd.getStorage({
            key: 'auxptyList',
            success: res => {
                this.setData({
                    auxptyList: res.data,
                    searchResult: res.data
                })
            }
        })
    },
    goBack(e) {
        const id = e.currentTarget.dataset.id
        const name = e.currentTarget.dataset.name
        const auxptyId = e.currentTarget.dataset.auxptyId
        const obj = {
            id,
            name,
            auxptyId
        }
        dd.setStorage({
            key: 'auxpty',
            data: obj,
            success: res => {
                console.log('设置辅助核算成功...')
                dd.navigateBack({
                    delta: 1
                })
            }
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
            var searchResult = this.data.auxptyList.filter(item => item.name.indexOf(value) !== -1)
            this.setData({
                searchResult: searchResult
            })
        }, 300)
    }
})
