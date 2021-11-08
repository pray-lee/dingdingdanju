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
        animationInfo: {},
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
    showSelectedUserList() {
        var animation = dd.createAnimation({
            duration: 250,
            timeFunction: 'ease-in'
        })
        this.animation = animation
        animation.translateY(0).step()
        this.setData({
            animationInfo: animation.export(),
        })
    },
    hideSelectedUserList() {
        var animation = dd.createAnimation({
            duration: 250,
            timeFunction: 'linear'
        })
        this.animation = animation
        animation.translateY('100%').step()
        this.setData({
            animationInfo: animation.export(),
        })
    },
    onShow() {
        // 先清空选择
        this.clearChecked()
        // 先看看当前页面的用户列表有没有已经选中的重复的用户,
        const selectedUserList = this.getStorageUserList()
        const checkedUsers = this.data.userList.filter(item => selectedUserList.some(selected => selected.id === item.id))
        console.log(this.data.userList)
        console.log(selectedUserList)
        console.log(checkedUsers, 'checkedUsers')
        let newUserList = []
        if(checkedUsers.length) {
            for(let i = 0 ; i < this.data.userList.length; i++) {
                const user = this.data.userList[i]
                let item = Object.assign({}, user)
                for(let j = 0; j < checkedUsers.length; j++) {
                    const checked = checkedUsers[j]
                    if(user.id === checked.id) {
                       item = Object.assign({}, user, {checked: true})
                    }
                }
                newUserList.push(Object.assign({}, item))
            }
        }else{
            newUserList = this.data.userList.slice()
        }
        this.setData({
            userList:newUserList
        })
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
    getStorageUserList() {
        return dd.getStorageSync({key: 'selectedUsers'}).data || []
    },
    clearChecked() {
        const userList = this.data.userList.map(item => ({
            id: item.id,
            name: item.name,
            checked: false,
        }))
        this.setData({
            userList
        })
    },
    checkboxChange(e) {
        const checkedValues = e.detail.value.map(item => ({
            // checked: true,
            id: item.split('_')[0],
            name: item.split('_')[1]
        }))
        const selectedUserList = this.getStorageUserList()
        this.handleUserList(selectedUserList, checkedValues)
    },
    handleUserList(selectedUserList, checkedValues) {
        // 如果没有选中，就新增
        // 如果有，没有勾选，就删除，
        // 如果没有勾选，不操作

        // 用户列表和已选择列表取差集   当前页面没有选中的
        const storageUnCheckedUsers = this.data.userList.filter(item => selectedUserList.every(selected => selected.id !== item.id))

        // 用户列表和已选择列表取交集  当前页面被选中的
        const checkedUsers = this.data.userList.filter(item => selectedUserList.some(selected => selected.id === item.id))

        // 需要添加的
        const addChecked = checkedValues.filter(item => storageUnCheckedUsers.some(unChecked => unChecked.id === item.id))
        this.addChecked(selectedUserList, addChecked)

        // 需要删除的
        const removeChecked = checkedUsers.filter(item => checkedValues.every(checked => checked.id !== item.id))
        this.removeChecked(selectedUserList, removeChecked)

    },
    addChecked(selected, arr) {
        const newArr = selected.concat(arr)
        dd.setStorageSync({
            key: 'selectedUsers',
            data: newArr
        })
    },
    removeChecked(selected,arr) {
        let newArr = []
        if(arr.length) {
            arr.forEach(item => {
                selected.forEach(select => {
                    if(item.id !== select.id) {
                        newArr.push(select)
                    }
                })
            })
            console.log(newArr, 'newArr...........')
            dd.setStorageSync({
                key: 'selectedUsers',
                data: newArr
            })
        }
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
