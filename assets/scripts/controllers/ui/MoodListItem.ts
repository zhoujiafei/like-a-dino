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
  UIOpacity,
  Vec3
} from 'cc'
import { EventDispatcher } from '../../libs/EventDispatcher'
import GlobalData from '../../config/GlobalData'
import AudioEffect from '../../libs/AudioEffect'
import Common from '../../libs/Common'
const { ccclass, property } = _decorator

@ccclass('MoodListItem')
export class MoodListItem extends Component {
  //保存当前列表项数据对象
  private itemObj: any = null

  //开始生命周期
  start() {
    //监听点击事件
    this.node.on(Node.EventType.TOUCH_END, this.onClick, this)
    //监听选中某一个音乐列表项事件
    EventDispatcher.getTarget().on(
      EventDispatcher.SELECT_MOOD_ITEM,
      this.onSelectMoodItem,
      this
    )
    //监听解锁事件
    EventDispatcher.getTarget().on(
      EventDispatcher.UNLOCK_MOOD_ITEM,
      this.onUnlockMoodItem,
      this
    )
    //设置小恐龙的颜色
    this.setDinoColor()
  }
  //初始化
  init(item: any) {
    //保存当前列表项数据对象
    this.itemObj = item
    //设置标题
    this.node.getChildByName('music_title')!.getComponent(Label).string =
      item.title
    //根据有无锁定状态显示
    this.setLockState(item)
    //如果当前列表项是默认选中的项，则设置为选中状态
    if (item.id === GlobalData.selectedMusicID) {
      this.setSelected()
    }
  }

  //设置小恐龙的颜色
  setDinoColor() {
    //获取当前sprite组件的颜色属性
    let sprite = this.node.getChildByName('dino')!.getComponent(Sprite)
    //设置颜色
    sprite.color = new Color(GlobalData.currentDinoInfo?.dinoColor)
  }

  //点击事件
  onClick() {
    //播放点击音效
    AudioEffect.playClickAudio()
    //选中当前列表项
    this.setSelected()
    //设置动画(先缩小0.9，再放大到1)
    tween(this.node)
      .to(0.1, { scale: new Vec3(0.95, 0.95, 1) })
      .to(0.1, { scale: new Vec3(1, 1, 1) })
      .start()
  }

  //设置为选中状态
  setSelected() {
    //获取透明度组件
    const opacityComp = this.node
      .getChildByName('list_item_bg')!
      .getComponent(UIOpacity)
    //获取选中图标节点
    const selectedNode = this.node.getChildByName('dino')
    opacityComp.opacity = 200
    selectedNode.active = true
    //派发选中某一个音乐列表项事件
    EventDispatcher.getTarget().emit(
      EventDispatcher.SELECT_MOOD_ITEM,
      this.itemObj?.id
    )
  }

  //设置为未选中状态
  setUnSelected() {
    //获取透明度组件
    const opacityComp = this.node
      .getChildByName('list_item_bg')!
      .getComponent(UIOpacity)
    //获取选中图标节点
    const selectedNode = this.node.getChildByName('dino')
    opacityComp.opacity = 255
    selectedNode.active = false
  }

  //选中某一个音乐列表项事件
  onSelectMoodItem(musicID: number) {
    //如果当前点击的列表项是已选中的项，则不处理
    if (musicID === this.itemObj?.id) {
      return
    }
    //否则，将当前列表项设置为未选中状态
    this.setUnSelected()
  }

  //设置锁的状态
  setLockState(item: any) {
    if (item.isLocked) {
      this.node.getChildByName('locked')!.active = true
      this.node.getChildByName('best_score')!.active = false
    } else {
      this.node.getChildByName('locked')!.active = false
      this.node.getChildByName('best_score')!.active = true
      //设置最好成绩
      this.node
        .getChildByName('best_score')!
        .getChildByName('score_num')!
        .getComponent(Label).string = item.bestScore + ''
    }
  }

  //解锁当前列表项
  onUnlockMoodItem(musicID: number) {
    //如果当前点击的列表项不是当前项，则不处理
    if (musicID !== this.itemObj?.id) {
      return
    }
    //设置为已解锁状态
    this.itemObj.isLocked = 0
    //设置锁的状态
    this.setLockState(this.itemObj)
    //设置选中状态
    this.setSelected()
    //存储解锁状态
    Common.unlockMusic(musicID)
  }

  update(deltaTime: number) {}
}
