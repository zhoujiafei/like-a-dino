/** 
 * 游戏开发者：程序员加菲猫 
 * 游戏名称：Like A Dino! 
 */

import { _decorator, AudioClip, sys } from 'cc'
const { ccclass } = _decorator

// 声明微信小游戏全局变量（避免 TypeScript 报错）
declare const wx: any

@ccclass('SpeedAudioPlayer')
export class SpeedAudioPlayer {
  // H5 平台核心对象
  private audioElement: HTMLAudioElement | null = null
  // 微信小游戏平台核心对象
  private innerAudioContext: any = null
  // 跨平台统一播放状态
  private currentPlayRate: number = 1.0
  private volume: number = 1.0
  private isPlaying: boolean = false
  private isPaused: boolean = false
  // 跨平台统一状态缓存（切换音频/恢复播放复用）
  private lastPlayState: { rate: number; position: number } = {
    rate: 1.0,
    position: 0
  }
  // 缓存当前音频剪辑
  private currentAudioClip: AudioClip | null = null

  /**
   * 初始化音频（跨平台自动适配）
   * @param audioClip Cocos 音频剪辑
   */
  async init(audioClip: AudioClip) {
    if (!audioClip) {
      console.error('SpeedAudioPlayer: 音频剪辑不能为空')
      return
    }

    // 保存当前音频剪辑
    this.currentAudioClip = audioClip

    // 1. H5 平台（浏览器/支持 DOM 的环境）
    if (this.isH5Platform()) {
      await this.initH5(audioClip)
    }
    // 2. 微信小游戏平台（原生 API 环境）
    else if (this.isWxGamePlatform()) {
      await this.initWxGame(audioClip)
    }
    // 3. 不支持的平台
    else {
      console.error('SpeedAudioPlayer: 暂不支持当前运行平台')
    }
  }

  /**
   * 跨平台核心：切换音频文件（保留/重置状态）
   * @param newAudioClip 新的音频剪辑
   * @param keepState 是否保留原播放状态（速率/暂停位置），默认true
   */
  async changeAudioClip(newAudioClip: AudioClip, keepState: boolean = true) {
    if (!newAudioClip) {
      console.error('SpeedAudioPlayer: 切换音频失败，音频剪辑不能为空')
      return
    }

    // 1. 记录当前状态（跨平台统一）
    if (keepState) {
      this.lastPlayState.rate = this.currentPlayRate
      this.lastPlayState.position = this.getCurrentPlayTime()
    } else {
      this.lastPlayState = { rate: 1.0, position: 0 }
    }

    // 2. 停止当前音频（跨平台统一）
    this.stop()

    // 3. 初始化新音频（自动适配平台）
    await this.init(newAudioClip)

    // 4. 恢复播放状态（跨平台统一）
    if (keepState) {
      this.currentPlayRate = this.lastPlayState.rate
      this.setPlayRate(this.currentPlayRate) // 同步速率到当前平台

      // 定位到缓存位置，根据原状态恢复播放/暂停
      if (this.isPaused) {
        this.seek(this.lastPlayState.position)
        console.log(
          `SpeedAudioPlayer: 切换音频后保留暂停状态，位置：${this.lastPlayState.position.toFixed(
            3
          )}秒`
        )
      } else if (this.isPlaying) {
        this.play(this.currentPlayRate, this.lastPlayState.position)
      }
    }

    console.log('SpeedAudioPlayer: 音频文件切换成功')
  }

