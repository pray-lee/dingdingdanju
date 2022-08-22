import {login} from "./util/getErrorMessage";

App({
    onLaunch(options) {
        console.log(options)
        console.log('running....')
        // 获取设备信息
        const {isIphoneXSeries} = dd.getSystemInfoSync()
        this.globalData.isPhoneXSeries = isIphoneXSeries ? true : false
        this.globalData.corpId = options.query.corpId
    },
    onShow(options) {
        // 从后台被 scheme 重新打开
// options.query == {number:1}
        // login(this)
    },
    globalData: {
        // "url": "https://www.caika.net/caika/",
        // agentId: '1249138757',
        // tenantCode: 'db_ck_oa',
        // "corpId": "ding2fac28f4bbc361e435c2f4657eb6378f",
        // "CustomKey": "suiteledp8nm95trck3th",
        // "CustomSecret": "pAw2w2JgcMMsF2HW7N0ik3bP0lvEvnxw_nkQRbRSBa1TQs7CbPP-hW836RoGoTAW",
        // ----------------------config-----------------------------
        // 颜值时代生物科技有限公司
        "url": "https://www.caika.net/caika/",
        agentId: '1806744140',
        tenantCode: 'db_ck_ds2021',
        // 小丽都 西里食品
        // "url": "https://www.caika.net/caika/",
        // agentId: '1780714116',
        // tenantCode: 'db_ck_xld',
        //中大邑和
        // "url": "https://www.caika.net/caika/",
        // agentId: '1767231312',
        // tenantCode: 'db_ck_kh2021',
        // 大方向
        // "url": "https://www.caika.net/caika/",
        // agentId: '1630560875',
        // tenantCode: 'db_ck_wenhua2021',
        // 优客工厂
        // "url": "https://www.caika.net/ucommune-test/",
        // "url": "https://www.caika.net/ucommune/",
        // agentId: '1676278005',
        // tenantCode: 'db_ck_ucommune',
        // 石狮文旅研学旅行
        // "url": "https://www.caika.net/caika/",
        // agentId: '1298473947',
        // tenantCode: 'db_ck_education',
        // 寿司
        // "url": "https://www.caika.net/caika/",
        // agentId: '1297763523',
        // tenantCode: 'db_ck_zh2021',
        // 学齐智
        // "url": "https://www.caika.net/caika/",
        // agentId: '1222705047',
        // tenantCode: 'db_ck_education',
        // some some cocktal
        // "url": "https://www.caika.net/caika/",
        // agentId: '1208026881',
        // tenantCode: 'db_ck_kh2021',
        // 糖豆娱乐文化
        // "url": "https://www.caika.net/caika/",
        // agentId: '1174025008',
        // tenantCode: 'db_ck_wenhua2021',
        // 美时光
        // "url": "https://www.caika.net/caika/",
        // agentId: '1242286064',
        // tenantCode: 'db_ck_education',
        // 女神驾到
        // "url": "https://www.caika.net/caika/",
        // agentId: '1170508467',
        // tenantCode: 'db_ck_education',
        // 北京遇龙少年文化传媒有限公司
        // "url": "https://www.caika.net/caika/",
        // agentId: '1167607333',
        // tenantCode: 'db_ck_wenhua2021',
        // 成都依达智创科技有限公司
        // agentId: '1141861372',
        // tenantCode: 'db_ck_ldjh',
        // 朗利夫
        // agentId: '1107585282',
        // tenantCode: 'db_ck_llf',
        // 捷峰项目
        // agentId: '1129582065',
        // tenantCode: 'db_ck_qzweiming',
        // 挥戈项目
        // agentId: '1129521457',
        // tenantCode: 'db_ck_qzweiming',
        // 天港物业
        // "agentId": "1086314896",
        // "tenantCode": "db_ck_tgwy",
        // 栖梧教育
        // "url": "https://www.caika.net/caika/",
        // "agentId": "1056327836",
        // "tenantCode": "db_ck_customer",
        // 思无邪
        // "url": "https://www.caika.net/caika/",
        // "agentId": "1049398475",
        // "tenantCode": "db_ck_wenhua2021",
        // 中海外
        // "agentId": "1030661487",
        // "tenantCode": "db_ck_zhwjr",
        // 电商 (爱在当下)
        // "url": "https://www.caika.net/caika/",
        // "agentId": "886493470",
        // "tenantCode": "db_ck_ds2021",
        // 票房宝
        // "url": "https://www.caika.net/caika/",
        // "agentId": "874431275",
        // "tenantCode": "db_ck_zh2021",
        // 看场影业
        // "url": "https://www.caika.net/caika/",
        // "agentId": "972063429",
        // "tenantCode": "db_ck_wenhua2021",
        // 贵州旭丰升企业管理有限公司
        // "url": "https://www.caika.net/caika/",
        // "agentId": "1020654372",
        // "tenantCode": "db_ck_wenhua",
        // 小苹果
        // "url": "https://www.caika.net/MedicalService/",
        // "url": "https://www.caika.net/caika/",
        // "agentId": "878913385",
        // "tenantCode": "db_ck_medicine2021",
        // 智取科技
        // "url": "https://www.caika.net/caika/",
        // "agentId": "893637276",
        // "tenantCode": "db_ck_education",
        // 奇异设计
        // "url": "https://www.caika.net/caika/",
        // "agentId": "1103399428",
        // "tenantCode": "db_ck_zh2021",
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
        // "url": "https://www.caika.net/saas/",
        // "url": "http://192.168.1.121:8080/jeecg/",
        // 测试环境test
        // 于龙测试
        // "url": "https://www.caika.net/jeecg/",
        // "url": "https://www.caika.net/caika/",
        // "agentId": "1249138757",
        // "tenantCode": "db_ck_pxxt",
        // 企业服务商的app
        // "agentId": '782995014'
        // 测试集团
        // "url": "https://www.caika.net/CaiKaDemo/",
        // "agentId": '830995107',
        // "tenantCode": "db_ck_demo",
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
        // 第三方
        // "url": "http://app66665.eapps.dingtalkcloud.com/forward/",
        // "url": "http://192.168.10.228:18080/forward/",
        // "url": "http://39.101.183.218/forward/",
        // "agentId": '66665',
        // "tenantCode": "zszh",
    }
});
