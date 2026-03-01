/** 
 * 游戏开发者：程序员加菲猫 
 * 游戏名称：Like A Dino! 
 */

import {
  _decorator,
  Color,
  Component,
  EventTouch,
  Node,
  Sprite,
  tween,
  UITransform,
  Vec3
} from 'cc'
import { EventDispatcher } from '../../libs/EventDispatcher'
import AudioEffect from '../../libs/AudioEffect'
import GlobalData from '../../config/GlobalData'
import { GameState } from '../../config/Config'
const { ccclass, property } = _decorator

@ccclass('ContinueModal')
export class ContinueModal extends Component {
  //滑动区域的节点
  @property(Node)
  swipeNode: Node | null = null

  //提示1的节点
  @property(Node)
  tip1Node: Node | null = null
  //提示2的节点
  @property(Node)
  tip2Node: Node | null = null

  start() {
    //隐藏游戏结束界面
    this.node.active = false
    //设置弹窗的位置到屏幕中间
    this.node.setPosition(0, 0)
    //注册监听显示继续界面的事件
    EventDispatcher.getTarget().on(
      EventDispatcher.SHOW_CONTINUE_MODAL,
      this.showModal,
      this
    )
    //监听滑动开始事件
    this.swipeNode?.on(Node.EventType.TOUCH_START, this.onSwipeStart, this)
    //设置小恐龙的颜色
    this.setDinoColor()
  }

  //显示暂停界面
  showModal(params: any = {}) {
    //播放音效
    if (!params?.noPlayAudio) {
      AudioEffect.playClickAudio()
    }
    //游戏暂停
    GlobalData.gameState = GameState.PAUSE
    //显示弹窗
    this.node.active = true
    //执行提示的动画
    if (GlobalData.lifeNumPerRound > 0) {
      this.playTipAnimation(this.tip1Node)
    } else {
      this.playTipAnimation(this.tip2Node)
    }
  }

  //关闭暂停界面
  closeModal() {
    this.node.active = false
  }

  //暂停游戏
  pauseGame() {
    //暂停游戏
    AudioEffect.playClickAudio()
    //发送显示暂停界面的事件
    EventDispatcher.getTarget().emit(EventDispatcher.SHOW_PAUSE_MODAL)
  }

  //滑动开始
  onSwipeStart(event: EventTouch) {
    //关闭当前的弹窗
    this.closeModal()
    //发送开启小恐龙滑动事件(可以绕过游戏暂停状态)
    EventDispatcher.getTarget().emit(EventDispatcher.ENABLE_MOVE_DINO)
    //隔2秒之后再恢复
    this.scheduleOnce(() => {
      //然后设置当前游戏为进行中
      GlobalData.gameState = GameState.PLAYING
      //发送继续游戏的事件
      EventDispatcher.getTarget().emit(EventDispatcher.GAME_RESUME)
    }, 2)
  }

  //执行提示的动画
  playTipAnimation(tipNode: Node) {
    //打开提示
    tipNode.active = true
    //获取提示的位置
    const oriPos = tipNode.getPosition().clone()
    //获得提示的宽度
    const tipWidth = tipNode.getComponent(UITransform).width + 5
    //向左移动半屏的距离，然后停留0.2秒之后再回到原来的位置
    tween(tipNode)
      .to(0.3, {
        position: new Vec3(oriPos.x - tipWidth, oriPos.y, 0)
      })
      .delay(0.8)
      .to(0.2, {
        position: oriPos
      })
      .call(() => {
        //隐藏提示
        tipNode.active = false
        //重置提示的位置
        tipNode.setPosition(oriPos)
      })
      .start()
  }

  //设置小恐龙的颜色
  setDinoColor() {
    //获取小恐龙的颜色
    const dinoColor = new Color(GlobalData.currentDinoInfo?.dinoColor)
    //设置两个提示信息携带的小恐龙颜色
    this.tip1Node.getChildByName('dino')!.getComponent(Sprite).color = dinoColor
    this.tip2Node.getChildByName('dino')!.getComponent(Sprite).color = dinoColor
  }

  update(deltaTime: number) {}
}
