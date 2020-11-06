import moment from 'moment'
import clone from 'lodash/cloneDeep'
const app = getApp()
Page({
    data: {
        tempImportList: [],
        filterList: [],
        startTime: '',
        endTime: '',
    },
    onLoad() {
    },
    onShow() {
        const tempImportList = dd.getStorageSync({
            key: 'tempImportList'
        }).data
        this.setData({
            tempImportList,
            filterList: clone(tempImportList)
        })
    },
    onInput(e) {
        // 过滤
        this.searchResultUseInput(e.detail.value)
    },
    startTimeChange() {
        dd.datePicker({
            format: 'yyyy-MM-dd',
            currentDate: moment().format('YYYY-MM-DD'),
            success: (res) => {
                this.setData({
                    startTime: res.date
                })
                this.searchResultUseTime(res.date, this.data.endTime)
            }
        });
    },
    endTimeChange() {
        dd.datePicker({
            format: 'yyyy-MM-dd',
            currentDate: moment().format('YYYY-MM-DD'),
            success: (res) => {
                this.setData({
                    endTime: res.date,
                });
                this.searchResultUseTime(this.data.startTime, res.date)
            },
        });
    },
    clearStartTime() {
        this.setData({
            startTime: ''
        })
        this.searchResultUseTime('', this.data.endTime)
    },
    clearEndTime() {
        this.setData({
            endTime: ''
        })
        this.searchResultUseTime(this.data.startTime, '')
    },
    onCheckboxChange(e) {
        console.log(e.detail.value)
    },
    searchResultUseTime(startTime, endTime) {
        console.log(startTime, endTime)
        const filterList = this.data.tempImportList.filter(item => {
            if(!startTime && !!endTime) {
               return new Date(endTime) > new Date(item.businessDateTime)
            }else if(!endTime && !!startTime) {
                return new Date(startTime) < new Date(item.businessDateTime)
            }else if(!startTime && !endTime) {
                return true
            }else{
                return (new Date(startTime) < new Date(item.businessDateTime)) &&
                    (new Date(item.businessDateTime) < new Date(endTime))
            }
        })
        this.setData({
            filterList
        })
    },
    searchResultUseInput(text) {
        const filterList = this.data.tempImportList.filter(item => (item['subjectEntity.fullSubjectName'] + item.remark).indexOf(text) !== -1)
        this.setData({
            filterList
        })
    },
    onCheckboxSubmit(e) {
        var arr = e.detail.value
        var newArr = []
        for (var i in arr) {
            if (arr[i].length) {
                var temp = {
                    ...arr[i][0],
                    id: arr[i][0].id,
                    billDetailId: arr[i][0].id,
                    unverifyAmount: arr[i][0].unverifyAmount,
                    readOnlyAmount: arr[i][0].unverifyAmount,
                    amount: arr[i][0].amount,
                    remark: arr[i][0].remark,
                    'subjectEntity.fullSubjectName': arr[i][0]['subjectEntity.fullSubjectName'] || arr[i][0]['subject.fullSubjectName'],
                    'auxpropertyNames': arr[i][0].auxpropertyNames
                }
                // 单据号处理,需要显示一下这个信息, 这里还要加一个判断
                if(!!arr[i][0].receivablebillCode)
                    // 应收单单号
                    temp.receivablebillCode = arr[i][0].receivablebillCode
                else
                    // 应付单单号
                    temp.billCode = arr[i][0].billCode
                newArr.push(temp)
            }
        }
        dd.setStorage({
            key: 'importList',
            data: newArr,
            success: res => {
                console.log('导入应付单列表成功')
                dd.navigateTo({
                    url: '/pages/importYingshouInputList/index'
                })
            }
        })
    },
})
