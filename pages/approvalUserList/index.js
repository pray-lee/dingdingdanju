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
        bottomUserList: [],
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
    getSearchUserList() {
        this.setData({
            searchUserList: dd.getStorageSync({key: 'searchUserList'}).data
        })
    },
    onShow() {
        const newUserList = this.data.userList.map(item => ({...item, userName: item.name, checked: false}))
        this.setData({
            userList: newUserList
        })
        // 先看看当前页面的用户列表有没有已经选中的重复的用户,
        const selectedUserList = this.getStorageUserList()
        const checkedUsers = selectedUserList.filter(selected => this.data.userList.some(item => selected.id === item.id))
        console.log(checkedUsers)
        if(checkedUsers.length) {
            for(let i = 0 ; i < this.data.userList.length; i++) {
                const user = this.data.userList[i]
                for(let j = 0; j < checkedUsers.length; j++) {
                    const checked = checkedUsers[j]
                    if(user.id === checked.id) {
                       this.data.userList[i] = Object.assign({}, checked)
                    }
                }
            }
        }
        this.setData({
            userList:this.data.userList
        })
        // 渲染底部列表
        this.renderBottomUserList()
    },
    getUserList() {
        const userList = dd.getStorageSync({key: 'userList'}).data
        this.setData({
            userList
        })
    },
    getSelectedIndex() {
        return dd.getStorageSync({key: 'nodeIndex'}).data
    },
    getStorageUserList() {
        const selectedUsers = dd.getStorageSync({key: 'selectedUsers'}).data
        if(selectedUsers) {
            return selectedUsers[this.getSelectedIndex()]
        }
        return []
    },
    renderBottomUserList() {
        const selectedUsers = dd.getStorageSync({key: 'selectedUsers'}).data || []
        console.log(selectedUsers)
        let bottomUserList = []
        if(selectedUsers.length) {
            bottomUserList = selectedUsers[this.getSelectedIndex()]
        }else{
            bottomUserList = []
        }
        this.setData({
            bottomUserList
        })
    },
    removeUser(e) {
        const id = e.currentTarget.dataset.id
        const newArr = this.data.bottomUserList.filter(item => item.id !== id)
        const selectedUsers = dd.getStorageSync({key: 'selectedUsers'}).data
        const nodeIndex = this.getSelectedIndex()
        selectedUsers[nodeIndex] = newArr
        dd.setStorageSync({
            key: 'selectedUsers',
            data: selectedUsers
        })
        this.onShow()
    },
    checkboxChange(e) {
        const index = e.currentTarget.dataset.index
        this.data.userList[index].checked = e.detail.value
        this.setData({
            userList: this.data.userList
        })
        const checkedValues = this.data.userList.filter(item => !!item.checked)
        const selectedUserList = this.getStorageUserList()
        console.log(selectedUserList)
        this.handleUserList(selectedUserList, checkedValues)
        this.renderBottomUserList()
    },
    searchCheckboxChange(e) {
        const index = e.currentTarget.dataset.index
        this.data.searchResult[index].checked = e.detail.value
        this.setData({
            searchResult: this.data.searchResult
        })
        const checkedValues = this.data.searchResult.filter(item => !!item.checked)
        const selectedUserList = this.getStorageUserList()
        this.handleSearchUserList(selectedUserList, checkedValues)
        this.renderBottomUserList()
    },
    searchRadioChange(e) {
        const index = e.currentTarget.dataset.index
        const searchResult = this.data.searchResult.map(item =>({...item, userName: item.name, checked: false}))
        searchResult[index].checked = e.detail.value
        const selectedUsers = dd.getStorageSync({key: 'selectedUsers'}).data || []
        const nodeIndex = this.getSelectedIndex()
        selectedUsers[nodeIndex] = [searchResult[index]]
        dd.setStorageSync({
            key: 'selectedUsers',
            data: selectedUsers
        })
        this.setData({
            searchResult
        })
        this.renderBottomUserList()
    },
    radioChange(e) {
        const index = e.currentTarget.dataset.index
        const userList = this.data.userList.map(item => ({...item, userName: item.name, checked: false}))
        userList[index].checked = e.detail.value
        const selectedUsers = dd.getStorageSync({key: 'selectedUsers'}).data || []
        const nodeIndex = this.getSelectedIndex()
        selectedUsers[nodeIndex] = [userList[index]]
        dd.setStorageSync({
            key: 'selectedUsers',
            data: selectedUsers
        })
        this.setData({
            userList
        })
        this.renderBottomUserList()
    },
    handleUserList(selectedUserList, checkedValues) {
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
    handleSearchUserList(selectedUserList, checkedValues) {
        // 用户列表和已选择列表取差集   当前页面没有选中的
        const storageUnCheckedUsers = this.data.searchResult.filter(item => selectedUserList.every(selected => selected.id !== item.id))

        // 用户列表和已选择列表取交集  当前页面被选中的
        const checkedUsers = this.data.searchResult.filter(item => selectedUserList.some(selected => selected.id === item.id))

        // 需要添加的
        const addChecked = checkedValues.filter(item => storageUnCheckedUsers.some(unChecked => unChecked.id === item.id))
        this.addChecked(selectedUserList, addChecked)

        // 需要删除的
        const removeChecked = checkedUsers.filter(item => checkedValues.every(checked => checked.id !== item.id))
        this.removeChecked(selectedUserList, removeChecked)
    },
    addChecked(selected, arr) {
        const newArr = selected.concat(arr)
        const selectedUsers = dd.getStorageSync({key: 'selectedUsers'}).data || []
        const nodeIndex = this.getSelectedIndex()
        selectedUsers[nodeIndex] = newArr
        dd.setStorageSync({
            key: 'selectedUsers',
            data: selectedUsers
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
            const selectedUsers = dd.getStorageSync({key: 'selectedUsers'}).data || []
            const nodeIndex = this.getSelectedIndex()
            selectedUsers[nodeIndex] = newArr
            dd.setStorageSync({
                key: 'selectedUsers',
                data: selectedUsers
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
        this.onShow()
    },
    clearWord() {
        this.setData({
            inputValue: '',
            searchResult: [],
            isFocus: false,
        })
        this.searchFn('')
        this.onShow()
    },
    searchFn(value) {
        app.globalData.timeOutInstance = setTimeout(() => {
            var searchResult = this.data.searchUserList.filter(item => value && item.name.indexOf(value) !== -1)
            const newSearchResult = searchResult.map(item => ({...item, userName: item.name, checked: false}))
            this.setData({
                searchResult: newSearchResult
            })
            // 先看看当前页面的用户列表有没有已经选中的重复的用户,
            const selectedUserList = this.getStorageUserList()
            const checkedUsers = selectedUserList.filter(selected => this.data.searchResult.some(item => selected.id === item.id))
            if(checkedUsers.length) {
                for(let i = 0 ; i < this.data.searchResult.length; i++) {
                    const user = this.data.searchResult[i]
                    for(let j = 0; j < checkedUsers.length; j++) {
                        const checked = checkedUsers[j]
                        if(user.id === checked.id) {
                            this.data.searchResult[i] = Object.assign({}, checked)
                        }
                    }
                }
            }
            this.setData({
                searchResult:this.data.searchResult
            })
        }, 300)
    }
})
