/** 
 * 游戏开发者：程序员加菲猫 
 * 游戏名称：Like A Dino! 
 */

import {
  _decorator,
  Component,
  director,
  Label,
  PageView,
  Node,
  Color,
  Prefab,
  instantiate,
  Vec3
} from 'cc'
import AudioEffect from '../../libs/AudioEffect'
import GlobalData from '../../config/GlobalData'
import { EventDispatcher } from '../../libs/EventDispatcher'
import Common from '../../libs/Common'
import { BombEffectControl } from '../effects/BombEffectControl'
const { ccclass, property } = _decorator

@ccclass('LoveStorySceneControl')
export class LoveStorySceneControl extends Component {
  //总金币数标签
  @property(Label)
  totalScoreLabel: Label = null!

  //故事简介标签
  @property(Label)
  storyDescLabel: Label = null!

  //pageView组件
  @property(PageView)
  pageViewComp: PageView = null!

  //按钮组节点
  @property(Node)
  buttonGroupNode: Node = null!

  //爆炸特效预制体
  @property(Prefab)
  boomPrefab: Prefab = null!

  //保存当前用户临时选择的小恐龙索引
  private selectedDinoID: number = 0

  //是否点击了购买按钮
  private isClickedBtn: boolean = false

  //恐龙列表
  dinoList: any[] = [
    {
      id: 1,
      name: '小恐龙1',
      desc: 'Dino:Will you marry me?',
      isLocked: 0,
      unlockGold: 0,
      dinoColor: '#ffffff',
      bgColor: '#cce5cd'
    },
    {
      id: 2,
      name: '小恐龙2',
      desc: 'Dina:Yes!',
      isLocked: 1,
      unlockGold: 1000,
      dinoColor: '#FFE064',
      bgColor: '#f3ffc8'
    },
    {
      id: 3,
      name: '小恐龙3',
      desc: 'Dino:I,Dino,Take you,my love,forever!',
      isLocked: 1,
      unlockGold: 2000,
      dinoColor: '#FD6445',
      bgColor: '#ffaf6d'
    },
    {
      id: 4,
      name: '小恐龙4',
      desc: 'Dino:I Love You!',
      isLocked: 1,
      unlockGold: 3000,
      dinoColor: '#9164FF',
      bgColor: '#a4a2ff'
    },
    {
      id: 5,
      name: '小恐龙5',
      desc: 'Dino:Yes,my love! ha,ha,ha!',
      isLocked: 1,
      unlockGold: 4000,
      dinoColor: '#FD64F2',
      bgColor: '#f19dff'
    }
  ]

  protected onLoad(): void {
    //设置页面背景色
    this.setBackgroundColor()
    //初始化小恐龙列表解锁状态
    this.initDinoListLockStates()
  }

