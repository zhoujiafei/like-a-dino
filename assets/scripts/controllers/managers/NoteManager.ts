/**
 * 游戏开发者：程序员加菲猫
 * 游戏名称：Like A Dino!
 */

import {
  _decorator,
  AudioClip,
  Component,
  instantiate,
  Label,
  Node,
  Prefab,
  Vec3
} from 'cc'
import GlobalData from '../../config/GlobalData'
import { EventDispatcher } from '../../libs/EventDispatcher'
import Common from '../../libs/Common'
import { NoteControl } from '../components/NoteControl'

const { ccclass, property } = _decorator

@ccclass('NoteManager')
export class NoteManager extends Component {
  //音符节点的预制体
  @property(Prefab)
  notePrefab: Prefab = null

  //当前的音频剪辑
  @property(AudioClip)
  currentAudioClip: AudioClip = null

  //基准线的节点
  @property(Node)
  lineNode: Node = null

  //显示有多少个音符的label
  @property(Label)
  noteCountLabel: Label = null

  //基准线的坐标
  private linePosition: Vec3 = new Vec3(0, 0, 0)

  //音符数组(记录每个音符出现的时刻)
  private noteArray: any[] = []

  async onLoad() {
    //监听清空场景中的所有音符节点事件
    EventDispatcher.getTarget().on(
      EventDispatcher.CLEAR_ALL_NOTES,
      this.clearAllNotes,
      this
    )
    //监听闯关成功的事件
    EventDispatcher.getTarget().on(
      EventDispatcher.PASS_LEVEL,
      this.reGenerateNotes,
      this
    )
    //获取基准线的坐标
    this.linePosition = this.lineNode.getPosition()
  }

  async start() {
    //获取音符信息列表
    this.noteArray = await Common.loadMusicNoteData(GlobalData.selectedMusicID)
    //创建音符节点并添加到场景中
    this.createNotesToScene()
    //更新音符总数的显示
    this.updateNoteCount()
  }

  //重新生成音符
  async reGenerateNotes() {
    //清空场景中的所有音符节点
    this.clearAllNotes()
    //获取音符信息列表
    this.noteArray = await Common.loadMusicNoteData(GlobalData.selectedMusicID)
    //重新生成音符节点并添加到场景中
    this.createNotesToScene()
    //更新音符总数的显示
    this.updateNoteCount()
  }

  //生成一批音符节点并添加到场景中
  createNotesToScene() {
    //倒序遍历创建音符(考虑到层级的关系)
    for (let i = this.noteArray.length - 1; i >= 0; i--) {
      this.createNoteNode(this.noteArray[i])
    }
  }

  //生成单个音符节点
  createNoteNode(noteItem?: any) {
    //生成音符节点
    const noteNode: Node = instantiate(this.notePrefab)
    //计算出音符接口的x轴坐标
    let noteX = 0
    if (noteItem.trackType == 0) {
      noteX = this.linePosition.x - 180
    } else if (noteItem.trackType == 1) {
      noteX = this.linePosition.x
    } else if (noteItem.trackType == 2) {
      noteX = this.linePosition.x + 180
    }
    //计算出音符接口的y轴坐标
    let noteY = GlobalData.noteSpeed * noteItem.timePoint + this.linePosition.y
    //设置音符节点的坐标
    noteNode.setPosition(noteX, noteY, 0)
    //将音符节点添加到场景中
    this.node.addChild(noteNode)
    //初始化音符节点
    noteNode.getComponent(NoteControl).initNote()
  }

  //清除当前场景中的所有音符节点
  clearAllNotes() {
    this.node.removeAllChildren()
  }

  //更新音符总数的显示
  updateNoteCount() {
    this.noteCountLabel.string = 'Tempo: ' + this.noteArray.length
  }

  update(deltaTime: number) {}
}
