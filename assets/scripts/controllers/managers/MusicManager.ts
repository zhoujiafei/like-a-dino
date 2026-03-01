/** 
 * 游戏开发者：程序员加菲猫 
 * 游戏名称：Like A Dino! 
 */

import { _decorator, Component, AudioClip } from 'cc'
import { EventDispatcher } from '../../libs/EventDispatcher'
import { SpeedAudioPlayer } from '../../libs/SpeedAudioPlayer'
import GlobalData from '../../config/GlobalData'
const { ccclass, property } = _decorator

@ccclass('MusicManager')
export class MusicManager extends Component {
  //音频播放器
  private audioPlayer: SpeedAudioPlayer = null

  //音频剪辑列表
  @property({
    type: [AudioClip],
    tooltip: '音频剪辑列表'
  })
  audioClips: AudioClip[] = []

  //当前选择的音频剪辑索引
  private currentAudioClipIndex: number = 0

  async onLoad() {
    //设置当前选择的音频剪辑
    this.currentAudioClipIndex = GlobalData.selectedMusicID - 1
    //初始化音频播放器
    this.audioPlayer = new SpeedAudioPlayer()
    //初始化音频
    await this.audioPlayer.init(this.audioClips[this.currentAudioClipIndex])
  }

  start() {
    //监听游戏暂停事件
    EventDispatcher.getTarget().on(EventDispatcher.GAME_PAUSE, this.pause, this)
    //监听游戏继续事件
    EventDispatcher.getTarget().on(
      EventDispatcher.GAME_RESUME,
      this.resume,
      this
    )
    //监听游戏结束事件
    EventDispatcher.getTarget().on(EventDispatcher.GAME_OVER, this.stop, this)
  }

  //播放音乐
  async play() {
    //播放之前判断是否需要切换音频
    if (this.currentAudioClipIndex !== GlobalData.selectedMusicID - 1) {
      //切换音频
      this.currentAudioClipIndex = GlobalData.selectedMusicID - 1
      //初始化音频
      await this.audioPlayer.changeAudioClip(
        this.audioClips[this.currentAudioClipIndex]
      )
    }
    // 初始速率播放
    this.audioPlayer.play(GlobalData.speedRate)
    // 设置初始音量
    this.audioPlayer.setVolume(1.0)
  }

  //暂停音乐
  pause() {
    this.audioPlayer.pause()
  }

  //停止音乐
  stop() {
    this.audioPlayer.stop()
  }

  //继续播放音乐
  resume() {
    this.audioPlayer.resume()
  }

  update(deltaTime: number) {}
}
