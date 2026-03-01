/**
 * 游戏开发者：程序员加菲猫
 * 游戏名称：Like A Dino!
 */

//定义一些配置
export enum GameState {
  //游戏未开始
  WAIT_START = 0,
  //游戏进行中
  PLAYING = 1,
  //游戏结束
  GAME_OVER = 2,
  //游戏暂停
  PAUSE = 3
}

//游戏中用到的存储key
export class GameStorageKeyConfig {
  //存储音乐对应的音符列表信息
  static MusicNoteList: string = '_dino_music_note_list'
  //存储玩家最好的得分成绩
  static BestScore: string = '_dino_best_score'
  //存储玩家累计的总得分(总的金币数)
  static TotalScore: string = '_dino_total_score'
  //存储当前选择的音乐ID
  static SelectedMusicID: string = '_dino_selected_music_id'
  //存储解锁了哪些音乐的ID
  static UnlockMusicIDList: string = '_dino_unlock_music_id_list'
  //存储当前选择的小恐龙ID
  static SelectedDinoID: string = '_dino_selected_dino_id'
  //存储解锁了哪些小恐龙的ID
  static UnlockDinoIDList: string = '_dino_unlock_dino_id_list'
  //存储当前的小恐龙的信息
  static CurrentDinoInfo: string = '_dino_current_dino_info'
  //存储当前选择的音乐的信息
  static CurrentMusicInfo: string = '_dino_current_music_info'
}
