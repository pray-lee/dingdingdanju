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
        fileList: [],
        importBorrowList: []

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
        var importDetail = e.currentTarget.dataset.detail
        var importList = this.data.importList.filter(item => {
            return item !== importDetail
        })
        this.setData({
            importList
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
    // 导入
    handleAddBorrow(e) {
            console.log(e)
            this.onAddHide()
    },
    handleUpload() {
        // dd.uploadAttachmentToDingTalk({
        //     image:{multiple:true,compress:false,max:9,spaceId: "12345"},
        //     // space:{corpId:"xxx3020",spaceId:"12345",isCopy:1 , max:9},
        //     file:{spaceId:"12345",max:1},
        //     types:["photo","camera","file"],//PC端支持["photo","file","space"]
        //     success: res => {
        //         console.log(res)
        //     },
        //     file: err => {
        //         console.log(err)
        //     }
        // })
    },
    onCheckboxChange(e) {
        console.log(e)
    },
    onCheckboxSubmit(e) {
        var importList = e.detail.value['import-borrow-list']
        this.setData({
            importList
        })
        this.onAddHide()
    }
})
