Page({
    data: {
        webViewUploadUrl: 'https://www.caika.net/test/aliyunController.do?goUploadFile&v=' + new Date().getTime(),
        webViewPreviewUrl: 'https://www.caika.net/test/aliyunController.do?goPreviewFile&v=' + new Date().getTime(),
        url:''
    },
    onLoad(query) {
        this.previewWebViewContext = dd.createWebViewContext('web-view-preview');
        let url = ''
        if(query.url) {
            // 预览
            this.setData({
                url: this.data.webViewPreviewUrl
            })
            setTimeout(() => {
                this.previewWebViewContext.postMessage({
                    url: query.url
                })
            }, 1000)
        }else{
            // 上传
            this.setData({
                url: this.data.webViewUploadUrl
            })
        }
    },
    onMessage(e) {
        if(this.data.url === this.data.webViewUploadUrl) {
            this.receiveUploadMessage(e)
        } else{
            this.receivePreviewMessage(e)
        }
    },
    receivePreviewMessage(e) {
        if(e.detail.back) {
            dd.navigateBack({
                delta: 1
            })
        }
    },
    receiveUploadMessage(e) {
        const billFilesList = e.detail.fileLists
        billFilesList && dd.setStorage({
            key: 'uploadFileList',
            data: billFilesList,
            success: () => {
                dd.navigateBack({
                    delta: 1
                })
            }
        })
    },
})