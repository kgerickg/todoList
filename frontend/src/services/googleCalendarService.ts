// frontend/src/services/googleCalendarService.ts

const CLIENT_ID = '791942092682-r3rltppuieuomgtosuatknlerf7d2u18.apps.googleusercontent.com';
const CALENDAR_API_SCOPES = 'https://www.googleapis.com/auth/calendar openid email profile'; // 改用更廣泛的日曆權限
// const CALENDAR_API_DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'; // Not directly used with fetch

let tokenClient: google.accounts.oauth2.TokenClient | null = null;
let currentAccessToken: string | null = null;
let gisInitialized = false;
let activeUserEmail: string | null = null;
const GOOGLE_ACCESS_TOKEN_KEY = 'google_access_token'; // localStorage key for access token
const GOOGLE_USER_EMAIL_KEY = 'google_user_email'; // localStorage key for user email

type SignInStatusCallback = (isSignedIn: boolean, email: string | null) => void;
let signInStatusListener: SignInStatusCallback | null = null;

const notifySignInStatusChange = () => {
    if (signInStatusListener) {
        signInStatusListener(!!currentAccessToken, activeUserEmail);
    }
};

// 嘗試從 localStorage 載入 token 和 email
const loadTokenFromStorage = () => {
    const storedToken = localStorage.getItem(GOOGLE_ACCESS_TOKEN_KEY);
    const storedEmail = localStorage.getItem(GOOGLE_USER_EMAIL_KEY);
    if (storedToken) {
        currentAccessToken = storedToken;
        activeUserEmail = storedEmail; // 可能為 null
        console.log('Access token and email loaded from localStorage.');
    }
};

export const initGoogleIdentityServices = (statusCallback?: SignInStatusCallback): Promise<void> => {
    if (statusCallback) signInStatusListener = statusCallback;

    // 只有在 currentAccessToken 為 null 時才從 localStorage 載入
    // 避免在 signOut 後立即重新載入舊的 token
    if (!currentAccessToken && !gisInitialized) { // 添加 !gisInitialized 條件
        loadTokenFromStorage();
    }

    // 如果 gis 已經初始化，且 tokenClient 也存在，則直接通知狀態並返回
    // 這有助於避免在 signOut 後立即重新初始化 client
    if (gisInitialized && tokenClient) {
        notifySignInStatusChange();
        return Promise.resolve();
    }
    // 如果 gis 已經初始化但 tokenClient 不存在 (理論上不應該發生，除非初始化失敗)，
    // 則重設 gisInitialized 以便重新嘗試初始化。
    if (gisInitialized && !tokenClient) {
        console.warn('GIS was initialized but tokenClient is missing. Resetting for re-initialization.');
        gisInitialized = false;
    }


    return new Promise((resolve, reject) => {
        const loadGis = () => {
            if (typeof window.google === 'undefined' || typeof window.google.accounts === 'undefined') {
                let attempts = 0;
                const intervalId = setInterval(() => {
                    attempts++;
                    if (typeof window.google !== 'undefined' && typeof window.google.accounts !== 'undefined') {
                        clearInterval(intervalId);
                        console.log('GIS client loaded after delay.');
                        initializeClientInternal(resolve, reject);
                    } else if (attempts > 20) {
                        clearInterval(intervalId);
                        console.error('Google Identity Services (GIS) client failed to load after multiple attempts.');
                        reject(new Error('GIS client failed to load.'));
                    }
                }, 250);
            } else {
                initializeClientInternal(resolve, reject);
            }
        };

        if (currentAccessToken) {
            console.log('Validating token from storage...');
            fetchUserInfo(currentAccessToken)
                .then(() => {
                    gisInitialized = true;
                    resolve();
                })
                .catch(async (error) => {
                    console.warn('Token from storage is invalid, clearing and re-initializing GIS.', error);
                    localStorage.removeItem(GOOGLE_ACCESS_TOKEN_KEY);
                    localStorage.removeItem(GOOGLE_USER_EMAIL_KEY);
                    currentAccessToken = null;
                    activeUserEmail = null;
                    gisInitialized = false; // 確保在 token 無效時重設
                    tokenClient = null; // 清除舊的 client 實例
                    notifySignInStatusChange();
                    loadGis(); // 重新開始 GIS 初始化流程
                });
        } else {
            loadGis(); // 如果沒有 token，直接進行 GIS 初始化
        }
    });
};

