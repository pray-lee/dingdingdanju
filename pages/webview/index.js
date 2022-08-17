Page({
    data: {
        webViewUploadUrl: 'http://192.168.10.224:8080/caika/aliyunController.do?goUploadFile',
        webViewPreviewUrl: 'http://192.168.10.224:8080/caika/aliyunController.do?goPreviewFile',
        url:''
    },
    onLoad(query) {
        this.previewWebViewContext = dd.createWebViewContext('web-view-preview');
        let url = ''
        if(query.url) {
            this.setData({
                url: this.data.webViewPreviewUrl
            })
            setTimeout(() => {
                this.previewWebViewContext.postMessage({
                    url: query.url
                })
            }, 1000)
        }else{
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