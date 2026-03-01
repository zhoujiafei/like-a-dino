/** 
 * 游戏开发者：程序员加菲猫 
 * 游戏名称：Like A Dino! 
 */

import { _decorator } from 'cc'
import { EventTarget } from 'cc'
const { ccclass, property } = _decorator

const event_target = new EventTarget()

export class EventDispatcher {
  private static data: EventDispatcher

  //提示消息事件
  public static TIPS_MSG = 'tips_msg'
  //游戏开始事件
  public static GAME_START = 'game_start'
  //游戏结束事件
  public static GAME_OVER = 'game_over'
  //游戏暂停事件
  public static GAME_PAUSE = 'game_pause'
  //游戏继续事件
  public static GAME_RESUME = 'game_resume'
  //闯关成功事件
  public static PASS_LEVEL = 'pass_level'
  //小恐龙吃到音符事件
  public static DINO_EAT_NOTE = 'dino_eat_note'
  //清除所有音符事件
  public static CLEAR_ALL_NOTES = 'clear_all_notes'
  //清除屏幕内的音符事件
  public static CLEAR_SCREEN_NOTES = 'clear_screen_notes'
  //移动小恐龙到线的位置事件
  public static MOVE_DINO_TO_LINE = 'move_dino_to_line'
  //开启小恐龙滑动事件(可以绕过游戏暂停状态)
  public static ENABLE_MOVE_DINO = 'enable_move_dino'
  //显示结果弹窗事件
  public static SHOW_RESULT_MODAL = 'show_result_modal'
  //显示暂停弹窗事件
  public static SHOW_PAUSE_MODAL = 'show_pause_modal'
  //显示继续游戏弹窗事件
  public static SHOW_CONTINUE_MODAL = 'show_continue_modal'
  //更新剩余生命值事件
  public static UPDATE_LIFE = 'update_life'
  //选中音乐列表项事件
  public static SELECT_MOOD_ITEM = 'select_mood_item'
  //解锁音乐列表项事件
  public static UNLOCK_MOOD_ITEM = 'unlock_mood_item'

  static getTarget(): EventTarget {
    if (EventDispatcher.data == null) {
      EventDispatcher.data = new EventDispatcher()
    }
    return EventDispatcher.data.getEventTarget()
  }

  private getEventTarget(): EventTarget {
    return event_target
  }
}
