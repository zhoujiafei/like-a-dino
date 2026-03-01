/**
 * 游戏开发者：程序员加菲猫
 * 游戏名称：Like A Dino!
 */

import { AudioManager } from './AudioManager'

//音效管理类
export default class AudioEffect {
  //播放通用的音效
  static playCommonAudio(audioUrl: string): void {
    if (!audioUrl) {
      return
    }
    //播放音效
    AudioManager.inst.playOneShot(audioUrl)
  }
  //播放点击音效
  public static playClickAudio() {
    let audioUrl = 'audios/common/click'
    AudioEffect.playCommonAudio(audioUrl)
  }

  //播放撒金币的音效
  public static playGoldAudio() {
    let audioUrl = 'audios/common/gold'
    AudioEffect.playCommonAudio(audioUrl)
  }

  //播放金币入账的音效
  public static playCoinsEntryAudio() {
    let audioUrl = 'audios/common/coins_entry'
    AudioEffect.playCommonAudio(audioUrl)
  }
}
