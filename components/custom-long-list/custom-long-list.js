// 自定义长列表
// 只加载 range 个内的请求数据,防止setData数据过多导致白屏问题
//在请求第4条数据时将第一个移除，将新数据放在最后

import {
  debounce,
  voidFunction
} from "../../utils/util"

class Database {
  constructor(list = [], index = 0) {
    this.list = list
    this.index = index
  }
  get length() {
    return this.list.length || 0
  }
  /**
   * 添加数据
   * @param {Array} newList 
   */
  add(newList = []) {
    this.list.push(newList)
  }
  /**
   * 获取
   * @param {Number} index 
   */
  getItem(index) {
    return this.list[index] || []
  }
  /**
   * 
   * @param {Number} index 最后一个项的index
   * @param {Number} range 取值范围（返回数据量）
   * @param {String} type 数据拉去方式
   */
  getList (index, range, type = 'bottom') {
    let isTop = false
    let start = index - range + 1
    let end = index + 1
    if (start < 0) {
      isTop = true
      start = 0
    }
    let newList = this.list.slice(start, end)
    let selectorIndex = ''
    if (type == 'top') {
      let index1 = 1
      // 回到页面顶部，选择器为第一个的longListindex，而不是第二个
      if (isTop) {
        index1 = 0
      }
      let list1 = newList[index1] || []
      let obj = list1[0] || {}
      selectorIndex = obj.LongListIndex
    } else {
      let index1 = newList.length - 2
      let list1 = newList[index1] || []
      let obj = list1[list1.length - 1] || {}
      selectorIndex = obj.LongListIndex
    }
    let list2 = []
    for (let i in newList) {
      list2 = [...list2, ...newList[i]]
    }
    return {
      list: list2, // 显示的列表
      selectorIndex, // 选择器，用于使用wx.pageScrollTo跳转
    }
  }
  /**
   * 设置当前最后一项的index
   * @param {Number} index 
   */
  setIndex(index) {
    this.index = index
  }
  /**
   * 重新设置全部的列表数据
   * @param {Array} list 
   */
  setList (list) {
    this.list = list
  }
  /**
   * 清空列表
   */
  clear() {
    this.list = []
  }
}

let database = new Database()

Component({
  properties: {
    // 距离顶部多远时拉取上条数据
    upperThreshold: {
      type: Number,
      value: 200
    },
    range: {
      type: Number,
      value: 3
    }
  },
  data: {
    /**
     * 更新页面数据方法
     * @param {Array} list 返回的列表
     * @param {Number} selectorIndex 返回的选择器id
     * @param {String} type 返回数据是上拉: bottom 还是下拉: top
     */
    editList: voidFunction,
    pageMethods: { // 页面方法
      onPullDownRefresh: voidFunction, // 页面下拉刷新
      onReachBottom: voidFunction, // 页面上拉到底
    },
    isPageTop: true, // 是否在页面顶部
  },
  observers: {
    isPageTop(isPageTop) {
      console.log('是否在顶部', isPageTop)
    }
  },
  methods: {
    /**
     * 初始化长列表
     * @param {*} options 
     */
    init(options = {}) {
      let onPullDownRefresh = options.onPullDownRefresh || voidFunction
      let onReachBottom = options.onReachBottom || voidFunction
      let editList = options.editList || voidFunction
      this.setData({
        editList,
        pageMethods: {
          onPullDownRefresh,
          onReachBottom
        }
      })
    },
    /**
     * 添加数据
     * @param {array} newList 新数据列表
     * 
     */
    add(newList = []) {
      let {
        range
      } = this.data
      database.add(newList)
      let data = database.getList(database.length - 1, range, 'bottom')
      this.data.editList(data.list, data.selectorIndex, 'bottom')
    },
    /**
     * 页面到顶部时触发
     */
    onPagePullDownRefresh() {
      if (!this.data.isPageTop) {
        return
      }
      this.reset()
      this.data.pageMethods.onPullDownRefresh()
    },
    /**
     * 重置全部数据
     */
    reset() {
      database.clear()
      database.setIndex(0)
    },
    /**
     * 页面到底部时触发
     */
    onPageReachBottom() {
      let {
        range
      } = this.data
      let pageIndex = database.index
      let length = database.length
      database.setIndex(pageIndex + 1)
      // 数据超过范围则判断是否要使用database中的数据
      if (length >= range) {
        // 页码超过range条数据，则不在页面顶部
        if (pageIndex >= (range - 1)) {
          this.setData({
            isPageTop: false
          })
        }
        let newList = database.getItem(pageIndex + 1) || []
        if (newList.length > 0) {
          let data = database.getList(pageIndex + 1, range, 'bottom')
          this.data.editList(data.list, data.selectorIndex, 'bottom')
          return
        }
      }
      // 底部拉取新数据
      this.data.pageMethods.onReachBottom()
    },
    /**
     * 监听页面滚动
     * 滚动到顶部拉去上条数据
     * 
     * 使用了函数节流
     */
    onPageScroll: debounce(function (e) {
      let {
        upperThreshold,
        range
      } = this.data
      // 判断滚动距离
      if (e.scrollTop < upperThreshold) {
        let pageIndex = database.index - (range - 1)
        // 还未加载到range条以上，到顶部时无需拉去数据
        if (database.length <= range) {
          return
        }
        // 在第一页无需滚动到顶部刷新
        if (pageIndex < 0) {
          return
        }
        database.setIndex(database.index - 1)
        let data = database.getList(database.index, range, 'top')
        this.data.editList(data.list, data.selectorIndex, 'top')
        // 如果数据为前range条，则为回到了页面顶部
        if (database.index < range) {
          this.setData({
            isPageTop: true
          })
        }
      }
    }, 1000)
  }
})