Page({
    data: {
        maskHidden: true,
        animationInfo: {},
        businessTime: '',
        submitTime: '',
        objectArray: [
            {
                id: 0,
                name: '美国',
            },
            {
                id: 1,
                name: '中国',
            },
            {
                id: 2,
                name: '巴西',
            },
            {
                id: 3,
                name: '日本',
            },
        ],
        arrIndex: 0,
        borrowList: [],
        borrowDetail: '',
        remark: '',
        fileList: []

    },
    formSubmit(e) {
        console.log(e.detail)
    },
    formReset() {
        console.log('formreset')
    },
    bindObjPickerChange(e) {
        console.log('picker发送选择改变，携带值为', e.detail.value);
        this.setData({
            arrIndex: e.detail.value,
        })
    },
    onBusinessFocus() {
       dd.datePicker({
           format: 'yyyy-MM-dd',
           currentDate: '2012-12-12',
           success: (res) => {
               this.setData({
                   businessTime: res.date,
               })
               // 解除focus不触发的解决办法。
               this.onClick()
           },
       })
    },
    onClick() {
        console.log('onClick')
    },
    onSubmitFocus() {
        dd.datePicker({
            format: 'yyyy-MM-dd',
            currentDate: '2012-12-12',
            success: (res) => {
                this.setData({
                    submitTime: res.date
                })
                // 解除focus不触发的解决办法。
                this.onClick()
            },
        })
    },
    onAddShow() {
        console.log(1)
        var animation = dd.createAnimation({
            duration: 250,
            timeFunction: 'ease-in'
        })
        this.animation = animation
        animation.translateY(0).step()
        this.setData({
            animationInfo: animation.export(),
            maskHidden: false
        })
        this.setData({
            borrowDetail: '',
            remark: ''
        })
    },
    onAddHide() {
        var animation = dd.createAnimation({
            duration: 250,
            timeFunction: 'ease-in'
        })
        this.animation = animation
        animation.translateY(300).step()
        this.setData({
            animationInfo: animation.export(),
            maskHidden: true
        })
    },
    onShow() {
        // 页面显示
        var animation = dd.createAnimation({
            duration: 250,
            timeFunction: 'ease-in'
        })
        this.animation = animation
        this.setData({
            animationInfo: animation.export()
        })
    },
    bindKeyInput(e) {
        // 借款详情
        if(e.currentTarget.dataset.type === 'borrowDetail'){
            this.setData({
                borrowDetail: e.detail.value
            })
        }
        // 备注
        if(e.currentTarget.dataset.type === 'remark'){
            this.setData({
                remark: e.detail.value
            })
        }
    },
    deleteBorrowDetail(e) {
        var borrowDetail = e.currentTarget.dataset.detail
        console.log(borrowDetail)
        var borrowList = this.data.borrowList.filter(item => {
            return item.borrowDetail !== borrowDetail
        })
        this.setData({
            borrowList
        })
    },
    deleteFile(e) {
        var file = e.currentTarget.dataset.file
        var fileList = this.data.fileList.filter(item => {
            return item !== file
        })
        this.setData({
            fileList
        })
    },
    handleAddBorrow() {
        if( this.data.borrowDetail!== ''){
            var obj = {
                borrowDetail:this.data.borrowDetail,
                remark:this.data.remark
            }
            var borrowList = this.data.borrowList.concat(obj)
            this.setData({
                borrowList
            })
            this.onAddHide()
        }
    },
    handleUpload() {
        console.log(1111)
        dd.chooseImage({
            count: 2,
            success: (res) => {
                this.setData({
                    fileList: this.data.fileList.concat(res.filePaths)
                })
            },
        })
    }
})
