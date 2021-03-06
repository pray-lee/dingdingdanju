import moment from 'moment'
import clone from 'lodash/cloneDeep'
import {formatNumber} from "../../util/getErrorMessage";

const app = getApp()
Page({
    data: {
        tempImportList: [],
        filterList: [],
        startTime: '',
        endTime: '',
        isAllSelect:false,
        totalAmount: '0.00',
        num: 0,
        inputValue: ''
    },
    onLoad() {
    },
    onShow() {
        let tempImportList = dd.getStorageSync({
            key: 'tempImportList'
        }).data
        // 每一项加一个checked属性
        tempImportList.forEach(item => {
            item.checked = false
            item.formatUnverifyAmount = formatNumber(Number(item.unverifyAmount).toFixed(2))
        })
        this.setData({
            tempImportList,
            filterList: clone(tempImportList),
            isAllSelect: false
        })
    },
    onHide() {
    },
    onInput(e) {
        // 过滤
        this.setData({
            inputValue: e.detail.value
        })
        this.searchResultUseInput(e.detail.value)
    },
    clearWord() {
        this.setData({
            inputValue: ''
        })
        this.searchResultUseInput('')
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
        // 设置checked属性
        const checked = e.detail.value
        const idx = e.currentTarget.dataset.index
        const tempData = clone(this.data.filterList)
        tempData.forEach((item,index) => {
            if(index === idx) {
                item.checked = !!checked ? true : false
            }
        })
        // 全选联动
        let isAllSelect = false
        console.log(tempData.every(item => !!item.checked))
        if(tempData.every(item => item.checked)){
            isAllSelect = true
        }else{
            isAllSelect = false
        }
        this.setData({
            filterList: tempData,
            isAllSelect
        })
        this.caculateAmount()
    },
    // 全选
    onAllSelect(e) {
        const checked = e.detail.value
        let filterList = []
        if(!!checked) {
            filterList = this.data.filterList.map(item => ({
                ...item,
                checked: true
            }))
        }else{
            filterList = this.data.filterList.map(item => ({
                ...item,
                checked: false
            }))
        }
        this.setData({
            filterList,
            isAllSelect: checked ? true : false
        })
        this.caculateAmount()
    },
    caculateAmount() {
        let totalAmount = 0
        const checkList = this.data.filterList.filter(item => !!item.checked)
        checkList.forEach(item => {
            totalAmount += Number(item.unverifyAmount)
        })
        this.setData({
            totalAmount: formatNumber(Number(totalAmount).toFixed(2)),
            num: checkList.length
        })
    },
    searchResultUseTime(startTime, endTime) {
        startTime = startTime.replace(/\-/g, "/")
        console.log(startTime, 'startTime')
        startTime = new Date(startTime).getTime()
        endTime = endTime.replace(/\-/g, "/")
        endTime = new Date(endTime).getTime()
        const filterList = this.data.tempImportList.filter(item => {
            const businessDateTime = item.businessDateTime.split(' ')[0].replace(/\-/g, "/")
            if(!startTime && !!endTime) {
               return endTime >= new Date(businessDateTime).getTime()
            }else if(!endTime && !!startTime) {
                return startTime <= new Date(businessDateTime).getTime()
            }else if(!startTime && !endTime) {
                return true
            }else{
                return (startTime <= new Date(businessDateTime).getTime()) &&
                    (new Date(businessDateTime).getTime() <= endTime)
            }
        })
        this.setData({
            filterList,
            isAllSelect: false
        })
    },
    searchResultUseInput(text) {
        const filterList = this.data.tempImportList.filter(item => {
            const str = (item['subjectEntity.fullSubjectName'] || item['subject.fullSubjectName']) + (item.remark || '无')
            return str.indexOf(text) != -1
        })
        console.log(filterList)
        this.setData({
            filterList,
            isAllSelect: false
        })
    },
    onCheckboxSubmit() {
        const arr = this.data.filterList.filter(item => !!item.checked)
        var newArr = []
        for (var i = 0; i < arr.length; i++) {
            var temp = {
                ...arr[i],
                id: arr[i].id,
                billDetailId: arr[i].id,
                unverifyAmount: arr[i].unverifyAmount,
                readOnlyAmount: formatNumber(Number(arr[i].unverifyAmount).toFixed(2)),
                amount: arr[i].amount,
                remark: arr[i].remark,
                'subjectEntity.fullSubjectName': arr[i]['subjectEntity.fullSubjectName'] || arr[i]['subject.fullSubjectName'],
                'auxpropertyNames': arr[i].auxpropertyNames
            }
            // 单据号处理,需要显示一下这个信息, 这里还要加一个判断
            if(!!arr[i].receivablebillCode)
                // 应收单单号
                temp.receivablebillCode = arr[i].receivablebillCode
            else
                // 应付单单号
                temp.billCode = arr[i].billCode
            newArr.push(temp)
        }
        if(newArr.length) {
            dd.setStorage({
                key: 'importList',
                data: newArr,
                success: res => {
                    this.setData({
                        tempImportList: [],
                        filterList: [],
                        isAllSelect: false,
                        num: 0,
                        totalAmount: '0.00'
                    })
                    dd.navigateTo({
                        url: '/pages/importYingshouInputList/index'
                    })
                }
            })
        }else{
            dd.alert({
                content: '请选择单据再导入',
                buttonText: '好的'
            })
        }
    },
})
