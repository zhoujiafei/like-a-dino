/** 
 * 游戏开发者：程序员加菲猫 
 * 游戏名称：Like A Dino! 
 */

import {
  _decorator,
  Color,
  Component,
  director,
  EventTouch,
  Label,
  Node
} from 'cc'
import AudioEffect from '../../libs/AudioEffect'
import GlobalData from '../../config/GlobalData'
import Common from '../../libs/Common'
const { ccclass, property } = _decorator

@ccclass('HomeSceneControl')
export class HomeSceneControl extends Component {
  //滑动区域的节点
  @property(Node)
  swipeNode: Node | null = null

  //最好的成绩标签
  @property(Label)
  bestScoreLabel: Label | null = null

  //当前音乐曲目标签
  @property(Label)
  currentMusicLabel: Label | null = null

  //是否已经滑动
  private isSwiped: boolean = false

  start() {
    //监听滑动事件
    this.swipeNode?.on(Node.EventType.TOUCH_START, this.onSwipeStart, this)
    //设置最好的成绩标签
    this.setBestScoreLabel()
    //设置当前音乐曲目标签
    this.setCurrentMusicLabel()
    //设置当前页面的背景颜色
    this.setBackgroundColor()
    //预加载游戏场景
    this.preloadGameScene()
  }

  //预加载游戏场景
  preloadGameScene() {
    director.preloadScene('game')
  }

  //滑动开始
  onSwipeStart(event: EventTouch) {
    //进入游戏场景
    this.startGame()
  }

  //开始游戏
  public startGame() {
    if (this.isSwiped) {
      return
    }
    this.isSwiped = true
    //1s之后释放
    setTimeout(() => {
      this.isSwiped = false
    }, 1000)
    //加载游戏场景
    director.preloadScene('game', () => {
      director.loadScene('game')
    })
  }

  //设置最好的成绩标签
  setBestScoreLabel() {
    if (this.bestScoreLabel) {
      this.bestScoreLabel.string = GlobalData.bestScore.toString()
    }
  }

  //设置当前音乐曲目标签
  setCurrentMusicLabel() {
    if (this.currentMusicLabel) {
      this.currentMusicLabel.string = GlobalData.currentMusicInfo?.title
    }
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

  //跳转到love-story场景
  goToLoveStoryScene() {
    //播放点击音效
    AudioEffect.playClickAudio()
    //跳转到love-story场景
    director.preloadScene('love_story', () => {
      director.loadScene('love_story')
    })
  }

  //跳转到mood场景
  goToMoodScene() {
    //播放点击音效
    AudioEffect.playClickAudio()
    //跳转到mood场景
    director.preloadScene('mood', () => {
      director.loadScene('mood')
    })
  }

  //跳转到作者简介场景
  goToAuthorScene() {
    //播放点击音效
    AudioEffect.playClickAudio()
    //跳转到作者简介场景
    director.preloadScene('author', () => {
      director.loadScene('author')
    })
  }
}
