const app = getApp()
const mock = require('../../mock/index_1')
import {
  deepClone
} from "../../utils/util"

let locked = false

Page({
  data: {
    list: [],
    pageIndex: 1,
    loaded: false,
    hasMore: true
  },
  onLoad() {
    this.initCustomLongList()
    this.getDataList()
  },
  /**
   * 加载自定义长列表
   */
  initCustomLongList() {
    let t = this
    let component = this.selectComponent('#customLongList')
    component.init({
      /**
       * 设置页面数据
       * @param {*} list 
       */
      editList(newList = [], selectorIndex = '', type = '') {
        let selector = `#long_${selectorIndex}`
        let offsetTop = 0
        let query = wx.createSelectorQuery()
        query.select(selector).fields({
          rect: true
        }).exec((res) => {
          t.setData({
            list: newList
          }, function () {
            let duration = 0
            if (type == 'bottom') {
              let item = res[0] || {}
              let top = item.top || 0
              if (top > 0) {
                offsetTop = -top
              }
            }
            wx.pageScrollTo({
              selector,
              offsetTop,
              duration,
            })
          })
        })
      },
      /**
       * 将页面onPulldownRefresh内移到此位置
       */
      onPullDownRefresh() {
        wx.stopPullDownRefresh()
        t.setData({
          list: [],
          pageIndex: 1,
          loaded: false,
          hasMore: true
        })
        locked = true
        t.getDataList()
      },
      /**
       * 将页面onReachBottom内的代码移道此位置
       */
      onReachBottom() {
        let {
          pageIndex,
          hasMore
        } = t.data
        if (!hasMore) {
          return
        }
        if (locked) {
          return
        }
        locked = true
        t.setData({
          pageIndex: pageIndex + 1
        })
        t.getDataList()
      }
    })
    this.$customLongList = component
  },
  onPageScroll(e) {
    this.$customLongList.onPageScroll(e)
  },
  getDataList() {
    let that = this
    let {
      list,
      pageIndex
    } = this.data
    let data = {
      pageIndex
    }
    console.log('从服务器获取数据')
    mock.getDataList(data).then((res) => {
      res = deepClone(res)
      res = res.map((item, index) => {
        item.LongListIndex = (pageIndex - 1) * res.length + index
        return item
      })
      this.$customLongList.add(res)
      this.setData({
        hasMore: true,
        loaded: true
      })
      locked = false
    })
  },
  onPullDownRefresh() {
    wx.stopPullDownRefresh()
    this.$customLongList.onPagePullDownRefresh()
  },
  onReachBottom() {
    this.$customLongList.onPageReachBottom()
  },
  onUnload() {
    locked = false
  }
})