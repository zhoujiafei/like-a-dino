/** 
 * 游戏开发者：程序员加菲猫 
 * 游戏名称：Like A Dino! 
 */

import { _decorator, Component, Label, Node, tween, Vec3 } from 'cc'
import { EventDispatcher } from '../../libs/EventDispatcher'
const { ccclass, property } = _decorator

@ccclass('TipControl')
export class TipControl extends Component {
  //提示标签
  @property(Label)
  tipLabel: Label | null = null
  start() {
    //默认位置,屏幕外
    this.node.setPosition(0, -1000)
    //监听tips msg事件
    EventDispatcher.getTarget().on(
      EventDispatcher.TIPS_MSG,
      this.showTips,
      this
    )
  }

  //显示提示
  showTips(msg: string) {
    this.tipLabel.string = msg
    tween(this.node)
      .to(0.2, { position: new Vec3(0, 0, 0) })
      .delay(1)
      .to(0.2, { position: new Vec3(0, 1000, 0) })
      .call(() => {
        this.node.setPosition(0, -1000)
      })
      .start()
  }

  update(deltaTime: number) {}
}
