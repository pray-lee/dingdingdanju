const getErrorMessage = string => {
    const error = string.match(/<\/P>[\W\w]+<P>/gi)[0]
    const newError = error.replace(/<[^>]+>/gi, "")
    const result = newError.replace(/[\r\n]/gi, "")
    dd.alert({
        content: result,
        buttonText: '确定',
        success: () => {
        },
    });
}

const submitSuccess = () => {
    console.log('submit success...')
    dd.reLaunch({
        url: '/pages/index/index'
    })
}

const previewFile = url => {
    const imgArr = ['jpg', 'jpeg', 'png', 'gif']
    if(imgArr.some(item => url.indexOf(item) !== -1)) {
        dd.previewImage({
            urls:[url]
        })
    }else{
        dd.navigateTo({
            url: '/pages/webview/index?url=' + url
        })
    }
}

const loginFiled = (msg = "") => {
    dd.alert({
        title: '登录失败',
        content: msg,
        buttonText: '确定',
        success: () => {
            dd.reLaunch({
                url: '../error/index'
            })
        },
    });
}

const formatNumber = (num) => {
    return num && num.toString().replace(/\d+/, function (s) {
        return s.replace(/(\d)(?=(\d{3})+$)/g, '$1,')
    })
}

const validFn = message => {
    dd.showToast({
        type: 'none',
        content: message
    })
}

const login = (app) => {
    dd.getAuthCode({
        success: (res) => {
            dd.httpRequest({
                url: app.globalData.url + "loginController.do?loginDingTalk&code=" + res.authCode + '&agentId=' + app.globalData.agentId,
                method: "GET",
                dataType: "json",
                success: res => {
                    if (res.data.success) {

                    } else {
                        console.log(res.data.msg)
                        loginFiled(res.data.msg)
                    }
                },
                fail: res => {
                    console.log(res, 'fail')
                    if (res.error == 19) {
                        loginFiled()
                    }
                    if (res.error == 12) {
                        loginFiled('网络异常')
                    }
                },
            })
        },
        fail: res => {
            console.log(res, 'outer failed')
            loginFiled('当前组织没有该小程序')
        }
    })
}

const request = option => {
    dd.httpRequest({
        url: option.url,
        dataType: 'json',
        data: option.data,
        headers: option.headers ||  {'Content-Type': 'application/x-www-form-urlencoded'},
        method: option.method,
        success: res => {
            if (typeof res.data !== 'string' || res.data.indexOf('主框架') === -1 || res.data.success) {
                option.success(res)
            }else{
                dd.reLaunch({
                    url: '/pages/index/index'
                })
            }
        },
        fail: res => {
            if (typeof option.fail === 'function') {
                option.fail(res)
            }
        },
        complete: res => {
            if (typeof option.complete === 'function') {
                option.complete(res)
            }
            if (typeof option.hideLoading === 'function') {
                option.hideLoading()
            }
        }
    })
}

export {
    getErrorMessage,
    submitSuccess,
    loginFiled,
    formatNumber,
    validFn,
    login,
    request,
    previewFile
}
