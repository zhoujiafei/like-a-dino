/** 
 * 游戏开发者：程序员加菲猫 
 * 游戏名称：Like A Dino! 
 */

import {
  _decorator,
  Color,
  Component,
  director,
  Label,
  Node,
  Sprite,
  tween,
  UITransform,
  Vec3
} from 'cc'
import { EventDispatcher } from '../../libs/EventDispatcher'
import AudioEffect from '../../libs/AudioEffect'
import GlobalData from '../../config/GlobalData'
const { ccclass, property } = _decorator

@ccclass('ResultModal')
export class ResultModal extends Component {
  //本局得分的Label
  @property(Label)
  scoreLabel: Label = null!

  //最好得分的Label
  @property(Label)
  bestScoreLabel: Label = null!

  //总金币数标签
  @property(Label)
  totalScoreLabel: Label = null!

  //提示节点
  @property(Node)
  tipNode: Node = null!

  //回到首页的按钮节点
  @property(Node)
  backHomeBtn: Node = null!

  start() {
    //隐藏游戏结束界面
    this.node.active = false
    //设置弹窗的位置到屏幕中间
    this.node.setPosition(0, 0)
    //注册监听打开游戏结束界面
    EventDispatcher.getTarget().on(
      EventDispatcher.SHOW_RESULT_MODAL,
      this.showModal,
      this
    )
  }

  //显示游戏结束界面
  showModal() {
    //播放音效
    AudioEffect.playClickAudio()
    //设置小恐龙的颜色
    this.setDinoColor()
    //显示弹窗
    this.node.active = true
    //设置当前的得分
    this.scoreLabel.string = GlobalData.curRoundTotalScore.toString()
    //累计总金币数
    GlobalData.totalScore += GlobalData.curRoundTotalScore
    //设置总金币数标签
    this.setTotalScoreLabel()
    //设置当前用户最好的得分成绩
    this.setCurUserBestScore()
    //过1秒后执行金币的特效
    this.scheduleOnce(async () => {
      //执行金币的特效
      await this.playGoldEffect()
      //执行提示的动画
      this.playTipAnimation()
      //显示回到首页按钮
      this.backHomeBtn.active = true
    }, 1)
  }

  //关闭游戏结束界面
  closeModal() {
    //隐藏弹窗
    this.node.active = false
    //隐藏回到首页按钮
    this.backHomeBtn.active = false
    //重置一下分数
    this.scoreLabel.string = '0'
  }

  //回到首页场景
  backToHome() {
    //播放点击音效
    AudioEffect.playClickAudio()
    //跳转到首页场景
    director.loadScene('home')
  }

  //设置当前用户最好的得分成绩
  setCurUserBestScore() {
    //首先获取当前用户最好的得分成绩
    let bestScore = GlobalData.bestScore
    //比对当前的得分
    if (GlobalData.curRoundTotalScore > bestScore) {
      //如果当前的得分大于最好的得分成绩，那么就更新最好的得分成绩
      GlobalData.bestScore = GlobalData.curRoundTotalScore
    }
    //设置当前用户最好的得分成绩的标签
    this.bestScoreLabel.string = GlobalData.bestScore.toString()
  }

  //设置总金币数标签
  setTotalScoreLabel() {
    //设置总金币数标签的文本
    this.totalScoreLabel.string = GlobalData.totalScore.toString()
  }

  //执行金币的特效
  async playGoldEffect() {
    //获取gold_coins节点
    let goldCoinsNode = this.node
      .getChildByName('panel')
      .getChildByName('gold_coins')
    //先开启
    goldCoinsNode.active = true
    //播放撒金币的音效
    AudioEffect.playGoldAudio()
    //0.5秒后执行
    this.scheduleOnce(() => {
      //播放钱币入账的音效
      AudioEffect.playCoinsEntryAudio()
    }, 0.5)
    //获取到当前的所有金币节点列表
    let goldCoinsList = goldCoinsNode.children
    //获取显示金币数量的标签节点
    let goldCoinNumNode = this.node
      .getChildByName('gold_label')
      .getChildByName('gold_num')
    //获取目标位置(世界坐标)
    let targetPos = goldCoinNumNode.getWorldPosition()
    //遍历金币节点列表依次执行动画
    for (let i = 0; i < goldCoinsList.length; i++) {
      //克隆一个位置
      let targetPosClone = targetPos.clone()
      //执行单个金币的动画
      await this.playSingleGoldAni(goldCoinsList[i], targetPosClone)
    }
  }

  //执行单个金币的动画
  async playSingleGoldAni(goldCoin: Node, targetPos: Vec3) {
    return new Promise((resolve) => {
      //首先向下移动30像素再移动到金币数量标签的位置然后消失
      tween(goldCoin)
        .by(0.2, { position: new Vec3(0, -30, 0) })
        .call(() => {
          //可以执行下一个了
          resolve(true)
          //获取当前金币节点的世界坐标
          let goldWorldPos = goldCoin.getWorldPosition()
          //计算当前金币节点与目标位置的差值向量
          let dirDiff = targetPos.subtract(goldWorldPos)
          //使用tween缓动控制飞机移动到目标点
          tween(goldCoin)
            .by(0.5, { position: dirDiff })
            .call(() => {
              //金币消失
              goldCoin.active = false
            })
            .start()
        })
        .start()
    })
  }

  //执行提示的动画
  playTipAnimation() {
    //打开提示
    this.tipNode.active = true
    //获取提示的位置
    const oriPos = this.tipNode.getPosition().clone()
    //获得提示的宽度
    const tipWidth = this.tipNode.getComponent(UITransform).width + 5
    //向左移动半屏的距离，然后停留0.2秒之后再回到原来的位置
    tween(this.tipNode)
      .to(0.3, {
        position: new Vec3(oriPos.x - tipWidth, oriPos.y, 0)
      })
      .delay(0.8)
      .to(0.2, {
        position: oriPos
      })
      .call(() => {
        //隐藏提示
        this.tipNode.active = false
        //重置提示的位置
        this.tipNode.setPosition(oriPos)
      })
      .start()
  }

  //设置小恐龙的颜色
  setDinoColor() {
    //获取小恐龙的颜色
    const dinoColor = new Color(GlobalData.currentDinoInfo?.dinoColor)
    //设置两个提示信息携带的小恐龙颜色
    this.tipNode.getChildByName('dino')!.getComponent(Sprite).color = dinoColor
  }

  update(deltaTime: number) {}
}
