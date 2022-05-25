const app = getApp()
Page({
    data: {
        tempImportList: [],
        amountField: {
            unverifyAmount: 'unverifyAmount'
        }
    },
    onLoad() {
        const tempImportList = dd.getStorageSync({
            key: 'tempImportList'
        }).data
        const multiCurrency = dd.getStorageSync({
            key: 'multiCurrency'
        }).data
        if(multiCurrency) {
            this.setData({
                amountField: {
                    unverifyAmount: 'originUnverifyAmount'
                }
            })
        }
        this.setData({
            tempImportList
        })
    },
    onCheckboxChange(e) {
        console.log(this.data.importList)
        console.log(e)
    },
    onCheckboxSubmit(e) {
        var arr = e.detail.value
        var newArr = []
        for (var i in arr) {
            if (arr[i].length) {
                var temp = {
                    ...arr[i][0],
                    billDetailId: arr[i][0].id,
                    applicationAmount: arr[i][0][this.data.amountField.unverifyAmount],
                    remark: arr[i][0].remark
                }
                newArr.push(temp)
            }
        }
        dd.setStorage({
            key: 'importList',
            data: newArr,
            success: res => {
                console.log('选择借款列表成功')
                dd.removeStorage({
                    key: 'tempImportList',
                    success: res => {
                        console.log('清除tempImportList成功...')
                    }
                })
                dd.navigateBack({
                    delta: 1
                })
            }
        })
    },
})
