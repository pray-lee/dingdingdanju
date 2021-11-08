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
        selectValue: [],
        storageCheckedValues: [],
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
        this.getStorageUsers()
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
        const userList = dd.getStorageSync({key: 'userList'}).data
        this.setData({
            userList
        })
    },
    radioChange(e) {
        this.setData({
            selectValue: [e.detail.value]
        })
    },
    checkboxChange(e) {
        const checkedValues = e.detail.value
        const checkedUsers = checkedValues.map(item => ({
            id: item.split('_')[0],
            name: item.split('_')[1],
            checked: true
        }))
        dd.setStorage({
            key: 'checkedUsers',
            data:checkedUsers
        })
    },
    getStorageUsers() {
        const checkedUsers = dd.getStorageSync({key: 'checkedUsers'}).data || []
        const userList = this.setChecked(checkedUsers)
        this.setData({
            userList
        })
    },
    setChecked(checkedUsers) {
        const userList = this.data.userList
        console.log(userList)
        const newUserList = []
        for(let i = 0; i < userList.length; i++) {
            const user = userList[i]
            if(checkedUsers.length) {
                for(let k = 0; k < checkedUsers.length; k++) {
                    const checkedUser = checkedUsers[k]
                    if(user.id === checkedUser.id) {
                        newUserList.push(checkedUser)
                    }else{
                        newUserList.push(user)
                    }
                }
            }else{
                newUserList.push(user)
            }
        }
        return newUserList
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
        // console.log(dd.getStorageSync({key: 'checkedValue'}).data, 'checkedData.........')
        // dd.removeStorage({
        //     key: 'checkedValue'
        // })
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
