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
        dd.showToast({
            content: 'back to pages/index in 1s',
            success: (res) => {
                setTimeout(() => {
                    // dd.navigateBack();
                    dd.navigateTo({
                        url: '/pages/index/index'
                    })
                }, 1000);
            },
        });
    }
})
