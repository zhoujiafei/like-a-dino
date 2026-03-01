/** 
 * 游戏开发者：程序员加菲猫 
 * 游戏名称：Like A Dino! 
 */

import { _decorator, Animation, Component, Label, Node, tween, Vec3 } from 'cc'
import { EventDispatcher } from '../../libs/EventDispatcher'
const { ccclass, property } = _decorator

@ccclass('BombEffectControl')
export class BombEffectControl extends Component {
  //定义提示语的数组
  private bombTips: string[] = [
    'Perfect!',
    'Fantastic!',
    'Marvelous!',
    'Super-Duper!',
    'Splerdid!',
    'Excellent!',
    'Wonderful!',
    'Brilliant!',
    'Incredible!',
    'Phenomenal!',
    'Awesome!'
  ]

  //爆炸标题Label
  @property(Label)
  bombLabel: Label = null

  //爆炸图片节点
  @property(Node)
  bombImageNode: Node = null

  //动画组件
  private animation: Animation = null

  onLoad() {
    //获取动画组件
    this.animation = this.bombImageNode?.getComponent(Animation)
    //监听动画播放完成事件
    this.animation?.on(
      Animation.EventType.FINISHED,
      this.onAnimationFinished,
      this
    )
    //设置提示语
    this.setBombTip()
    //监听吃到音符事件
    EventDispatcher.getTarget().on(
      EventDispatcher.DINO_EAT_NOTE,
      this.hideBombTip,
      this
    )
  }

  //设置提示语
  setBombTip() {
    //随机获取一个提示语
    let tips = this.bombTips[Math.floor(Math.random() * this.bombTips.length)]
    //设置提示语
    this.bombLabel.string = tips
  }

  //隐藏提示语
  hideBombTip() {
    //隐藏标题文字
    this.bombLabel.node.active = false
  }

  //播放爆炸效果
  playBombEffect() {
    //播放动画
    this.animation?.play('bomb')
    //开启标题文字
    this.bombLabel.node.active = true
    //同时将标题文字也放大一下
    tween(this.bombLabel.node)
      .to(0.1, { scale: new Vec3(1.1, 1.1, 1) })
      .start()
  }

  //动画播放完成事件
  onAnimationFinished() {
    //隐藏图片节点
    this.bombImageNode.active = false
    //整体缩小到0
    tween(this.bombLabel.node)
      .to(0.2, { scale: new Vec3(0.1, 0.1) })
      .call(() => {
        this.node?.destroy() //销毁节点
      })
      .start()
  }

  update(deltaTime: number) {}
}
