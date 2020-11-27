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
        // "agentId": "886493470",
        // "tenantCode": "db_ck_ds",
        // 票房宝
        // "url": "https://www.caika.net/WH/",
        // "agentId": "874431275",
        // "tenantCode": "db_ck_wenhua",
        // 看场影业
        // "url": "https://www.caika.net/WH/",
        // "agentId": "972063429",
        // "tenantCode": "db_ck_wenhua",
        // 贵州旭丰升企业管理有限公司
        // "url": "https://www.caika.net/fxcx/",
        // "agentId": "1020654372",
        // "tenantCode": "db_ck_wenhua",
        // 医疗
        // "url": "https://www.caika.net/MedicalService/",
        // "agentId": "878913385",
        // "tenantCode": "db_ck_medicine",
        // 智取科技
        // "url": "https://www.caika.net/MedicalService/",
        "agentId": "893637276",
        "tenantCode": "db_ck_medicine",
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
        // "url": "https://www.caika.net/TestJxc/",
        // saas
        "url": "https://www.caika.net/saas/",
        // "url": "http://192.168.1.121:8080/jeecg/",
        // 测试环境test
        // 于龙测试
        // "url": "https://www.caika.net/Test/",
        // "agentId": "835144677",
        // "tenantCode": "zszh",
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
