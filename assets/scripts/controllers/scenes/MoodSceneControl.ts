/** 
 * 游戏开发者：程序员加菲猫 
 * 游戏名称：Like A Dino! 
 */

import {
  _decorator,
  AudioClip,
  AudioSource,
  Color,
  Component,
  director,
  instantiate,
  Label,
  Node,
  Prefab,
  resources,
  Vec3
} from 'cc'
import { MoodListItem } from '../ui/MoodListItem'
import { EventDispatcher } from '../../libs/EventDispatcher'
import AudioEffect from '../../libs/AudioEffect'
import GlobalData from '../../config/GlobalData'
import Common from '../../libs/Common'
import { GameStorageKeyConfig } from '../../config/Config'
import Utils from '../../libs/Utils'
import { BombEffectControl } from '../effects/BombEffectControl'
const { ccclass, property } = _decorator

@ccclass('MoodSceneControl')
export class MoodSceneControl extends Component {
  //列表项预制体
  @property(Prefab)
  moodItemPrefab: Prefab = null

  //内容的父节点
  @property(Node)
  contentNode: Node = null

  //按钮组节点
  @property(Node)
  buttonGroupNode: Node = null

  //总金币数标签
  @property(Label)
  totalScoreLabel: Label = null

  //爆炸特效预制体
  @property(Prefab)
  boomPrefab: Prefab = null!

  //保存当前用户临时选择的音乐ID
  private selectedMusicID: number = 0

  //音频播放器
  private audioSource: AudioSource = null!

  //是否点击了购买按钮
  private isClickedBtn: boolean = false

  //歌曲列表
  musicList: any[] = [
    {
      id: 1,
      title: 'Like A Dino!',
      bestScore: 0,
      isLocked: 0,
      unlockGold: 0
    },
    {
      id: 2,
      title: "It's Ok,Not To Be Ok!",
      bestScore: 0,
      isLocked: 1,
      unlockGold: 1000
    },
    {
      id: 3,
      title: 'Good Luck Today!',
      bestScore: 0,
      isLocked: 1,
      unlockGold: 2000
    },
    {
      id: 4,
      title: 'A Piece Of Cake!',
      bestScore: 0,
      isLocked: 1,
      unlockGold: 3000
    },
    {
      id: 5,
      title: 'Im So Excited!',
      bestScore: 0,
      isLocked: 1,
      unlockGold: 4000
    },
    {
      id: 6,
      title: 'It Is What It Is!',
      bestScore: 0,
      isLocked: 1,
      unlockGold: 5000
    },
    {
      id: 7,
      title: 'A Silver Lining!',
      bestScore: 0,
      isLocked: 1,
      unlockGold: 6000
    },
    {
      id: 8,
      title: 'So Suβ!',
      bestScore: 0,
      isLocked: 1,
      unlockGold: 7000
    },
    {
      id: 9,
      title: 'You Made My Day!',
      bestScore: 0,
      isLocked: 1,
      unlockGold: 8000
    }
  ]

  onLoad() {
    //获取音频播放器
    this.audioSource = this.node.getComponent(AudioSource)
    //初始化音乐列表解锁状态
    this.initMusicListLockStates()
  }

  start() {
    //监听选中某一个音乐列表项事件
    EventDispatcher.getTarget().on(
      EventDispatcher.SELECT_MOOD_ITEM,
      this.refreshButtonDisplay,
      this
    )
    //设置总金币数标签
    this.setTotalScoreLabel()
    //设置当前页面的背景颜色
    this.setBackgroundColor()
    //添加列表项
    this.addMoodListItems()
  }

