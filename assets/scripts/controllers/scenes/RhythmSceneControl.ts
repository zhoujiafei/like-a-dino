/**
 * 游戏开发者：程序员加菲猫
 * 游戏名称：Like A Dino!
 */

import {
  _decorator,
  AudioClip,
  AudioSource,
  Component,
  EditBox,
  EventTouch,
  Input,
  input,
  instantiate,
  KeyCode,
  Node,
  Prefab,
  ProgressBar,
  tween,
  UITransform,
  Vec3
} from 'cc'
import GlobalData from '../../config/GlobalData'
const { ccclass, property } = _decorator

@ccclass('RhythmSceneControl')
export class RhythmSceneControl extends Component {
  //点击区域
  @property(Node)
  clickArea: Node = null

  //音乐进度条节点
  @property(ProgressBar)
  progressBar: ProgressBar = null

  //节奏音符预制体
  @property(Prefab)
  rhythmNotePrefab: Prefab = null

  @property(Node)
  lineNode: Node = null

  //当前的音频剪辑
  @property(AudioClip)
  currentAudioClip: AudioClip = null

  //输出组件
  @property(EditBox)
  outputInputBox: EditBox = null

  //音频播放器
  audioSource: AudioSource = null

  //保存三个轨道的初始位置列表
  trackPositions: Vec3[] = []

  //节奏音符高度
  rhythmNoteHeight: number = 62

  //音乐总时长
  musicDuration: number = 0

  //当前点击的轨道按钮索引
  currentTrackIndex: number = -1

  //计算出连续产生音符的间隔时间
  rhythmNoteInterval: number = 0

  //已经进行的时间
  elapsedTime: number = 0

  //记录音符的信息列表
  noteInfoList: any[] = []

  //按键与轨道索引的映射关系
  private keyTrackMap: { [key: number]: number } = {
    [KeyCode.KEY_A]: 0, // A键对应轨道1
    [KeyCode.KEY_S]: 1, // S键对应轨道2
    [KeyCode.KEY_D]: 2 // D键对应轨道3
  }

