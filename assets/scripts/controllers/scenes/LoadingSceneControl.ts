/** 
 * 游戏开发者：程序员加菲猫 
 * 游戏名称：Like A Dino! 
 */

import {
  _decorator,
  Color,
  Component,
  director,
  Sprite,
  Node,
  tween,
  Vec3,
  Label,
  resources,
  AudioClip,
  instantiate,
  Prefab
} from 'cc'
import AudioEffect from '../../libs/AudioEffect'
import GlobalData from '../../config/GlobalData'
import Common from '../../libs/Common'
import { BombEffectControl } from '../effects/BombEffectControl'
const { ccclass, property } = _decorator

@ccclass('LoadingSceneControl')
export class LoadingSceneControl extends Component {
  //小恐龙节点
  @property(Node)
  dinoNode: Node | null = null!

  //加载文案节点
  @property(Node)
  loadingNode: Node | null = null!

  //开始游戏按钮节点
  @property(Node)
  startGameBtnNode: Node | null = null!

  //爆炸特效预制体
  @property(Prefab)
  boomPrefab: Prefab = null!

  //资源目录（不含场景）
  private resourceDirs = [
    'images', // 图片目录
    'prefabs' // 预制体目录
  ]

  //总的需要加载的资源数量
  private totalResourceCount = 5

  //标记加载的进度
  private loadingProgress = 0

  //是否完成加载
  private isFinished = false

  start() {
    //设置当前页面的背景颜色
    this.setBackgroundColor()
    //设置小恐龙的颜色
    this.setDinoColor()
    //播放小恐龙动画
    this.playDinoAnimation()
    //播放加载文案的动画
    this.playLoadingAnimation()
    //预加载资源
    this.preloadResources()
    //最迟在5秒之后要可以开放开始游戏按钮
    this.scheduleOnce(() => {
      this.loadingProgress = this.totalResourceCount
    }, 5)
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

  //设置小恐龙的颜色
  setDinoColor() {
    //获得当前的小恐龙信息
    const dinoInfo = GlobalData.currentDinoInfo
    //小恐龙的颜色
    const dinoColor = new Color(dinoInfo?.dinoColor)
    //设置小恐龙头部的颜色
    this.dinoNode.getComponent(Sprite).color = dinoColor
  }

  //播放小恐龙动画
  playDinoAnimation() {
    //获取小恐龙当前的位置
    const position = this.dinoNode.getPosition()
    //执行缓动动画
    tween(this.dinoNode)
      .repeatForever(
        tween()
          .set({ scale: new Vec3(-1, 1, 1) })
          .to(1, {
            position: new Vec3(150, position.y, position.z)
          })
          .set({ scale: new Vec3(1, 1, 1) })
          .to(1, {
            position: new Vec3(-150, position.y, position.z)
          })
      ) //无限循环
      .start()
  }

  //播放加载文案的动画
  playLoadingAnimation() {
    //每隔1秒修改一次loading...文案，主要是修改后面的三个点
    tween(this.loadingNode.getComponent(Label))
      .repeatForever(
        tween()
          .set({ string: 'Loading.' })
          .delay(0.5)
          .set({ string: 'Loading..' })
          .delay(0.5)
          .set({ string: 'Loading...' })
          .delay(0.5)
      ) //无限循环
      .start()
  }

  //开启可以游戏
  openStartGameBtn() {
    //隐藏加载文案
    this.loadingNode.active = false
    //显示开始游戏按钮
    this.startGameBtnNode.active = true
    //播放按钮动画(放大缩小)
    tween(this.startGameBtnNode)
      .repeatForever(
        tween()
          .to(0.5, { scale: new Vec3(1.1, 1.1, 1) })
          .to(0.5, { scale: new Vec3(1, 1, 1) })
      )
      .start()
  }

  //预加载资源
  preloadResources() {
    //1.预加载场景
    director.preloadScene('home', () => {
      //资源加载完成
      this.loadingProgress += 1
    })
    //预加载游戏场景
    director.preloadScene('game', () => {
      //资源加载完成
      this.loadingProgress += 1
    })
    //2.预加载图片等其他资源
    this.preloadImageResources()
    //3.预加载音频资源
    this.preloadAudioResources()
  }

  //预加载音频资源
  preloadAudioResources() {
    //获得当前选择的音乐ID
    const musicId = GlobalData.selectedMusicID
    //音乐文件路径
    const musicPath = `audios/music/music_${musicId}`
    //预加载音乐
    resources.load(musicPath, AudioClip, (err, asset) => {
      this.loadingProgress += 1
    })
  }

  //预加载图片资源
  preloadImageResources() {
    // 2.加载其他资源目录
    this.resourceDirs.forEach((dir) => {
      resources.loadDir(dir, (err, assets) => {
        this.loadingProgress += 1
      })
    })
  }

  //跳转到首页场景
  goToHomeScene() {
    //播放点击音效
    AudioEffect.playClickAudio()
    //播放一下爆炸特效
    this.playBombEffect()
    //跳转到作者简介场景
    this.scheduleOnce(() => {
      director.loadScene('home')
    }, 0.4)
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
    bombEffectNode.setParent(this.startGameBtnNode)
    //播放爆炸特效
    bombEffectNode.getComponent(BombEffectControl).playBombEffect()
  }

  update(deltaTime: number) {
    //如果检测到任务完成的话直接返回
    if (this.isFinished) {
      return
    }
    //如果检测到任务完成的话就开放开始游戏按钮
    if (this.loadingProgress >= this.totalResourceCount) {
      this.isFinished = true
      this.openStartGameBtn()
    }
  }
}