  /**
   * 播放音频（跨平台统一接口，支持指定速率/起始位置）
   * @param playRate 播放速率（0.5~2.0）
   * @param startAt 起始位置（秒，默认0）
   */
  play(playRate: number = 1.0, startAt: number = 0) {
    // 限制参数范围
    this.currentPlayRate = Math.max(0.5, Math.min(playRate, 2.0))
    startAt = Math.max(0, Math.min(startAt, this.getTotalDuration()))

    // H5 平台
    if (this.isH5Platform() && this.audioElement) {
      this.audioElement.playbackRate = this.currentPlayRate
      this.audioElement.currentTime = startAt
      this.audioElement
        .play()
        .then(() => {
          this.updatePlayState(true, false)
          console.log(
            `SpeedAudioPlayer: H5 播放开始，速率：${
              this.currentPlayRate
            }，起始位置：${startAt.toFixed(3)}秒`
          )
        })
        .catch((e) => {
          console.error('SpeedAudioPlayer: H5 播放失败（需用户交互触发）：', e)
        })
    }
    // 微信小游戏平台
    else if (this.isWxGamePlatform() && this.innerAudioContext) {
      this.innerAudioContext.playbackRate = this.currentPlayRate
      this.innerAudioContext.seek(startAt)
      this.innerAudioContext.play()
      this.updatePlayState(true, false)
      this.lastPlayState.position = startAt
      console.log(
        `SpeedAudioPlayer: 微信小游戏播放开始，速率：${
          this.currentPlayRate
        }，起始位置：${startAt.toFixed(3)}秒`
      )
    }
    // 未初始化
    else {
      console.warn('SpeedAudioPlayer: 音频未初始化完成，无法播放')
    }
  }

  /**
   * 暂停播放（跨平台统一接口，精准保留当前位置）
   */
  pause() {
    if (!this.isPlaying || this.isPaused) {
      console.warn('SpeedAudioPlayer: 音频未播放或已暂停，无法暂停')
      return
    }

    // H5 平台
    if (this.isH5Platform() && this.audioElement) {
      this.audioElement.pause()
      const pausePos = this.audioElement.currentTime
      this.cachePausePosition(pausePos)
      this.updatePlayState(false, true)
    }
    // 微信小游戏平台
    else if (this.isWxGamePlatform() && this.innerAudioContext) {
      this.innerAudioContext.pause()
      const pausePos = this.innerAudioContext.currentTime
      this.cachePausePosition(pausePos)
      this.updatePlayState(false, true)
    }
  }

  /**
   * 恢复播放（跨平台统一接口，从暂停位置继续）
   */
  resume() {
    if (!this.isPaused) {
      console.warn('SpeedAudioPlayer: 音频未暂停，无法恢复播放')
      return
    }

    const resumePos = this.lastPlayState.position
    // H5 平台
    if (this.isH5Platform() && this.audioElement) {
      this.audioElement.currentTime = resumePos
      this.audioElement
        .play()
        .then(() => {
          this.updatePlayState(true, false)
          console.log(
            `SpeedAudioPlayer: H5 恢复播放，从${resumePos.toFixed(3)}秒开始`
          )
        })
        .catch((e) => {
          console.error('SpeedAudioPlayer: H5 恢复播放失败：', e)
        })
    }
    // 微信小游戏平台
    else if (this.isWxGamePlatform() && this.innerAudioContext) {
      // 恢复播放前确保应用当前设置的速率
      this.innerAudioContext.playbackRate = this.currentPlayRate
      this.innerAudioContext.seek(resumePos)
      this.innerAudioContext.play()
      this.updatePlayState(true, false)
      console.log(
        `SpeedAudioPlayer: 微信小游戏恢复播放，速率：${
          this.currentPlayRate
        }，从${resumePos.toFixed(3)}秒开始`
      )
    }
  }

  /**
   * 停止播放（跨平台统一接口，重置位置到开头）
   */
  stop() {
    // H5 平台
    if (this.isH5Platform() && this.audioElement) {
      this.audioElement.pause()
      this.audioElement.currentTime = 0
    }
    // 微信小游戏平台
    else if (this.isWxGamePlatform() && this.innerAudioContext) {
      this.innerAudioContext.pause()
      this.innerAudioContext.seek(0)
    }

    // 跨平台统一重置状态
    this.updatePlayState(false, false)
    this.lastPlayState.position = 0
    console.log('SpeedAudioPlayer: 停止播放，状态已重置')
  }