  onLoad(): void {
    //计算出连续产生音符的间隔时间(行走的路程/移动的速度)
    this.rhythmNoteInterval =
      this.rhythmNoteHeight / GlobalData.noteSpeed - 0.02
    //获取音频播放器组件
    this.audioSource = this.node.getComponent(AudioSource)
    //监听按键按下事件
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this)
    //监听按键松开事件
    input.on(Input.EventType.KEY_UP, this.onKeyUp, this)
    //监听点击事件
    this.clickArea?.on(Node.EventType.TOUCH_START, this.touchStart, this)
    this.clickArea?.on(Node.EventType.TOUCH_END, this.touchEnd, this)
    this.clickArea?.on(Node.EventType.TOUCH_CANCEL, this.touchEnd, this)
  }

  start() {
    //获取基准线的位置
    let baseLinePosition = this.lineNode.getPosition()
    //获取三个轨道的初始位置
    this.trackPositions = [
      //第一个轨道的初始位置
      new Vec3(baseLinePosition.x - 180, baseLinePosition.y, 0),
      //第二个轨道的初始位置
      new Vec3(baseLinePosition.x, baseLinePosition.y, 0),
      //第三个轨道的初始位置
      new Vec3(baseLinePosition.x + 180, baseLinePosition.y, 0)
    ]
    //获取音乐的总时长
    this.musicDuration = this.getAudioDuration()
  }

  //获取音频时长
  getAudioDuration(): number {
    if (this.currentAudioClip) {
      return this.currentAudioClip.getDuration()
    }
    return 0
  }

  //点击开始事件
  touchStart(event: EventTouch) {
    //获取点击UI的位置
    let touchPosition = event.getUILocation()
    //遍历触摸区域的子节点
    for (let i = 0; i < this.clickArea.children.length; i++) {
      //判断点击位置是否在子节点内
      if (
        this.clickArea.children[i]
          .getComponent(UITransform)
          .getBoundingBoxToWorld()
          .contains(touchPosition)
      ) {
        this.currentTrackIndex = i
        break
      }
    }
    //如果轨道索引不为-1，说明点击的是一个轨道
    if (this.currentTrackIndex !== -1) {
      //获取点击的轨道按钮节点
      let buttonNode = this.clickArea.children[this.currentTrackIndex]
      //使用tween控制节点先缩小再还原原来的大小
      tween(buttonNode)
        .to(0.1, { scale: new Vec3(0.9, 0.9, 1) })
        .start()
      //创建一个节奏音符
      if (this.audioSource.playing) {
        this.elapsedTime = 0
        this.createRhythmNote(this.currentTrackIndex)
      }
    }
  }

  //点击结束事件
  touchEnd() {
    if (this.currentTrackIndex == -1) {
      return
    }
    //获取点击的轨道按钮节点
    let buttonNode = this.clickArea.children[this.currentTrackIndex]
    //使用tween控制节点先缩小再还原原来的大小
    tween(buttonNode)
      .to(0.1, { scale: new Vec3(1, 1, 1) })
      .start()
    //重置当前轨道索引
    this.currentTrackIndex = -1
    //重置已经进行的时间
    this.elapsedTime = 0
  }

  //创建一个节奏音符
  createRhythmNote(trackType: number) {
    //生成音符节点
    const rhythmNoteNode: Node = instantiate(this.rhythmNotePrefab)
    //设置音符节点的父节点为当前节点
    rhythmNoteNode.setParent(this.node)
    //设置位置
    rhythmNoteNode.setPosition(this.trackPositions[trackType])
    //构建音符的信息
    let noteInfo = {
      //轨道类型
      trackType: trackType,
      //音符出现的时间点(相对于整首曲子的时间点)
      timePoint: this.audioSource.currentTime
    }
    //将音符的信息添加到列表中
    this.noteInfoList.push(noteInfo)
  }

  //按下按键事件
  onKeyDown(event: any) {
    if (event.keyCode === KeyCode.SPACE) {
      // 切换音乐的播放
      this.switchMusic()
    } else if (this.keyTrackMap.hasOwnProperty(event.keyCode)) {
      // 检查音乐是否正在播放
      if (this.audioSource.playing) {
        const trackIndex = this.keyTrackMap[event.keyCode]
        this.currentTrackIndex = trackIndex
        this.elapsedTime = 0
        this.createRhythmNote(trackIndex)
      }
    }
  }

  //松开按键事件
  onKeyUp(event: any) {
    if (this.keyTrackMap.hasOwnProperty(event.keyCode)) {
      // 重置当前轨道索引
      this.touchEnd()
    }
  }

  //切换音乐的播放
  switchMusic() {
    //如果当前音乐正在播放，暂停音乐
    if (this.audioSource.playing) {
      this.pauseMusic()
    } else {
      //否则播放音乐
      this.playMusic()
    }
  }

  //播放音乐
  playMusic() {
    //获取当前选择的音频剪辑
    const audioClip = this.currentAudioClip
    if (!audioClip) {
      return
    }
    this.audioSource.clip = audioClip
    this.audioSource.play()
  }

  //暂停音乐
  pauseMusic() {
    this.audioSource.pause()
  }

  //停止音乐
  stopMusic() {
    this.audioSource.stop()
  }

  //将音符列表信息保存到本地
  saveNoteInfoList() {
    //输出到编辑框中
    this.outputInputBox.string = this.noteInfoList.length
      ? JSON.stringify(this.noteInfoList)
      : ''
  }

  update(deltaTime: number) {
    //获取当前音乐的播放进度
    if (this.musicDuration > 0 && this.audioSource.playing) {
      //当前音乐播放的
      let currentTime = this.audioSource.currentTime
      if (currentTime <= 0) {
        return
      }
      //计算当前音乐播放的进度
      let progress = currentTime / this.musicDuration
      //保留两位小数
      progress = Math.round(progress * 100) / 100
      //设置进度条的进度
      this.progressBar.progress = progress
      //控制创建节奏音符的逻辑
      if (this.currentTrackIndex !== -1) {
        //记录已经进行的时间
        this.elapsedTime += deltaTime
        //如果已经进行的时间大于或等于节奏的高度，重置已经进行的时间
        if (this.elapsedTime >= this.rhythmNoteInterval) {
          this.elapsedTime = 0
          this.createRhythmNote(this.currentTrackIndex)
        }
      }
    }
  }
}
