Page({
    data: {
        maskHidden: true,
        animationInfo: {},
        borrowAmount: '',
        remark: '',
        fileList: [],
        submitData: {
            billDetailList: []
        }
    },
    formSubmit(e) {
        console.log(e.detail)
        console.log(this.data)
    },
    bindObjPickerChange(e) {
        this.setData({
            submitData: {
                ...this.data.submitData,
                [e.currentTarget.dataset.name]: e.detail.value
            }
        })
    },
    onBlur(e) {
        console.log(e, 'blur')
        this.setData({
            submitData: {
                ...this.data.submitData,
                [e.currentTarget.dataset.name]: e.detail.value
            },
        })
    },
    onBusinessFocus() {
       dd.datePicker({
           format: 'yyyy-MM-dd',
           currentDate: '2012-12-12',
           success: (res) => {
               this.setData({
                   submitData: {
                       ...this.data.submitData,
                       businessTime: res.date
                   },
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
                    submitData: {
                        ...this.data.submitData,
                        submitDate: res.date
                    }
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
        this.setData({
            borrowAmount: '',
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
        if(e.currentTarget.dataset.type === 'borrowAmount'){
            this.setData({
                borrowAmount: e.detail.value
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
        var borrowAmount = e.currentTarget.dataset.detail
        console.log(borrowAmount)
        var billDetailList = this.data.submitData['billDetailList'].filter(item => {
            return item.borrowAmount !== borrowAmount
        })
        this.setData({
            submitData: {
                ...this.data.submitData,
                billDetailList
            }
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
        if( this.data.borrowAmount!== ''){
            var obj = {
                borrowAmount:this.data.borrowAmount,
                remark:this.data.remark
            }
            var billDetailList = this.data.submitData['billDetailList'].concat(obj)
            this.setData({
                submitData: {
                    ...this.data.submitData,
                    billDetailList
                }
            })
            this.onAddHide()
        }
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
})