  //初始化音乐列表解锁状态
  initMusicListLockStates() {
    //获取每个歌曲的最好成绩的映射
    let bestScoreMap: any = Utils.getCache(GameStorageKeyConfig.BestScore) || {}
    //默认解锁ID是1的音乐
    Common.unlockMusic(1)
    //遍历歌曲列表
    this.musicList.forEach((item) => {
      //如果当前歌曲已解锁
      item.isLocked = Common.isMusicUnlocked(item.id) ? 0 : 1
      //设置当前歌曲的最好成绩
      item.bestScore = bestScoreMap[item.id] || 0
    })
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

  //添加歌曲列表项
  addMoodListItems() {
    //遍历歌曲列表
    this.musicList.forEach((item) => {
      //实例化
      let moodItem = instantiate(this.moodItemPrefab)
      //初始化
      moodItem.getComponent(MoodListItem).init(item)
      //添加到内容节点
      this.contentNode.addChild(moodItem)
    })
  }

  //设置总金币数标签
  setTotalScoreLabel() {
    //设置总金币数标签的文本
    this.totalScoreLabel.string = GlobalData.totalScore.toString()
  }

  //回到首页
  backToHome() {
    //播放返回音效
    AudioEffect.playClickAudio()
    //返回首页场景
    director.loadScene('home')
  }

  //确认选择某一首歌曲
  confirmSelectMusic() {
    //播放点击音效
    AudioEffect.playClickAudio()
    //设置当前用户选择的音乐ID
    if (this.selectedMusicID > 0) {
      GlobalData.selectedMusicID = this.selectedMusicID
      //设置当前选择的音乐的信息
      GlobalData.currentMusicInfo = this.musicList[this.selectedMusicID - 1]
    }
    //播放按钮爆炸效果
    this.playBombEffect()
    //跳转到首页
    this.scheduleOnce(() => {
      director.loadScene('home')
    }, 0.4)
  }

  //购买歌曲
  buyMusic() {
    //如果点击了购买按钮
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
    //获取当前选中的音乐
    let selectedMusic = this.musicList.find(
      (item) => item.id === this.selectedMusicID
    )
    //如果当前选中的音乐不存在
    if (!selectedMusic) {
      return
    }
    //如果当前金币数大于等于购买金额
    if (GlobalData.totalScore >= selectedMusic.unlockGold) {
      //从总金币数中减去购买金额
      GlobalData.totalScore -= selectedMusic.unlockGold
      //设置总金币数标签
      this.setTotalScoreLabel()
      //解锁当前的这首歌曲
      EventDispatcher.getTarget().emit(
        EventDispatcher.UNLOCK_MOOD_ITEM,
        this.selectedMusicID
      )
      //播放按钮爆炸特效
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
  refreshButtonDisplay(musicID: number) {
    //保存临时选择的音乐ID
    this.selectedMusicID = musicID
    //寻找到当前选中的音乐
    let selectedMusic = this.musicList.find((item) => item.id === musicID)
    //如果当前选中的音乐是已解锁状态
    if (selectedMusic.isLocked) {
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
        selectedMusic?.unlockGold?.toString() || '0'
    } else {
      //购买按钮隐藏
      this.buttonGroupNode.getChildByName('button_buy')!.active = false
      //取消按钮隐藏
      this.buttonGroupNode.getChildByName('button_cancel')!.active = false
      //ok按钮显示
      this.buttonGroupNode.getChildByName('button_ok')!.active = true
    }
    //播放音乐
    this.playMusic()
  }

  //播放音乐
  private playMusic() {
    if (!this.selectedMusicID) {
      return
    }
    //构建音乐文件名称
    let musicPath = 'audios/music/music_' + this.selectedMusicID
    //播放音乐
    if (this.audioSource) {
      resources.load(musicPath, (err, clip: AudioClip) => {
        if (err) {
          console.log(err)
        } else {
          this.audioSource.stop()
          this.audioSource.clip = clip
          this.audioSource.play()
          this.audioSource.volume = 1
        }
      })
    }
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

  protected onDestroy(): void {
    //停止音乐播放
    if (this.audioSource) {
      this.audioSource.stop()
    }
  }
}