const initializeClientInternal = (resolve: () => void, reject: (reason?: any) => void) => {
    // 檢查 gisInitialized 狀態，如果已經初始化且 tokenClient 存在，則不重複執行
    if (gisInitialized && tokenClient) {
        console.log('Token client already initialized and gisInitialized is true.');
        notifySignInStatusChange();
        resolve();
        return;
    }
    // 如果 tokenClient 已經存在但 gisInitialized 為 false (可能在 signOut 後發生)，
    // 則我們需要重新設定 gisInitialized = true 並 resolve。
    // 這種情況不應該重新創建 tokenClient。
    if (!gisInitialized && tokenClient) {
        console.log('Token client exists but gisInitialized was false. Setting to true.');
        gisInitialized = true;
        notifySignInStatusChange();
        resolve();
        return;
    }

    try {
        console.log('Attempting to initialize Google Identity Services Token Client...');
        tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: CALENDAR_API_SCOPES,
            prompt: '', // 初始時不顯示 prompt
            callback: (tokenResponse: google.accounts.oauth2.TokenResponse) => {
                if (tokenResponse && tokenResponse.error) {
                    console.error('Token client callback error:', tokenResponse.error, tokenResponse.error_description);
                    currentAccessToken = null;
                    activeUserEmail = null;
                    localStorage.removeItem(GOOGLE_ACCESS_TOKEN_KEY);
                    localStorage.removeItem(GOOGLE_USER_EMAIL_KEY);
                    // 不需要在此處重設 gisInitialized 或 tokenClient，讓 initGoogleIdentityServices 的邏輯處理
                    notifySignInStatusChange();
                    return;
                }
                if (tokenResponse && tokenResponse.access_token) {
                    // 印出完整的 tokenResponse 以便檢查 scopes
                    console.log('Token response received from Google:', JSON.stringify(tokenResponse, null, 2));

                    // 檢查使用者實際授予的權限
                    const grantedScopes = tokenResponse.scope || "";
                    const requiredCalendarScope = 'https://www.googleapis.com/auth/calendar'; // 更新檢查的權限
                    if (!grantedScopes.includes(requiredCalendarScope)) {
                        console.warn(
                            `關鍵的日曆權限 (${requiredCalendarScope}) 未被使用者授予。日曆功能可能無法正常運作。`
                        );
                        // 這裡可以加入邏輯來通知應用程式狀態，例如：
                        // if (signInStatusListener) {
                        //   // 你可能需要擴展 SignInStatusCallback 來傳遞更詳細的狀態或錯誤資訊
                        //   signInStatusListener(false, null, 'calendar_permission_denied');
                        // }
                        // 目前僅記錄警告。如果使用者未授予此權限，後續的日曆 API 呼叫預期會失敗。
                    }

                    currentAccessToken = tokenResponse.access_token;
                    localStorage.setItem(GOOGLE_ACCESS_TOKEN_KEY, currentAccessToken);
                    console.log('Access token received/refreshed via callback.');
                    fetchUserInfo(currentAccessToken) // fetchUserInfo 會處理 email 和通知
                        .then(() => {
                            // User info fetched successfully. fetchUserInfo handles state updates and notifications.
                            console.log('User info successfully fetched/validated after token response.');
                        })
                        .catch(error => {
                            // Error fetching user info even with a new/refreshed token.
                            // fetchUserInfo itself logs this error and clears the token if it was a 401.
                            // It also calls notifySignInStatusChange.
                            // This catch block is mainly for acknowledging the promise chain
                            // and preventing an "uncaught promise" error at this specific call site.
                            console.error('Error during fetchUserInfo called from token callback:', error.message);
                        });
                } else {
                    // 即使沒有 access_token，也可能是使用者取消了授權
                    console.log('No access token in token response, or user cancelled.');
                    currentAccessToken = null;
                    activeUserEmail = null;
                    localStorage.removeItem(GOOGLE_ACCESS_TOKEN_KEY);
                    localStorage.removeItem(GOOGLE_USER_EMAIL_KEY);
                    notifySignInStatusChange();
                }
            },
        });
        gisInitialized = true; // 標記 GIS 已成功初始化
        console.log('Google Identity Services Token Client initialized successfully.');
        notifySignInStatusChange(); // 初始化後通知一次狀態
        resolve();
    } catch (error) {
        console.error('Error initializing GIS Token Client:', error);
        gisInitialized = false; // 初始化失敗，重設標記
        tokenClient = null; // 清除可能部分初始化的 client
        reject(error);
    }
};

