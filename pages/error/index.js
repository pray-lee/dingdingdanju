import ErrorView from '../components/errorView';

Page({
    ...ErrorView,
    data: {
        errorData: {
            type: 'empty',
            title: '什么都没有了',
            button: '返回',
            onButtonTap: 'handleBack',
            href: '/pages/index/index',
        },
    },
    handleBack() {
        dd.reLaunch({
            url: '/pages/index/index'
        })
    }
})
