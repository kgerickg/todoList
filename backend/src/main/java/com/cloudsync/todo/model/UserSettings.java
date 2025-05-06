package com.cloudsync.todo.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 用戶設置實體類
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSettings {
    /**
     * 關聯的用戶ID
     */
    private String userId;

    /**
     * 是否啟用通知
     */
    private Boolean notificationEnabled;

    /**
     * 提前通知時間（分鐘）
     */
    private Integer notificationLeadTime;

    /**
     * 是否啟用日曆同步
     */
    private Boolean calendarSyncEnabled;

    /**
     * Google日曆ID
     */
    private String calendarId;

    /**
     * 建立預設設置的靜態方法
     */
    public static UserSettings createDefault(String userId) {
        return new UserSettings(
            userId,
            true,           // 預設啟用通知
            15,            // 預設提前15分鐘通知
            false,         // 預設不啟用日曆同步
            null           // 預設無日曆ID
        );
    }
}
