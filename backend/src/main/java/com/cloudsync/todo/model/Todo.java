package com.cloudsync.todo.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

/**
 * 待辦事項實體類
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Todo {
    /**
     * 待辦事項ID
     */
    private String id;

    /**
     * 擁有者用戶ID
     */
    private String userId;

    /**
     * 標題
     */
    private String title;

    /**
     * 詳細描述
     */
    private String description;

    /**
     * 預定完成時間
     */
    private Date dueDate;

    /**
     * 重要性等級 (1-5)
     */
    private Integer priority;

    /**
     * 是否已完成
     */
    private Boolean completed;

    /**
     * 創建時間
     */
    private Date createdAt;

    /**
     * 更新時間
     */
    private Date updatedAt;

    /**
     * 關聯的Google日曆事件ID
     */
    private String calendarEventId;
}