const fetchUserInfo = async (accessToken: string) => {
    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!response.ok) {
            // 如果 token 無效，清除 localStorage 中的 token 和 email
            if (response.status === 401) { // Unauthorized
                console.warn('Access token is invalid (401), clearing stored token.');
                localStorage.removeItem(GOOGLE_ACCESS_TOKEN_KEY);
                localStorage.removeItem(GOOGLE_USER_EMAIL_KEY);
                currentAccessToken = null; // 確保內存中的 token 也被清除
            }
            throw new Error(`Failed to fetch user info: ${response.statusText} (status: ${response.status})`);
        }
        const userInfo = await response.json();
        activeUserEmail = userInfo.email || null;
        if (activeUserEmail) {
            localStorage.setItem(GOOGLE_USER_EMAIL_KEY, activeUserEmail); // 保存 email
        } else {
            localStorage.removeItem(GOOGLE_USER_EMAIL_KEY);
        }
        console.log('User info fetched, email:', activeUserEmail);
    } catch (error) {
        console.error('Error fetching user info:', error);
        activeUserEmail = null; // 發生錯誤時清除 email
        localStorage.removeItem(GOOGLE_USER_EMAIL_KEY); // 同時清除 localStorage 中的 email
        // 如果是因為 token 無效導致的錯誤，確保 currentAccessToken 也被清除
        // (已在上面 401 狀態處理，但這裡可以作為一個額外的保障)
        // if (error.message.includes('401')) { // 這裡的錯誤訊息判斷可能不夠精確
        //     localStorage.removeItem(GOOGLE_ACCESS_TOKEN_KEY);
        //     currentAccessToken = null;
        // }
        notifySignInStatusChange(); // 確保在錯誤時也通知狀態變更
        throw error; // 重新拋出錯誤，讓 initGoogleIdentityServices 中的 catch 處理
    } finally {
        // 確保無論成功或失敗，都會通知一次狀態
        // 如果 fetchUserInfo 是在 token 驗證流程中被呼叫，
        // 且 token 無效，則 notifySignInStatusChange 會通知登出狀態
        if (!activeUserEmail && currentAccessToken) {
            //這種情況表示 token 存在但無法獲取 email，可能 token 已失效
            console.warn('User email could not be fetched with the current token. Token might be invalid.');
        }
        notifySignInStatusChange();
    }
};

export const signInAndAuthorize = (): void => {
    if (!tokenClient) {
        console.error('GIS Token Client not initialized. Call initGoogleIdentityServices first.');
        if (signInStatusListener) {
            signInStatusListener(false, null);
        }
        return;
    }

    if (currentAccessToken) {
        console.log('Already authorized with an access token.');
        notifySignInStatusChange();
        return;
    }

    tokenClient.requestAccessToken({ prompt: 'consent' });
};

export const isSignedIn = (): boolean => {
    return !!currentAccessToken;
};

export const getSignedInUserEmail = (): string | null => {
    return activeUserEmail;
}

export const signOut = () => {
    const tokenToRevoke = currentAccessToken; // 儲存當前的 token 以便稍後撤銷

    // 1. 立即清除本地狀態和 localStorage
    currentAccessToken = null;
    activeUserEmail = null;
    localStorage.removeItem(GOOGLE_ACCESS_TOKEN_KEY);
    localStorage.removeItem(GOOGLE_USER_EMAIL_KEY);

    // 2. 重設 GIS 初始化狀態和 tokenClient 實例
    gisInitialized = false;
    tokenClient = null; // 確保下次 initGoogleIdentityServices 會建立新的 client

    console.log('User signed out. Local state and GIS client state reset.');
    notifySignInStatusChange(); // 通知 UI 登出狀態

    // 3. 嘗試在 Google 伺服器撤銷 token
    if (tokenToRevoke) {
        try {
            window.google.accounts.oauth2.revoke(tokenToRevoke, () => {
                console.log('Access token revoked on Google server.');
            });
        } catch (error) {
            console.warn('Error attempting to revoke token on Google server. This can happen if the token was already invalid or the GIS library is not fully loaded.', error);
        }
    }

    // 4. 禁用 Google 的帳號自動選擇功能，鼓勵使用者在下次登入時手動選擇帳號
    // 這有助於確保一個更「乾淨」的登入流程，特別是在切換帳號或遇到問題後
    try {
        if (typeof window.google !== 'undefined' && window.google.accounts && window.google.accounts.id) {
            window.google.accounts.id.disableAutoSelect();
            console.log('Google auto select disabled to encourage fresh sign-in for the next session.');
        }
    } catch (error) {
        console.warn('Error attempting to disable Google auto select. GIS library might not be fully available.', error);
    }
};

