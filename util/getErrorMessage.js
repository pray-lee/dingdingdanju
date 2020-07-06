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
    dd.alert({
        content: '提交成功',
        buttonText: '确定',
        success: () => {
            dd.navigateTo({
                url: '/pages/index/index'
            })
        },
    });
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

const formatData = (s, n) => {
    s += "";
    if (!s || isNaN(s) || s == "") {
        return;
    }
    if (n === undefined) {
        n = 2;
    }
    if (s.substr(0, 1) == "-") {
        s = s.substr(1);
        s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
        var l = s.split(".")[0].split("").reverse(),
            r = s.split(".")[1];
        t = "";
        for (i = 0; i < l.length; i++) {
            t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
        }
        return "-" + t.split("").reverse().join("") + "." + r;
    } else {
        s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
        var l = s.split(".")[0].split("").reverse(),
            r = s.split(".")[1];
        t = "";
        for (i = 0; i < l.length; i++) {
            t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
        }
        return t.split("").reverse().join("") + "." + r;
    }
}

export {
    getErrorMessage,
    submitSuccess,
    loginFiled,
    formatData
}
