/** 
 * 游戏开发者：程序员加菲猫 
 * 游戏名称：Like A Dino! 
 */

import { sys } from 'cc'

export default class Utils {
  /**
   *
   * @param {缓存key} key
   * @param {需要存储的缓存值} value
   * @param {过期时间} expire
   */
  static setCache(key: string, value: any, expire: number = 0): void {
    let obj = {
      data: value, //存储的数据
      time: Date.now() / 1000, //记录存储的时间戳
      expire: expire //记录过期时间，单位秒
    }
    sys.localStorage.setItem(key, JSON.stringify(obj))
  }
  /**
   *
   * @param {缓存key} key
   */
  static getCache(key: string): any {
    let val: any = sys.localStorage.getItem(key)
    if (!val) {
      return null
    }
    val = JSON.parse(val)
    if (val.expire && Date.now() / 1000 - val.time > val.expire) {
      sys.localStorage.removeItem(key)
      return null
    }
    return val.data
  }
}
