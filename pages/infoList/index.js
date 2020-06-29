Page({
   data:{
      borrowList: [],
   },
   onLoad() {
      dd.getStorage({
         key: 'borrowList',
         success: res => {
            this.setData({
               borrowList: res.data
            })
         }
      })
   },
   goBack(e) {
      const id = e.currentTarget.dataset.id
      console.log(id)
      dd.setStorageSync({
         key: 'borrowId',
         data: id,
      })
      console.log('借款人缓存成功！！！')
      dd.navigateBack({
         delta: 1
      })
   }
})
