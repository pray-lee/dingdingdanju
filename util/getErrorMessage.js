const getErrorMessage = string => {
    const error = string.match(/<\/P>[\W\w]+<P>/gi)[0]
    const newError = error.replace(/<[^>]+>/gi, "")
    const result = newError.replace(/[\r\n]/gi,"")
    dd.alert({
        content: result,
        buttonText: '确定',
        success: () => {
        },
    });
}

const submitSuccess = () => {
    console.log('submit success...')
    dd.navigateTo({
        url: '/pages/index/index'
    })
}

const loginFiled = (msg="") => {
    dd.alert({
        title: '登录失败',
        content: msg,
        buttonText: '确定',
        success: () => {
            dd.navigateTo({
                url: '../error/index'
            })
        },
    });
}
const formatNumber = (num) => {
    return num && num.toString().replace(/\d+/, function(s){
            return s.replace(/(\d)(?=(\d{3})+$)/g, '$1,')
        })
}

export {
    getErrorMessage,
    submitSuccess,
    loginFiled,
    formatNumber,
}
