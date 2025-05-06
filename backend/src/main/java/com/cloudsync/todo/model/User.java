package com.cloudsync.todo.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

/**
 * 用戶實體類
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    /**
     * 用戶ID（來自Firebase Authentication）
     */
    private String id;

    /**
     * 用戶電子郵件
     */
    private String email;

    /**
     * 顯示名稱
     */
    private String displayName;

    /**
     * 頭像URL
     */
    private String photoURL;

    /**
     * 帳戶創建時間
     */
    private Date createdAt;

    /**
     * 最後登入時間
     */
    private Date lastLogin;

    /**
     * 用戶設置
     */
    private UserSettings settings;
}
