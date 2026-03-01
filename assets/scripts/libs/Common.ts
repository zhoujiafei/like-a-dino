/** 
 * 游戏开发者：程序员加菲猫 
 * 游戏名称：Like A Dino! 
 */

import { Color, Node, Sprite } from 'cc'
import GlobalData from '../config/GlobalData'
import { DataManager } from './DataManager'

//公共业务方法类
export default class Common {
  /**
   * 加载对应的音乐音符数据
   * @param musicID 音乐ID
   * @returns 音乐音符数据对象
   */
  public static async loadMusicNoteData(musicID: number): Promise<any | null> {
    return await DataManager.loadJson<any>(`data/music_${musicID}`)
  }

  /**
   * 检查是否解锁了指定的音乐
   * @param musicID 音乐ID
   * @returns 是否解锁了指定的音乐
   */
  public static isMusicUnlocked(musicID: number): boolean {
    return GlobalData.unlockMusicIDList?.includes(musicID)
  }

  /**
   * 解锁指定的音乐
   * @param musicID 音乐ID
   */
  public static unlockMusic(musicID: number) {
    //如果已经解锁了，则直接返回
    if (Common.isMusicUnlocked(musicID)) {
      return
    }
    let unlockMusicIDList = GlobalData.unlockMusicIDList || []
    //解锁音乐,并存储到本地缓存中
    unlockMusicIDList?.push(musicID)
    //更新本地缓存
    GlobalData.unlockMusicIDList = unlockMusicIDList
  }

  /**
   * 检查是否解锁了指定的小恐龙
   * @param dinoID 小恐龙ID
   * @returns 是否解锁了指定的小恐龙
   */
  public static isDinoUnlocked(dinoID: number): boolean {
    return GlobalData.unlockDinoIDList?.includes(dinoID)
  }

  /**
   * 解锁指定的小恐龙
   * @param dinoID 小恐龙ID
   */
  public static unlockDino(dinoID: number) {
    //如果已经解锁了，则直接返回
    if (Common.isDinoUnlocked(dinoID)) {
      return
    }
    let unlockDinoIDList = GlobalData.unlockDinoIDList || []
    //解锁小恐龙,并存储到本地缓存中
    unlockDinoIDList?.push(dinoID)
    //更新本地缓存
    GlobalData.unlockDinoIDList = unlockDinoIDList
  }

  /**
   * 设置页面背景色
   * @param node 页面节点
   * @param color 背景色
   */
  public static setPageBackgroundColor(node: Node, color: Color) {
    node.getComponent(Sprite).color = color
  }
}