  start() {
    //设置总金币数标签
    this.setTotalScoreLabel()
    //初始化pageView组件
    this.initPageView()
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

  //初始化小恐龙列表解锁状态
  initDinoListLockStates() {
    //默认解锁ID是1的小恐龙
    Common.unlockDino(1)
    //遍历小恐龙列表
    this.dinoList.forEach((item) => {
      //如果当前小恐龙已解锁
      item.isLocked = Common.isDinoUnlocked(item.id) ? 0 : 1
    })
  }

  //设置总金币数标签
  setTotalScoreLabel() {
    //设置总金币数标签的文本
    this.totalScoreLabel.string = GlobalData.totalScore.toString()
  }

  //初始化pageView组件
  initPageView() {
    //设置默认显示第几个索引的小恐龙(根据当前选择的小恐龙ID查找到对应的索引)
    let index = this.dinoList.findIndex(
      (item) => item.id === GlobalData.selectedDinoID
    )
    //如果查找到索引
    if (index !== -1) {
      //设置默认显示第几个索引的小恐龙
      this.pageViewComp.setCurrentPageIndex(index)
      //设置故事简介标签的文本
      this.storyDescLabel.string =
        this.dinoList[index].desc || 'Dino:Will you marry me?'
      //刷新按钮显示
      this.refreshButtonDisplay(index)
    }
  }

  //回到首页
  backToHome() {
    //播放返回音效
    AudioEffect.playClickAudio()
    //返回首页场景
    director.loadScene('home')
  }

  //确认选择某一个小恐龙
  confirmSelectDino() {
    //播放点击音效
    AudioEffect.playClickAudio()
    //设置当前用户选择的小恐龙ID
    if (this.selectedDinoID > 0) {
      GlobalData.selectedDinoID = this.selectedDinoID
      //设置当前选择的小恐龙的信息
      GlobalData.currentDinoInfo = this.dinoList[this.selectedDinoID - 1]
    }
    //播放按钮爆炸效果
    this.playBombEffect()
    //跳转到首页
    this.scheduleOnce(() => {
      director.loadScene('home')
    }, 0.4)
  }

  //购买小恐龙
  buyDino() {
    //如果点击了购买按钮(防抖处理)
    if (this.isClickedBtn) {
      return
    }
    //设置点击了购买按钮
    this.isClickedBtn = true
    //1s之后再允许点击
    setTimeout(() => {
      this.isClickedBtn = false
    }, 1000)
    //播放点击音效
    AudioEffect.playClickAudio()
    //获取当前选中的小恐龙
    let selectedDino = this.dinoList.find(
      (item) => item.id === this.selectedDinoID
    )
    //如果当前选中的小恐龙不存在
    if (!selectedDino) {
      return
    }
    //如果当前金币数大于等于购买金额
    if (GlobalData.totalScore >= selectedDino.unlockGold) {
      //从总金币数中减去购买金额
      GlobalData.totalScore -= selectedDino.unlockGold
      //设置总金币数标签
      this.setTotalScoreLabel()
      //解锁当前的这个小恐龙
      Common.unlockDino(this.selectedDinoID)
      //获取当前选中的小恐龙的索引
      let dinoIndex = this.selectedDinoID - 1
      //设置当前选中的小恐龙为已解锁状态
      this.dinoList[dinoIndex]!.isLocked = 0
      //刷新按钮显示
      this.refreshButtonDisplay(dinoIndex)
      //播放爆炸特效
      this.playBombEffect()
    } else {
      //提示用户金币不足
      EventDispatcher.getTarget().emit(
        EventDispatcher.TIPS_MSG,
        'Not Enough Coins!'
      )
    }
  }

  //刷新按钮显示
  refreshButtonDisplay(dinoIndex: number) {
    //保存临时选择的小恐龙ID
    this.selectedDinoID = this.dinoList[dinoIndex]?.id || 1
    //寻找到当前选中的小恐龙
    let selectedDino = this.dinoList[dinoIndex]
    //如果当前选中的小恐龙是已解锁状态
    if (selectedDino?.isLocked) {
      //购买按钮显示
      this.buttonGroupNode.getChildByName('button_buy')!.active = true
      //取消按钮显示
      this.buttonGroupNode.getChildByName('button_cancel')!.active = true
      //ok按钮隐藏
      this.buttonGroupNode.getChildByName('button_ok')!.active = false
      //设置购买的金额
      this.buttonGroupNode
        .getChildByName('button_buy')!
        .getChildByName('gold_num')!
        .getComponent(Label).string =
        selectedDino?.unlockGold?.toString() || '0'
    } else {
      //购买按钮隐藏
      this.buttonGroupNode.getChildByName('button_buy')!.active = false
      //取消按钮隐藏
      this.buttonGroupNode.getChildByName('button_cancel')!.active = false
      //ok按钮显示
      this.buttonGroupNode.getChildByName('button_ok')!.active = true
    }
  }

  //轮播滑动事件
  onPageEvent(event: any) {
    //获取当前的索引
    const currentIndex = parseInt(event?.curPageIdx)
    //更新当前选择的小恐龙的索引
    this.selectedDinoID = this.dinoList[currentIndex]?.id || 1
    //设置故事简介标签的文本
    this.storyDescLabel.string =
      this.dinoList[currentIndex]?.desc || 'Dino:Will you marry me?'
    //刷新按钮显示
    this.refreshButtonDisplay(currentIndex)
    //设置页面背景色
    Common.setPageBackgroundColor(
      this.node.getChildByName('bg'),
      new Color(this.dinoList[currentIndex]?.bgColor || '#cce5cd')
    )
  }

  //播放爆炸特效
  playBombEffect() {
    //创建爆照特效节点
    let bombEffectNode = instantiate(this.boomPrefab)
    //设置爆照特效节点的位置
    let bombPos = new Vec3(0, 0, 0)
    //设置位置
    bombEffectNode.setPosition(bombPos)
    //设置父亲节点
    bombEffectNode.setParent(this.buttonGroupNode.getChildByName('button_ok'))
    //播放爆炸特效
    bombEffectNode.getComponent(BombEffectControl).playBombEffect()
  }

  update(deltaTime: number) {}
}
