const app = getApp()
Page({
    data: {
        tempImportList: []
    },
    onLoad() {
        // const tempImportList = dd.getStorageSync({
        //     key: 'tempImportList'
        // }).data
        // console.log(tempImportList)
        const tempImportList = [
            {
                id: 1,
                auxpropertyNames: 1,
                businessDateTime: '2020-01-01',
                unverifyAmount: '30',
                remark: 'cnm',
            },
            {
                id: 2,
                auxpropertyNames: 2,
                businessDateTime: '2020-01-01',
                unverifyAmount: '50',
                remark: 'cnm',
            },
        ]
        this.setData({
            tempImportList
        })
    },
    startTimeChange() {
        dd.datePicker({
            format: 'yyyy-MM-dd',
            currentDate: '2012-12-12',
            success: (res) => {
                dd.alert({
                    content: res.date,
                });
            },
        });
    },
    endTimeChange() {
        dd.datePicker({
            format: 'yyyy-MM-dd',
            currentDate: '2012-12-12',
            success: (res) => {
                dd.alert({
                    content: res.date,
                });
            },
        });
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
                    applicationAmount: arr[i][0].unverifyAmount,
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
