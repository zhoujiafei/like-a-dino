/** 
 * 游戏开发者：程序员加菲猫 
 * 游戏名称：Like A Dino! 
 */

import { _decorator, JsonAsset, resources } from 'cc'
const { ccclass, property } = _decorator

@ccclass('DataManager')
export class DataManager {
  /**
   * 从resources目录读取JSON文件
   * @param path 文件路径（不包含扩展名）
   */
  public static async loadJson<T>(path: string): Promise<T | null> {
    return new Promise((resolve) => {
      resources.load(path, JsonAsset, (err, asset) => {
        if (err) {
          console.error(`加载JSON文件失败: ${path}`, err)
          resolve(null)
          return
        }
        resolve(asset.json as T)
      })
    })
  }
}
