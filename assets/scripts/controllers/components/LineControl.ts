/** 
 * 游戏开发者：程序员加菲猫 
 * 游戏名称：Like A Dino! 
 */

import { _decorator, Collider2D, Component, Contact2DType } from 'cc'
import GlobalData from '../../config/GlobalData'
import { GameState } from '../../config/Config'
import { NoteControl } from './NoteControl'
import { EventDispatcher } from '../../libs/EventDispatcher'
const { ccclass, property } = _decorator

@ccclass('LineControl')
export class LineControl extends Component {
  start() {
    //开启碰撞检测
    this.node
      .getComponent(Collider2D)
      .on(Contact2DType.BEGIN_CONTACT, this.onCollisionEnter, this)
  }

  //碰撞检测
  onCollisionEnter(selfCollider: Collider2D, otherCollider: Collider2D) {
    //如果游戏状态不是游戏进行中,则不执行碰撞检测
    if (GlobalData.gameState != GameState.PLAYING) {
      return
    }
    //如果碰撞的是音符
    if (otherCollider.tag === 2) {
      //剩余生命值-1
      GlobalData.lifeNumPerRound--
      //发送剩余生命值改变的事件
      if (GlobalData.lifeNumPerRound >= 0) {
        EventDispatcher.getTarget().emit(EventDispatcher.UPDATE_LIFE)
      }
      //如果剩余生命值小于0,则游戏结束
      if (GlobalData.lifeNumPerRound < 0) {
        //碰撞到线之后游戏结束
        GlobalData.gameState = GameState.GAME_OVER
        //调用音符撞线的方法
        otherCollider.getComponent(NoteControl).noteHitLine()
        //发送游戏结束的事件
        EventDispatcher.getTarget().emit(EventDispatcher.GAME_OVER)
      } else {
        //游戏暂停
        GlobalData.gameState = GameState.PAUSE
        //调用音符撞线的方法
        otherCollider.getComponent(NoteControl).noteHitLine()
        //发送游戏结束的事件
        EventDispatcher.getTarget().emit(EventDispatcher.GAME_PAUSE)
      }
    }
  }

  update(deltaTime: number) {}
}
