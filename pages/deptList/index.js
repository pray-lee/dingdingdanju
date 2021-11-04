var app = getApp()
Page({
    data: {
        isPhoneXSeries: false,
        deptList: [],
        searchUserList: [],
        searchResult: [],
        inputValue: '',
        isFocus: false,
        allowMulti: false,
        selectValue: ''
    },
    onLoad() {
        this.setData({
            isPhoneXSeries: app.globalData.isPhoneXSeries
        })
        this.getAllowMulti()
        this.getSearchUserList()
        this.getDeptList()
    },
    getAllowMulti() {
        this.setData({
            allowMulti: dd.getStorageSync({key: 'allowMulti'}).data
        })
    },
    getSearchUserList() {
        dd.getStorage({
            key: 'searchUserList',
            success: res => {
                this.setData({
                    searchUserList: res.data
                })
            }
        })
    },
    getDeptList() {
        dd.getStorage({
            key: 'deptList',
            success: res => {
                this.setData({
                    deptList: res.data,
                })
            }
        })
    },
    checkboxChange(e) {
        this.setData({
            selectValue: e.detail.value
        })
    },
    radioChange(e) {
        this.setData({
            selectValue: [e.detail.value]
        })
    },
    submitSelect() {
        console.log(this.data.selectValue, 'selectValue')
    },
    getNext(e) {
        const userList = e.currentTarget.dataset.userList
        const subDepartList = e.currentTarget.dataset.subDepartList
        const delta = getCurrentPages().length
        dd.setStorageSync({
            key: 'userList',
            data: userList
        })
        dd.setStorageSync({
            key: 'delta',
            data: delta - 1
        })
        dd.setStorage({
            key: 'subDepartList',
            data: subDepartList,
            success: res => {
                dd.navigateTo({
                    url: '/pages/approvalUserList/index'
                })
            }
        })

    },
    onInput(e) {
        const value = e.detail.value
        if (!!app.globalData.timeOutInstance) {
            clearTimeout(app.globalData.timeOutInstance)
        }
        if(value == '') {
            this.setData({
                isFocus: false,
            })
        }else{
            this.setData({
                isFocus: true,
            })
        }
        this.setData({
            searchResult: [],
            inputValue: value
        })
        this.searchFn(value)
    },
    clearWord() {
        this.setData({
            inputValue: '',
            searchResult: [],
            isFocus: false,
        })
        this.searchFn('')
    },
    searchFn(value) {
        app.globalData.timeOutInstance = setTimeout(() => {
            var searchResult = this.data.searchUserList.filter(item => value && item.name.indexOf(value) !== -1)
            this.setData({
                searchResult: searchResult
            })
        }, 300)
    }
})