  /**
   * 动态调节播放速率（跨平台统一接口，播放中实时生效）
   * @param playRate 新速率
   */
  setPlayRate(playRate: number) {
    this.currentPlayRate = Math.max(0.5, Math.min(playRate, 2.0))
    this.lastPlayState.rate = this.currentPlayRate

    // H5 平台
    if (this.isH5Platform() && this.audioElement) {
      this.audioElement.playbackRate = this.currentPlayRate
    }
    // 微信小游戏平台
    else if (this.isWxGamePlatform() && this.innerAudioContext) {
      this.innerAudioContext.playbackRate = this.currentPlayRate

      // 微信小游戏真机环境下，设置playbackRate后需要重启播放才能生效
      // 保存当前播放位置，暂停后重新播放
      if (this.isPlaying) {
        const currentPosition = this.getCurrentPlayTime()
        this.innerAudioContext.pause()
        this.innerAudioContext.seek(currentPosition)
        this.innerAudioContext.play()
        console.log(
          `SpeedAudioPlayer: 微信小游戏重启播放以应用新速率，当前位置：${currentPosition.toFixed(
            3
          )}秒`
        )
      }
    }

    console.log(`SpeedAudioPlayer: 速率已调整为：${this.currentPlayRate}`)
  }

  /**
   * 设置音量（跨平台统一接口，0~1）
   * @param volume 音量值
   */
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(volume, 1))

    // H5 平台
    if (this.isH5Platform() && this.audioElement) {
      this.audioElement.volume = this.volume
    }
    // 微信小游戏平台
    else if (this.isWxGamePlatform() && this.innerAudioContext) {
      this.innerAudioContext.volume = this.volume
    }

    console.log(`SpeedAudioPlayer: 音量已设置为：${this.volume}`)
  }

  /**
   * 获取音频总时长（跨平台统一接口）
   */
  getTotalDuration(): number {
    // H5 平台
    if (this.isH5Platform() && this.audioElement) {
      return this.audioElement.duration || 0
    }
    // 微信小游戏平台
    else if (this.isWxGamePlatform() && this.innerAudioContext) {
      return this.innerAudioContext.duration || 0
    }
    return 0
  }

  /**
   * 获取当前播放位置（跨平台统一接口，秒）
   */
  getCurrentPlayTime(): number {
    // H5 平台
    if (this.isH5Platform() && this.audioElement) {
      return this.audioElement.currentTime || 0
    }
    // 微信小游戏平台
    else if (this.isWxGamePlatform() && this.innerAudioContext) {
      return this.innerAudioContext.currentTime || 0
    }
    return 0
  }

  /**
   * 获取当前播放状态（跨平台统一接口）
   */
  getPlayState() {
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      currentPlayRate: this.currentPlayRate,
      currentPlayTime: this.getCurrentPlayTime(),
      totalDuration: this.getTotalDuration(),
      volume: this.volume,
      platform: this.getCurrentPlatform()
    }
  }

  /**
   * 销毁资源（跨平台统一接口，释放内存）
   */
  destroy() {
    // H5 平台
    if (this.isH5Platform() && this.audioElement) {
      this.stop()
      this.audioElement.remove()
      this.audioElement = null
    }
    // 微信小游戏平台
    else if (this.isWxGamePlatform() && this.innerAudioContext) {
      this.stop()
      this.innerAudioContext.offCanplay()
      this.innerAudioContext.offEnded()
      this.innerAudioContext.offError()
      this.innerAudioContext.destroy()
      this.innerAudioContext = null
    }

    this.currentAudioClip = null
    console.log(`SpeedAudioPlayer: ${this.getCurrentPlatform()} 资源已销毁`)
  }

  // ---------------------- 内部辅助方法（跨平台适配核心）----------------------
  /**
   * 初始化 H5 平台音频（HTML5 Audio）
   */
  private async initH5(audioClip: AudioClip) {
    // 首次创建 Audio 元素
    if (!this.audioElement) {
      this.audioElement = document.createElement('audio')
      this.audioElement.preload = 'auto'
      // 监听播放结束
      this.audioElement.onended = () => {
        this.updatePlayState(false, false)
        this.lastPlayState.position = 0
        console.log('SpeedAudioPlayer: H5 音频播放结束')
      }
    }

    // 设置音频源并等待加载
    this.audioElement.src = audioClip.nativeUrl
    await new Promise((resolve, reject) => {
      const onCanplayCallback = () => {
        this.audioElement!.removeEventListener(
          'canplaythrough',
          onCanplayCallback
        )
        resolve(true)
      }
      this.audioElement!.addEventListener('canplaythrough', onCanplayCallback)
      this.audioElement!.addEventListener('error', (e) => {
        reject(new Error(`H5 音频加载失败：${e}`))
      })
    })

    // 恢复缓存状态
    this.audioElement.volume = this.volume
    this.audioElement.playbackRate = this.currentPlayRate
    console.log(
      'SpeedAudioPlayer: H5 音频初始化成功，总时长：',
      this.getTotalDuration().toFixed(2),
      '秒'
    )
  }

  /**
   * 初始化 微信小游戏 平台音频（wx.createInnerAudioContext）
   */
  private async initWxGame(audioClip: AudioClip) {
    // 首次创建微信原生音频上下文
    if (!this.innerAudioContext) {
      this.innerAudioContext = wx.createInnerAudioContext()
      this.innerAudioContext.volume = this.volume
      this.innerAudioContext.playbackRate = this.currentPlayRate
      this.innerAudioContext.loop = false

      // 监听原生事件
      this.innerAudioContext.onCanplay(() => {
        console.log(
          'SpeedAudioPlayer: 微信小游戏音频加载完成，总时长：',
          this.getTotalDuration().toFixed(2),
          '秒'
        )
      })

      this.innerAudioContext.onEnded(() => {
        this.updatePlayState(false, false)
        this.lastPlayState.position = 0
        console.log('SpeedAudioPlayer: 微信小游戏音频播放结束')
      })

      this.innerAudioContext.onError((err: any) => {
        console.error('SpeedAudioPlayer: 微信小游戏音频发生错误：', err)
        this.updatePlayState(false, false)
      })
    }

    // 设置音频源并等待加载（核心修复：移除 onCanplayOnce，改用 onCanplay + 手动解除监听）
    this.innerAudioContext.src = audioClip.nativeUrl
    await new Promise((resolve) => {
      // 定义一次性监听函数
      const onCanplayCallback = () => {
        // 手动移除监听，实现「一次性触发」的效果，避免重复回调
        this.innerAudioContext.offCanplay(onCanplayCallback)
        resolve(true)
      }

      // 先判断音频是否已加载完成
      if (this.innerAudioContext.readyState === 'canplay') {
        resolve(true)
      } else {
        // 绑定普通 onCanplay 监听，触发后手动移除，替代不存在的 onCanplayOnce
        this.innerAudioContext.onCanplay(onCanplayCallback)
      }
    })

    // 恢复缓存状态
    this.innerAudioContext.volume = this.volume
    this.innerAudioContext.playbackRate = this.currentPlayRate
  }

  /**
   * 判断是否为 H5 平台（浏览器/支持 DOM 的环境）
   */
  private isH5Platform(): boolean {
    return sys.isBrowser && sys.platform !== sys.Platform.WECHAT_GAME
  }

  /**
   * 判断是否为 微信小游戏 平台
   */
  private isWxGamePlatform(): boolean {
    return sys.platform === sys.Platform.WECHAT_GAME
  }

  /**
   * 获取当前平台名称（用于日志/调试）
   */
  private getCurrentPlatform(): string {
    if (this.isH5Platform()) return 'H5'
    if (this.isWxGamePlatform()) return '微信小游戏'
    return '未知平台'
  }

  /**
   * 跨平台统一更新播放状态
   */
  private updatePlayState(isPlaying: boolean, isPaused: boolean) {
    this.isPlaying = isPlaying
    this.isPaused = isPaused
  }

  /**
   * 跨平台统一缓存暂停位置
   */
  private cachePausePosition(position: number) {
    const clampPos = Math.max(0, Math.min(position, this.getTotalDuration()))
    this.lastPlayState.position = clampPos
    console.log(
      `SpeedAudioPlayer: 暂停成功，当前位置：${clampPos.toFixed(3)}秒`
    )
  }

  /**
   * 跨平台统一定位音频位置
   */
  private seek(position: number) {
    const clampPos = Math.max(0, Math.min(position, this.getTotalDuration()))
    if (this.isH5Platform() && this.audioElement) {
      this.audioElement.currentTime = clampPos
    } else if (this.isWxGamePlatform() && this.innerAudioContext) {
      this.innerAudioContext.seek(clampPos)
    }
  }
}
