var app = getApp()
Page({
    data: {
        isPhoneXSeries: false,
        userList: [],
        subDepartList: [],
        searchUserList: [],
        searchResult: [],
        inputValue: '',
        isFocus: false,
        allowMulti: false,
        selectValue: []
    },
    onLoad() {
        this.setData({
            isPhoneXSeries: app.globalData.isPhoneXSeries
        })
        this.getAllowMulti()
        this.getSearchUserList()
        this.getUserList()
        this.getSubDepartList()
    },
    onShow() {
        this.getStorageCheckedValue()
    },
    getSearchUserList() {
        dd.getStorage({
            key: 'searchUserList',
            success: res => {
                this.setData({
                    searchUserList: res.data,
                })
            }
        })
    },
    getUserList() {
        dd.getStorage({
            key: 'userList',
            success: res => {
                this.setData({
                    userList: res.data,
                })
            }
        })
    },
    radioChange(e) {
        this.setData({
            selectValue: [e.detail.value]
        })
    },
    checkboxChange(e) {
        console.log(this.data.selectValue)
        // 多选处理
        const checkedValue = e.detail.value
        const checkedUsers = this.handleUsers(checkedValue.concat(this.data.selectValue))
        console.log(checkedUsers)
        dd.setStorageSync({
            key: 'checkedValue',
            data: checkedUsers
        })
    },
    getStorageCheckedValue() {
        const checkedValue = dd.getStorageSync({key: 'checkedValue'}).data || []
        console.log(checkedValue)
        dd.removeStorage({
            key: 'checkedValue',
            success: res => {
                this.setData({
                    selectValue: checkedValue
                })
            }
        })
    },
    handleUsers(users) {
        const newUsers = []
        if(users.length) {
            const obj = {}
            users.reduce((prev, cur) => {
                obj[cur] ? '':obj[cur] = true && prev.push(cur)
                return prev
            }, newUsers)
        }
        return newUsers
    },
    getSubDepartList() {
        dd.getStorage({
            key: 'subDepartList',
            success: res => {
                this.setData({
                    subDepartList: res.data,
                })
            }
        })
    },
    getAllowMulti() {
        this.setData({
            allowMulti: dd.getStorageSync({key: 'allowMulti'}).data
        })
    },
    submitUsers() {
        console.log(dd.getStorageSync({key: 'checkedValue'}).data, 'checkedData.........')
        dd.removeStorage({
            key: 'checkedValue'
        })
    },
    getNext(e) {
        const userList = e.currentTarget.dataset.userList
        const subDepartList = e.currentTarget.dataset.subDepartList
        dd.setStorageSync({
            key: 'userList',
            data: userList
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
    goBack() {
        let currentDelta = getCurrentPages().length
        const prevDelta = dd.getStorageSync({key: 'delta'}).data
        dd.navigateBack({
            delta: currentDelta - prevDelta
        })
    },
    onInput(e) {
        const value = e.detail.value
        if (!!app.globalData.timeOutInstance) {
            clearTimeout(app.globalData.timeOutInstance)
        }
        if (value == '') {
            this.setData({
                isFocus: false
            })
        } else {
            this.setData({
                isFocus: true
            })
        }
        this.setData({
            inputValue: value,
            searchResult: []
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
