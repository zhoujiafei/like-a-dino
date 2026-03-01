/** 
 * 游戏开发者：程序员加菲猫 
 * 游戏名称：Like A Dino! 
 */

import { _decorator, Color, Component, director, Node } from 'cc'
import AudioEffect from '../../libs/AudioEffect'
import GlobalData from '../../config/GlobalData'
import Common from '../../libs/Common'
const { ccclass, property } = _decorator

@ccclass('AuthorSceneControl')
export class AuthorSceneControl extends Component {
  start() {
    //设置当前页面的背景颜色
    this.setBackgroundColor()
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

  //跳转到首页场景
  goToHomeScene() {
    //播放点击音效
    AudioEffect.playClickAudio()
    //跳转到首页场景
    director.preloadScene('home', () => {
      director.loadScene('home')
    })
  }
}
