/** 
 * 游戏开发者：程序员加菲猫 
 * 游戏名称：Like A Dino! 
 */

import { _decorator, Color, Component, director } from 'cc'
import { EventDispatcher } from '../../libs/EventDispatcher'
import AudioEffect from '../../libs/AudioEffect'
import Common from '../../libs/Common'
import GlobalData from '../../config/GlobalData'
const { ccclass, property } = _decorator

@ccclass('PauseModal')
export class PauseModal extends Component {
  start() {
    //隐藏游戏结束界面
    this.node.active = false
    //设置弹窗的位置到屏幕中间
    this.node.setPosition(0, 0)
    //注册监听打开暂停界面的事件
    EventDispatcher.getTarget().on(
      EventDispatcher.SHOW_PAUSE_MODAL,
      this.showModal,
      this
    )
  }

  //显示暂停界面
  showModal() {
    //播放音效
    AudioEffect.playClickAudio()
    //设置当前页面的背景颜色
    this.setBackgroundColor()
    //显示弹窗
    this.node.active = true
    //暂停游戏
    director.pause()
    //暂停音乐
    EventDispatcher.getTarget().emit(EventDispatcher.GAME_PAUSE)
    //同时打卡继续游戏弹窗
    EventDispatcher.getTarget().emit(EventDispatcher.SHOW_CONTINUE_MODAL, {
      noPlayAudio: true
    })
  }

  //关闭暂停界面
  closeModal() {
    this.node.active = false
    //恢复游戏
    director.resume()
  }

  //继续游戏
  resumeGame() {
    //播放点击音效
    this.closeModal()
  }

  //回到首页
  backToHome() {
    //播放点击音效
    AudioEffect.playClickAudio()
    //恢复游戏
    director.resume()
    //加载首页场景
    director.loadScene('home')
  }

  //设置当前页面的背景颜色
  setBackgroundColor() {
    //获得当前的小恐龙信息
    const dinoInfo = GlobalData.currentDinoInfo
    //设置背景颜色
    Common.setPageBackgroundColor(
      this.node.getChildByName('bg'),
      new Color(dinoInfo?.bgColor)
    )
  }

  update(deltaTime: number) {}
}
