/** 
 * 游戏开发者：程序员加菲猫 
 * 游戏名称：Like A Dino! 
 */

import { _decorator, Component } from 'cc'
import GlobalData from '../../config/GlobalData'
const { ccclass, property } = _decorator

@ccclass('RhythmNoteControl')
export class RhythmNoteControl extends Component {
  //定义向上移动的速度
  speed: number = GlobalData.noteSpeed

  start() {}

  update(deltaTime: number) {
    this.node.y += this.speed * deltaTime
    if (this.node.y > 1000) {
      this.node.destroy()
    }
  }
}
