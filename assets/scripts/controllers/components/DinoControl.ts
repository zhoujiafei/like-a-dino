/** 
 * 游戏开发者：程序员加菲猫 
 * 游戏名称：Like A Dino! 
 */

import {
  _decorator,
  Collider2D,
  Color,
  Component,
  Contact2DType,
  director,
  EventTouch,
  Input,
  input,
  instantiate,
  Node,
  Prefab,
  Sprite,
  SpriteFrame,
  tween,
  Vec3
} from 'cc'
import { NoteControl } from './NoteControl'
import { BombEffectControl } from '../effects/BombEffectControl'
import { EventDispatcher } from '../../libs/EventDispatcher'
import GlobalData from '../../config/GlobalData'
import { GameState } from '../../config/Config'
const { ccclass, property } = _decorator

@ccclass('DinoControl')
export class DinoControl extends Component {
  //小恐龙脖子的图片(音符的图片)
  @property(SpriteFrame)
  neckSpriteFrame: SpriteFrame = null!

  //基准线的节点
  @property(Node)
  lineNode: Node = null!

  //爆炸特效预制体
  @property(Prefab)
  boomPrefab: Prefab = null!

  //是否开启滑动
  @property
  isOpenMove: boolean = false

  //定义一节脖子的高度(就是一节音符的高度)
  neckHeight: number = 62

  //小恐龙X轴移动的最大距离
  maxMoveX: number = 180

  //定义可以滑动(不受游戏暂停状态的影响)
  isEnableMove: boolean = false

  onLoad() {
    //设置小恐龙的颜色
    this.setDinoColor()
    //监听移动小恐龙到线的位置
    EventDispatcher.getTarget().on(
      EventDispatcher.MOVE_DINO_TO_LINE,
      this.moveDinoToLine,
      this
    )
    //监听继续游戏
    EventDispatcher.getTarget().on(
      EventDispatcher.GAME_RESUME,
      this.resumeGame,
      this
    )
    //监听开启滑动事件
    EventDispatcher.getTarget().on(
      EventDispatcher.ENABLE_MOVE_DINO,
      this.enableMove,
      this
    )
  }