export const addCalendarEvent = async (
    eventDetails: {
        summary: string;
        description?: string;
        location?: string; // Added location
        start: { dateTime: string; timeZone: string };
        end: { dateTime: string; timeZone: string };
    }
): Promise<any> => {
    if (!currentAccessToken) {
        throw new Error('Not signed in or no access token. Please sign in and authorize.');
    }

    try {
        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentAccessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventDetails),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Google Calendar API error:', errorData);
            throw new Error(errorData.error?.message || `Failed to create event: ${response.statusText}`);
        }

        const createdEvent = await response.json();
        console.log('Event created:', createdEvent);
        return createdEvent;
    } catch (error) {
        console.error('Error creating calendar event:', error);
        throw error;
    }
};

export const listCalendarEvents = async (
    timeMin?: string, // ISO string, e.g., new Date().toISOString()
    timeMax?: string, // ISO string
    maxResults: number = 10
): Promise<any[]> => {
    if (!currentAccessToken) {
        // console.warn('Not signed in or no access token. Please sign in and authorize.');
        // throw new Error('Not signed in or no access token. Please sign in and authorize.');
        return []; // Return empty array if not signed in, to avoid breaking UI
    }

    try {
        const now = new Date();
        const defaultTimeMin = timeMin || new Date(now.getFullYear(), now.getMonth(), 1).toISOString(); // Default to start of current month
        const defaultTimeMax = timeMax || new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString(); // Default to end of current month

        const params = new URLSearchParams({
            calendarId: 'primary',
            timeMin: defaultTimeMin,
            timeMax: defaultTimeMax,
            maxResults: maxResults.toString(),
            singleEvents: 'true', // Expand recurring events
            orderBy: 'startTime',
        });

        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentAccessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Google Calendar API error (listEvents):', errorData);
            throw new Error(errorData.error?.message || `Failed to list events: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Events fetched:', data.items);
        return data.items || [];
    } catch (error) {
        console.error('Error listing calendar events:', error);
        // throw error; // Re-throwing might break UI if not handled, return empty array instead
        return [];
    }
};

export const updateCalendarEvent = async (
    eventId: string,
    eventDetails: {
        summary?: string;
        description?: string;
        location?: string;
        start?: { dateTime?: string; timeZone?: string; date?: string }; // date for all-day events
        end?: { dateTime?: string; timeZone?: string; date?: string }; // date for all-day events
    }
): Promise<any> => {
    if (!currentAccessToken) {
        throw new Error('Not signed in or no access token. Please sign in and authorize.');
    }
    if (!eventId) {
        throw new Error('Event ID is required to update an event.');
    }

    try {
        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${currentAccessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventDetails),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Google Calendar API error (updateEvent):', errorData);
            throw new Error(errorData.error?.message || `Failed to update event: ${response.statusText}`);
        }

        const updatedEvent = await response.json();
        console.log('Event updated:', updatedEvent);
        return updatedEvent;
    } catch (error) {
        console.error('Error updating calendar event:', error);
        throw error;
    }
};

export const deleteCalendarEvent = async (eventId: string): Promise<void> => {
    if (!currentAccessToken) {
        throw new Error('Not signed in or no access token. Please sign in and authorize.');
    }
    if (!eventId) {
        throw new Error('Event ID is required to delete an event.');
    }

    try {
        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentAccessToken}`,
            },
        });

        if (response.status === 204) { // HTTP 204 No Content indicates success for DELETE
            console.log('Event deleted successfully:', eventId);
            return;
        } else if (!response.ok) {
            const errorData = await response.json().catch(() => ({})); // Try to parse error, default to empty if not JSON
            console.error('Google Calendar API error (deleteEvent):', errorData, response.status, response.statusText);
            throw new Error(errorData.error?.message || `Failed to delete event: ${response.statusText}`);
        }
        // Should not reach here if status is 204 or not ok.
    } catch (error) {
        console.error('Error deleting calendar event:', error);
        throw error;
    }
};
