/**
 * 游戏开发者：程序员加菲猫
 * 游戏名称：Like A Dino!
 */

//游戏全局数据保存
//导入游戏状态枚举
import Utils from '../libs/Utils'
import { GameState, GameStorageKeyConfig } from './Config'

export default class GlobalData {
  //控制全局游戏的状态
  public static gameState: GameState = GameState.WAIT_START
  //每吃到一个音符，分数增加的数量
  public static addScore: number = 1
  //用户当前这一局获得的总分
  public static curRoundTotalScore: number = 0
  //音符移动的速度
  public static noteSpeed: number = 800
  //定义每一局用户有几条生命
  public static lifeNumPerRound: number = 2
  //当前的速度倍率
  public static speedRate: number = 1
  //速度倍率每次增加的值
  public static speedRateAdd: number = 0.2
  //获取当前选择的音乐ID(默认1)
  public static get selectedMusicID() {
    return parseInt(Utils.getCache(GameStorageKeyConfig.SelectedMusicID)) || 1
  }
  //设置当前选择的音乐ID
  public static set selectedMusicID(value) {
    //存储到本地缓存中
    Utils.setCache(GameStorageKeyConfig.SelectedMusicID, value)
  }
  //获取当前选择的小恐龙ID(默认是1)
  public static get selectedDinoID() {
    return parseInt(Utils.getCache(GameStorageKeyConfig.SelectedDinoID)) || 1
  }
  //设置当前选择的小恐龙ID
  public static set selectedDinoID(value) {
    //存储到本地缓存中
    Utils.setCache(GameStorageKeyConfig.SelectedDinoID, value)
  }
  //获取当前选择的小恐龙的信息
  public static get currentDinoInfo(): any {
    //从本地缓存中获取(默认)
    return (
      Utils.getCache(GameStorageKeyConfig.CurrentDinoInfo) || {
        id: 1,
        name: '小恐龙1',
        desc: 'Dino:Will you marry me?',
        isLocked: 0,
        unlockGold: 0,
        dinoColor: '#ffffff',
        bgColor: '#cce5cd'
      }
    )
  }
  //设置当前选择的小恐龙的信息
  public static set currentDinoInfo(value) {
    //存储到本地缓存中
    Utils.setCache(GameStorageKeyConfig.CurrentDinoInfo, value)
  }
  //获取当前选择的音乐的信息
  public static get currentMusicInfo(): any {
    //从本地缓存中获取(默认)
    return (
      Utils.getCache(GameStorageKeyConfig.CurrentMusicInfo) || {
        id: 1,
        title: 'Like A Dino!',
        bestScore: 0,
        isLocked: 0,
        unlockGold: 0
      }
    )
  }
  //设置当前选择的音乐的信息
  public static set currentMusicInfo(value) {
    //存储到本地缓存中
    Utils.setCache(GameStorageKeyConfig.CurrentMusicInfo, value)
  }
  //获取玩家最好的成绩
  public static get bestScore() {
    //从本地缓存中获取
    let scoreMap = Utils.getCache(GameStorageKeyConfig.BestScore) || {}
    //获取当前选择的音乐ID
    let bestScoreKey = GlobalData.selectedMusicID
    //从本地获取最好成绩
    let score = scoreMap[bestScoreKey] || 0
    //返回当前选择的音乐ID的最好成绩
    return score
  }
  //存储游戏的UUID
  public static set bestScore(value) {
    //获取当前选择的音乐ID
    let bestScoreKey = GlobalData.selectedMusicID
    //从本地获取最好成绩的映射
    let scoreMap = Utils.getCache(GameStorageKeyConfig.BestScore) || {}
    //更新当前选择的音乐ID的最好成绩(转换为整数)
    scoreMap[bestScoreKey] = parseInt(value)
    //存储到本地缓存中
    Utils.setCache(GameStorageKeyConfig.BestScore, scoreMap)
  }
  //获取玩家累计的总得分(总的金币数)
  public static get totalScore() {
    //从本地缓存中获取
    let score = Utils.getCache(GameStorageKeyConfig.TotalScore) || 0
    return score ? parseInt(score) : 0
  }
  //存储玩家累计的总得分(总的金币数)
  public static set totalScore(value) {
    //存储到本地缓存中
    Utils.setCache(GameStorageKeyConfig.TotalScore, value)
  }
  //获取解锁了哪些音乐的ID列表
  public static get unlockMusicIDList() {
    //从本地缓存中获取(默认)
    return Utils.getCache(GameStorageKeyConfig.UnlockMusicIDList) || []
  }
  //存储解锁了哪些音乐的ID列表
  public static set unlockMusicIDList(value) {
    //存储到本地缓存中
    Utils.setCache(GameStorageKeyConfig.UnlockMusicIDList, value)
  }
  //获取解锁了哪些小恐龙的ID列表
  public static get unlockDinoIDList() {
    //从本地缓存中获取(默认)
    return Utils.getCache(GameStorageKeyConfig.UnlockDinoIDList) || []
  }
  //存储解锁了哪些小恐龙的ID列表
  public static set unlockDinoIDList(value) {
    //存储到本地缓存中
    Utils.setCache(GameStorageKeyConfig.UnlockDinoIDList, value)
  }
  //重置游戏数据
  public static resetGameData() {
    //首次进入游戏设置当前这一局的总分数为0
    GlobalData.curRoundTotalScore = 0
    //首次进入游戏玩生命值是2
    GlobalData.lifeNumPerRound = 2
    //首次进入游戏开始玩游戏速度是1倍
    GlobalData.speedRate = 1
  }
}
