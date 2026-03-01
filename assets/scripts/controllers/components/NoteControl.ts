/** 
 * 游戏开发者：程序员加菲猫 
 * 游戏名称：Like A Dino! 
 */

import { _decorator, Color, Component, Sprite, tween, Vec3, view } from 'cc'
import { EventDispatcher } from '../../libs/EventDispatcher'
import GlobalData from '../../config/GlobalData'
import { GameState } from '../../config/Config'
const { ccclass, property } = _decorator

@ccclass('NoteControl')
export class NoteControl extends Component {
  //定义下落的速度
  speed: number = GlobalData.noteSpeed
  //是否开启下落
  isEnableFall: boolean = false

  start() {
    //监听游戏开始事件
    EventDispatcher.getTarget().on(
      EventDispatcher.GAME_START,
      this.startFall,
      this
    )
    //监听清空屏幕上的所有音符事件
    EventDispatcher.getTarget().on(
      EventDispatcher.CLEAR_SCREEN_NOTES,
      this.clearNotesInScreen,
      this
    )
  }

  //初始化音符
  initNote() {
    //设置音符的颜色
    this.setNoteColor()
  }

  //设置音符的颜色
  setNoteColor() {
    //获得当前的小恐龙信息
    const dinoInfo = GlobalData.currentDinoInfo
    //音符的颜色
    const noteColor = new Color(dinoInfo?.dinoColor)
    //设置音符的颜色
    this.node.getChildByName('note_img').getComponent(Sprite).color = noteColor
  }

  //开始下落
  startFall() {
    this.isEnableFall = true
  }

  //当前音符被小恐龙吃掉的方法
  noteBeEaten() {
    //销毁当前节点
    this.node?.removeFromParent()
    this.node?.destroy()
  }

  //当前音符撞到线的方法
  noteHitLine() {
    //获取文字提示节点
    let tipTextNode = this.node.getChildByName('tip_text')
    //显示文字提示
    tipTextNode.active = true
    //获取当前sprite组件的颜色属性
    let sprite = this.node.getChildByName('note_img').getComponent(Sprite)
    //获得音符的颜色(跟着小恐龙颜色走)
    let noteColor = new Color(GlobalData.currentDinoInfo?.dinoColor)
    //控制当前的音符闪烁3次
    tween(sprite)
      .repeat(
        3, // 重复执行3次
        tween()
          .to(0.2, {
            color: new Color(noteColor.r, noteColor.g, noteColor.b, 0)
          })
          .to(0.2, { color: noteColor })
      )
      .call(() => {
        //控制文字提示节点逐渐缩小并消失
        tween(tipTextNode)
          .to(0.5, { scale: new Vec3(0, 0, 0) })
          .call(() => {
            if (GlobalData.gameState == GameState.GAME_OVER) {
              //如果当前是游戏结束状态
              //清除当前界面上的所有音符
              EventDispatcher.getTarget().emit(EventDispatcher.CLEAR_ALL_NOTES)
              //然后0.1秒移动小恐龙到线的位置
              this.scheduleOnce(() => {
                EventDispatcher.getTarget().emit(
                  EventDispatcher.MOVE_DINO_TO_LINE
                )
              }, 0.1)
              //弹窗结束弹窗
              EventDispatcher.getTarget().emit(
                EventDispatcher.SHOW_RESULT_MODAL
              )
            } else if (GlobalData.gameState == GameState.PAUSE) {
              //如果当前是游戏暂停状态
              EventDispatcher.getTarget().emit(
                EventDispatcher.SHOW_CONTINUE_MODAL
              )
              //发送清空屏幕可视范围内的所有音符的事件
              this.scheduleOnce(() => {
                EventDispatcher.getTarget().emit(
                  EventDispatcher.CLEAR_SCREEN_NOTES
                )
              }, 0.1)
            }
          })
          .start()
      })
      .start()
  }

  //清空屏幕上的所有音符
  clearNotesInScreen() {
    if (this.checkIsInScreen()) {
      this.node?.removeFromParent()
      this.node?.destroy()
    }
  }

  //检测当前音符是否在屏幕范围内，如果在可视范围内则销毁
  checkIsInScreen() {
    //获取屏幕的可视区范围的宽度和高度
    const screenWidth = view.getVisibleSize().width
    const screenHeight = view.getVisibleSize().height
    // 获取节点世界坐标并转换为屏幕坐标
    const worldPos = this.node.getWorldPosition()
    // 判断屏幕坐标是否在屏幕范围内
    return (
      worldPos.x >= 0 &&
      worldPos.x <= screenWidth &&
      worldPos.y >= 0 &&
      worldPos.y <= screenHeight
    )
  }

  update(deltaTime: number) {
    //如果还没有允许下落或者游戏状态不是游戏进行中,则不执行下落逻辑
    if (!this.isEnableFall || GlobalData.gameState != GameState.PLAYING) {
      return
    }
    this.node.y -= this.speed * GlobalData.speedRate * deltaTime
    if (this.node.y < -800) {
      this.node.destroy()
    }
  }
}
