var app = getApp()
Page({
   data:{
      isPhoneXSeries: false,
      borrowList: [],
      searchResult: [],
      inputValue: ''
   },
   onLoad() {
      this.setData({
         isPhoneXSeries: app.globalData.isPhoneXSeries
      })
      dd.getStorage({
         key: 'borrowList',
         success: res => {
            this.setData({
               borrowList: res.data,
               searchResult: res.data
            })
         }
      })
   },
   goBack(e) {
      const id = e.currentTarget.dataset.id
      dd.setStorage({
         key: 'borrowId',
         data: id,
          success: res => {
             console.log('借款人缓存成功！！！')
             dd.navigateBack({
                delta: 1
             })
          }
      })
   },
   onInput(e) {
      const value = e.detail.value
      if(!!app.globalData.timeOutInstance) {
          clearTimeout(app.globalData.timeOutInstance)
      }
      this.setData({
         inputValue: value
      })
      this.searchFn(value)
   },
   clearWord() {
      this.setData({
         inputValue: ''
      })
      this.searchFn('')
   },
   searchFn(value) {
       app.globalData.timeOutInstance = setTimeout(() => {
          var searchResult = this.data.borrowList.filter(item => item.name.indexOf(value) !== -1)
          this.setData({
             searchResult: searchResult
          })
       }, 300)
   }
})