  start() {
    //监听手势滑动
    if (this.isOpenMove) {
      input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this)
    }
    //开启碰撞检测
    this.node
      .getComponent(Collider2D)
      .on(Contact2DType.BEGIN_CONTACT, this.onCollisionEnter, this)
  }

  //设置小恐龙的颜色
  setDinoColor() {
    //获得当前的小恐龙信息
    const dinoInfo = GlobalData.currentDinoInfo
    //小恐龙的颜色
    const dinoColor = new Color(dinoInfo?.dinoColor)
    //设置小恐龙头部的颜色
    this.node.getChildByName('dino_head').getComponent(Sprite).color = dinoColor
    //设置小恐龙身体的颜色
    this.node.getChildByName('dino_body').getComponent(Sprite).color = dinoColor
  }

  //设置开启滑动
  enableMove() {
    this.isEnableMove = true
    //3秒后关闭可以滑动(绕过游戏暂停状态)
    this.scheduleOnce(() => {
      this.isEnableMove = false
    }, 3)
  }

  //手势滑动
  onTouchMove(event: EventTouch) {
    //如果游戏结束或者暂停就不能滑动了
    if (
      [GameState.GAME_OVER, GameState.PAUSE].includes(GlobalData.gameState) &&
      !this.isEnableMove
    ) {
      return
    }
    // 1.获取当前小恐龙的位置
    let currentPos = this.node.position
    // 2.获取滑动的x轴距离
    let deltaX = event.getDelta().x
    //3.获取小恐龙的目标位置(当前位置 + 手指移动的距离)
    let targetPos = new Vec3(currentPos.x + deltaX, currentPos.y, 0)
    //限定范围
    if (targetPos.x > this.maxMoveX) {
      targetPos.x = this.maxMoveX
    }
    if (targetPos.x < -this.maxMoveX) {
      targetPos.x = -this.maxMoveX
    }
    //设置小恐龙的位置
    this.node.setPosition(targetPos)
    //调整小恐龙的方向
    if (deltaX > 0.5) {
      //说明向右滑动
      this.node.scale = new Vec3(-1, 1, 1)
    } else if (deltaX < -0.5) {
      //说明向左滑动
      this.node.scale = new Vec3(1, 1, 1)
    }
  }

  //碰撞检测事件
  onCollisionEnter(selfCollider: Collider2D, otherCollider: Collider2D) {
    //如果游戏状态不是游戏进行中,则不执行碰撞检测
    if (GlobalData.gameState != GameState.PLAYING) {
      return
    }
    //如果碰撞到了音符
    if (otherCollider.tag === 2) {
      //用户当前这一局的总分进行累加
      GlobalData.curRoundTotalScore += GlobalData.addScore
      //发送吃到音符的消息
      EventDispatcher.getTarget().emit(EventDispatcher.DINO_EAT_NOTE)
      //调用音符被吃掉的方法
      otherCollider.node.getComponent(NoteControl).noteBeEaten()
      //增加小恐龙的脖子长度
      this.addDinoNeckLength()
      //执行吃掉音符的动画
      this.playEatNoteAnimation()
      //播放爆炸特效
      this.playBombEffect()
      //判断是否成功闯关
      let isPassLevel = this.checkIsPassLevel()
      if (isPassLevel) {
        //发送成功闯关的消息
        EventDispatcher.getTarget().emit(EventDispatcher.PASS_LEVEL)
      }
    }
  }

  //增加脖子长度
  addDinoNeckLength() {
    //生成一个节点
    let neckNode = new Node()
    //给这个节点添加一个精灵组件
    let sprite = neckNode.addComponent(Sprite)
    //设置颜色
    sprite.color = new Color(GlobalData.currentDinoInfo?.dinoColor)
    //设置精灵的图片
    sprite.spriteFrame = this.neckSpriteFrame
    //设置节点的父节点
    neckNode.parent = this.node.getChildByName('dino_neck_box')
    //添加一节脖子就将小恐龙的身体往下移动一节脖子的距离
    let bodyNode: Node = this.node.getChildByName('dino_body')
    //获取小恐龙身体的位置
    let bodyPos: Vec3 = bodyNode.getPosition()
    //设置小恐龙身体的位置
    bodyNode.setPosition(bodyPos.x, bodyPos.y - this.neckHeight, 0)
  }

  //执行吃掉音符的动画(音符列表依次变大再缩小)
  playEatNoteAnimation() {
    //获取脖子列表
    let neckList: Node[] = this.node
      .getChildByName('dino_neck_box')
      .children.slice(0, 16) as Node[]
    // 用于存储动画的 Promise
    let animationPromise = Promise.resolve()
    // 遍历脖子列表
    for (let i = 0; i < neckList.length; i++) {
      const node = neckList[i]
      animationPromise = animationPromise.then(() => {
        return new Promise<void>((resolve) => {
          tween(node)
            .to(0.1, { scale: new Vec3(1.2, 1, 1) })
            .to(0.1, { scale: new Vec3(1, 1, 1) })
            .call(() => resolve())
            .start()
        })
      })
    }
  }

  //播放爆炸特效
  playBombEffect() {
    //创建爆照特效节点
    let bombEffectNode = instantiate(this.boomPrefab)
    //设置爆照特效节点的位置
    let bombPos = new Vec3(this.node.position.x, this.node.position.y + 100, 0)
    //设置位置
    bombEffectNode.setPosition(bombPos)
    //设置父亲节点
    bombEffectNode.setParent(this.node.parent)
    //播放爆炸特效
    bombEffectNode.getComponent(BombEffectControl).playBombEffect()
  }

  //移动小恐龙到线的位置(从小恐龙身子的位置到线的位置的距离)
  moveDinoToLine() {
    //获取线的世界坐标
    let linePos: Vec3 = this.lineNode.getWorldPosition()
    //获取小恐龙身子的世界坐标
    let dinoPos: Vec3 = this.node.getChildByName('dino_body').getWorldPosition()
    //计算两个坐标Y轴的差值
    let distance = linePos.y - dinoPos.y - 44
    //移动小恐龙到线的位置
    tween(this.node)
      .by(1, { position: new Vec3(0, distance, 0) })
      .start()
  }

  //检测是否成功闯关
  checkIsPassLevel() {
    //如果场景上已经没有音符了,则闯关成功
    let noteManager = director
      .getScene()
      .getChildByName('Canvas')
      .getChildByName('note_manager') as Node
    if (noteManager?.children?.length == 0) {
      return true
    } else {
      return false
    }
  }

  //继续游戏
  resumeGame() {
    //检测是否成功闯关
    let isPassLevel = this.checkIsPassLevel()
    if (isPassLevel) {
      //发送成功闯关的消息
      EventDispatcher.getTarget().emit(EventDispatcher.PASS_LEVEL)
    }
  }

  update(deltaTime: number) {}
}
