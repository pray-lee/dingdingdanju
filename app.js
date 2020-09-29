import {login} from "./util/getErrorMessage";

App({
    onLaunch(options) {
        console.log('running....')
        // 获取设备信息
        const {isIphoneXSeries} = dd.getSystemInfoSync()
        this.globalData.isPhoneXSeries = isIphoneXSeries ? true : false
    },
    onShow(options) {
        // 从后台被 scheme 重新打开
        // options.query == {number:1}
        // login(this)
    },
    globalData: {
        // "corpId": "ding2fac28f4bbc361e435c2f4657eb6378f",
        // "CustomKey": "suiteledp8nm95trck3th",
        // "CustomSecret": "pAw2w2JgcMMsF2HW7N0ik3bP0lvEvnxw_nkQRbRSBa1TQs7CbPP-hW836RoGoTAW",
        // ----------------------config-----------------------------
        // 电商 (爱在当下)
        // "url": "https://www.caika.net/DS/",
        // "agentId": "886493470"
        // 票房宝
        // "url": "https://www.caika.net/WH/",
        // "agentId": "874431275"
        // 医疗
        // "url": "https://www.caika.net/MedicalService/",
        // "agentId": "878913385"
        // 智取科技
        "url": "https://www.caika.net/MedicalService/",
        "agentId": "893637276"
        // CaiKa
        // "url": "https://www.caika.net/CaiKa/",
        // "agentId": '827902921'
        // zszh
        // "url": "https://www.caika.net/zszh/",
        // "agentId": "831167331",
        // 文化
        // "url": "https://www.caika.net/WH/",
        // "agentId": "831342992"
        // 测试环境进销存
        // "url": "http://39.96.59.19:8081/Test/",
        // 测试环境test
        // "url": "https://www.caika.net/Test/",
        // 于龙测试
        // "agentId": "835144677"
        // 企业服务商的app
        // "agentId": '782995014'
        // 测试集团
        // "url": "https://www.caika.net/CaiKaDemo/",
        // "agentId": '830995107'
        // 测试环境钉钉
        // "agentId": '659831320'
        // 王佩云
        // "agentId": "833040724"
        //李宗英
        // "agentId": "833082754"
        //刘旭梦
        // "agentId": "833070768"
        // 唱红丽
        // "agentId": "833091620"
    }
});
