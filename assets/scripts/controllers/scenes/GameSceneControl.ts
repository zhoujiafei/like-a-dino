/**
 * 游戏开发者：程序员加菲猫
 * 游戏名称：Like A Dino!
 */

import {
  _decorator,
  Color,
  Component,
  Label,
  Node,
  Sprite,
  tween,
  UITransform,
  Vec3
} from 'cc'
import GlobalData from '../../config/GlobalData'
import AudioEffect from '../../libs/AudioEffect'
import Common from '../../libs/Common'
import { EventDispatcher } from '../../libs/EventDispatcher'
import { GameState } from '../../config/Config'
import { MusicManager } from '../managers/MusicManager'
const { ccclass, property } = _decorator

@ccclass('GameSceneControl')
export class GameSceneControl extends Component {
  //总分的label
  @property(Label)
  totalScoreLabel: Label = null!

  //生命值的label
  @property(Label)
  lifeLabel: Label = null!

  //开始游戏提示节点
  @property(Node)
  startGameTipNode: Node = null!

  //速度提升提示节点
  @property(Node)
  speedUpTipNode: Node = null!

  //UI节点(包含分数标签,按钮等等)
  @property(Node)
  uiNode: Node = null!

  //音乐管理器
  musicManager: MusicManager = null!

  //屏幕的宽度
  screenWidth: number = 0

  onLoad(): void {
    //获取屏幕的宽度
    this.screenWidth = this.node.getComponent(UITransform).width
    //加载音乐管理器
    this.musicManager = this.node.getComponent(MusicManager)
    //监听小恐龙吃到音符的事件
    EventDispatcher.getTarget().on(
      EventDispatcher.DINO_EAT_NOTE,
      this.updateTotalScore,
      this
    )
    //监听更新剩余生命值的事件
    EventDispatcher.getTarget().on(
      EventDispatcher.UPDATE_LIFE,
      this.updateLife,
      this
    )
    //监听游戏结束的事件
    EventDispatcher.getTarget().on(
      EventDispatcher.GAME_OVER,
      this.handleGameOver,
      this
    )
    //监听闯关成功的事件
    EventDispatcher.getTarget().on(
      EventDispatcher.PASS_LEVEL,
      this.replayGame,
      this
    )
  }

  //开始
  start() {
    //设置当前页面的背景颜色
    this.setBackgroundColor()
    //设置小恐龙的颜色
    this.setDinoColor()
    //重置游戏数据
    GlobalData.resetGameData()
    //开始游戏
    this.startGame()
  }

  //再来一轮
  replayGame() {
    //预留2秒之后再开始游戏
    this.scheduleOnce(() => {
      //速度的倍率增加0.2
      GlobalData.speedRate += GlobalData.speedRateAdd
      //开始游戏
      this.startGame()
    }, 2)
  }

  //开始游戏
  startGame() {
    //显示UI节点
    this.uiNode.active = true
    //更新UI显示(分数以及生命值)
    this.updateUI()
    //设置状态为游戏进行中
    GlobalData.gameState = GameState.PLAYING
    //开始游戏提示动画
    this.showStartGameTip()
    //预留1秒之后再开始游戏
    this.scheduleOnce(async () => {
      //开始播放音乐
      await this.playMusic()
      //发送开始游戏的事件
      EventDispatcher.getTarget().emit(EventDispatcher.GAME_START)
    }, 1)
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

  //设置小恐龙的颜色
  setDinoColor() {
    //获得当前的小恐龙信息
    const dinoColor = new Color(GlobalData.currentDinoInfo?.dinoColor)
    //设置小恐龙的颜色
    this.uiNode
      .getChildByName('life')!
      .getChildByName('dino_head')!
      .getComponent(Sprite).color = dinoColor
  }

  //播放音乐
  async playMusic() {
    //播放用户选择的音乐(默认第一个音乐)
    await this.musicManager.play()
  }

  //暂停游戏
  pauseGame() {
    //暂停游戏
    AudioEffect.playClickAudio()
    //发送显示暂停界面的事件
    EventDispatcher.getTarget().emit(EventDispatcher.SHOW_PAUSE_MODAL)
  }

  //显示开始游戏前的提示
  showStartGameTip() {
    //根据当前的速度倍率来显示不同的提示
    if (GlobalData.speedRate > 1) {
      //速度提升提示动画
      this.speedUpTipAnim()
    } else {
      //第一次游戏开始提示动画
      this.firstGameTipAnim()
    }
  }

  //第一次游戏开始提示动画
  firstGameTipAnim() {
    //显示开始游戏提示
    this.startGameTipNode.active = true
    //获取回来的位置
    const oriPos = this.startGameTipNode.getPosition().clone()
    //向右移动半屏的距离，然后停留0.5秒之后消失
    tween(this.startGameTipNode)
      .to(0.3, {
        position: new Vec3(oriPos.x + this.screenWidth / 2 + 150, oriPos.y)
      })
      .delay(0.5)
      .to(0.2, {
        position: new Vec3(oriPos.x + this.screenWidth + 200, oriPos.y)
      })
      .call(() => {
        //隐藏开始游戏提示
        this.startGameTipNode.active = false
        //重置开始游戏提示的位置
        this.startGameTipNode.setPosition(oriPos)
      })
      .start()
  }

  //速度提升提示动画
  speedUpTipAnim() {
    //设置速度提升提示的文字
    this.speedUpTipNode.getComponent(Label).string =
      `Speed Up! (x${GlobalData.speedRate})`
    //显示开始游戏提示
    this.speedUpTipNode.active = true
    //获取回来的位置
    const oriPos = this.speedUpTipNode.getPosition().clone()
    //向右移动半屏的距离，然后停留0.5秒之后消失
    tween(this.speedUpTipNode)
      .to(0.3, {
        position: new Vec3(oriPos.x + this.screenWidth / 2 + 200, oriPos.y)
      })
      .delay(0.5)
      .to(0.2, {
        position: new Vec3(oriPos.x + this.screenWidth + 200, oriPos.y)
      })
      .call(() => {
        //隐藏开始游戏提示
        this.speedUpTipNode.active = false
        //重置开始游戏提示的位置
        this.speedUpTipNode.setPosition(oriPos)
      })
      .start()
  }

  //更新UI显示
  updateUI() {
    //更新总分数
    this.updateTotalScore()
    //更新剩余生命值
    this.updateLife()
    //更新当前速度的显示
    this.updateSpeed()
  }

  //更新总分数
  updateTotalScore() {
    this.totalScoreLabel.string = GlobalData.curRoundTotalScore + ''
  }

  //更新剩余生命值
  updateLife() {
    this.lifeLabel.string = 'x ' + GlobalData.lifeNumPerRound
  }

  //更新当前速度的显示
  updateSpeed() {
    //速度的Label标签
    this.uiNode
      .getChildByName('note_info')!
      .getChildByName('speed')!
      .getComponent(Label).string = 'Speed: x' + GlobalData.speedRate
  }

  //处理游戏结束事件
  handleGameOver() {
    //隐藏暂停按钮
    this.uiNode.active = false
  }

  update(deltaTime: number) {}
}
