import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Button, ButtonGroup } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import EditReminderDialog from '../components/EditReminderDialog.tsx';
import {
    listCalendarEvents,
    isSignedIn as isGoogleSignedIn,
    initGoogleIdentityServices,
    updateCalendarEvent,
    deleteCalendarEvent,
} from '../services/googleCalendarService';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../store/slices/uiSlice';

// 定義日曆事件的介面
interface CalendarEvent {
    id: string;
    summary: string;
    start?: { dateTime?: string; date?: string };
    end?: { dateTime?: string; date?: string };
    location?: string;
}

// FullCalendar 的事件格式介面
interface FullCalendarEvent {
    id: string;
    title: string;
    start: string;
    end?: string;
    allDay?: boolean;
    location?: string;
    extendedProps?: {
        originalEvent: CalendarEvent;
    };
}

const CalendarPage: React.FC = () => {
    const dispatch = useDispatch();
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);
    const [eventsError, setEventsError] = useState<string | null>(null);
    const [googleAuthInitialized, setGoogleAuthInitialized] = useState(false);
    const [googleSignedIn, setGoogleSignedIn] = useState(isGoogleSignedIn());
    const [isEditReminderDialogOpen, setIsEditReminderDialogOpen] = useState(false);
    const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
    const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek' | 'listMonth'>('dayGridMonth'); // Changed listWeek to listMonth
    const calendarRef = React.useRef<FullCalendar>(null); // Create a ref for FullCalendar

    // 將 Google Calendar Event 轉換為 FullCalendar Event 格式
    const convertToFullCalendarEvents = (events: CalendarEvent[]): FullCalendarEvent[] => {
        return events.map(event => ({
            id: event.id,
            title: event.summary,
            start: event.start?.dateTime || event.start?.date || '',
            end: event.end?.dateTime || event.end?.date || '',
            allDay: !event.start?.dateTime, // 如果沒有 dateTime，表示是全天事件
            location: event.location,
            extendedProps: {
                originalEvent: event,
            }
        }));
    };

    const fetchEvents = async (startStr?: string, endStr?: string) => {
        if (!isGoogleSignedIn()) {
            setCalendarEvents([]);
            setIsLoadingEvents(false);
            return;
        }
        setIsLoadingEvents(true);
        setEventsError(null);
        try {
            const events = await listCalendarEvents(startStr, endStr, 50);
            setCalendarEvents(events as CalendarEvent[]);
        } catch (error: any) {
            console.error('獲取日曆事件失敗:', error);
            setEventsError(error.message || '獲取事件時發生錯誤');
            setCalendarEvents([]);
        } finally {
            setIsLoadingEvents(false);
        }
    };

    useEffect(() => {
        initGoogleIdentityServices((isSignedIn, email) => {
            setGoogleSignedIn(isSignedIn);
            setGoogleAuthInitialized(true);
            if (isSignedIn) {
                fetchEvents();
            } else {
                setCalendarEvents([]);
                setIsLoadingEvents(false);
            }
        }).catch(err => {
            console.error("GIS 初始化失敗:", err);
            setEventsError("Google 服務初始化失敗，無法載入日曆事件。");
            setGoogleAuthInitialized(true);
            setIsLoadingEvents(false);
        });
    }, []);

    useEffect(() => {
        if (googleAuthInitialized && googleSignedIn) {
            fetchEvents();
        } else if (googleAuthInitialized && !googleSignedIn) {
            setCalendarEvents([]);
            setIsLoadingEvents(false);
        }
    }, [googleSignedIn, googleAuthInitialized]);

    // Effect to change view when currentView state changes
    useEffect(() => {
        if (calendarRef.current) {
            calendarRef.current.getApi().changeView(currentView);
        }
    }, [currentView]);

    const handleOpenEditDialog = (event: CalendarEvent) => {
        setEventToEdit(event);
        setIsEditReminderDialogOpen(true);
    };

    const handleCloseEditDialog = () => {
        setIsEditReminderDialogOpen(false);
        setEventToEdit(null);
    };

    const handleUpdateReminder = async (eventId: string, details: { summary: string; dateTime: string; location?: string }) => {
        if (!isGoogleSignedIn()) {
            dispatch(showSnackbar({ message: '請先登入 Google 以更新提醒。', severity: 'warning' }));
            return;
        }
        try {
            const startDate = new Date(details.dateTime);
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            let endDate: Date;

            if (eventToEdit?.start?.dateTime && eventToEdit?.end?.dateTime) {
                const originalStartDate = new Date(eventToEdit.start.dateTime);
                const originalEndDate = new Date(eventToEdit.end.dateTime);
                const duration = originalEndDate.getTime() - originalStartDate.getTime();
                endDate = new Date(startDate.getTime() + duration);
            } else {
                endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
            }

            const eventDataToUpdate = {
                summary: details.summary,
                location: details.location,
                start: { dateTime: startDate.toISOString(), timeZone },
                end: { dateTime: endDate.toISOString(), timeZone },
            };

            await updateCalendarEvent(eventId, eventDataToUpdate);
            dispatch(showSnackbar({ message: '日曆提醒已成功更新！', severity: 'success' }));
            fetchEvents();
        } catch (error: any) {
            console.error('更新日曆提醒失敗:', error);
            dispatch(showSnackbar({ message: `更新提醒失敗: ${error.message || '未知錯誤'}`, severity: 'error' }));
        }
    };

    const handleDeleteReminder = async (eventId: string) => {
        if (!isGoogleSignedIn()) {
            dispatch(showSnackbar({ message: '請先登入 Google 以刪除提醒。', severity: 'warning' }));
            return;
        }

        const eventToDelete = calendarEvents.find(event => event.id === eventId);
        const confirmDelete = window.confirm(`您確定要刪除提醒 "${eventToDelete?.summary || eventId}" 嗎？此操作無法復原。`);

        if (confirmDelete) {
            try {
                await deleteCalendarEvent(eventId);
                dispatch(showSnackbar({ message: '日曆提醒已成功刪除！', severity: 'success' }));
                fetchEvents();
            } catch (error: any) {
                console.error('刪除日曆提醒失敗:', error);
                dispatch(showSnackbar({ message: `刪除提醒失敗: ${error.message || '未知錯誤'}`, severity: 'error' }));
            }
        }
    };

    // 處理日曆事件點擊
    const handleEventClick = (info: any) => {
        if (info.event.extendedProps?.originalEvent) {
            handleOpenEditDialog(info.event.extendedProps.originalEvent);
        }
    };

    // 處理日期範圍變更
    const handleDatesSet = (info: any) => {
        fetchEvents(info.startStr, info.endStr);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                我的日曆提醒
            </Typography>
            {!googleAuthInitialized && <Typography sx={{ textAlign: 'center', mt: 4 }}>正在初始化 Google 日曆服務...</Typography>}

            {googleAuthInitialized && !googleSignedIn && (
                <Box textAlign="center" mt={4}>
                    <Typography variant="body1" gutterBottom>
                        請前往「設定」頁面登入您的 Google 帳號以同步並查看日曆事件。
                    </Typography>
                </Box>
            )}

            {googleAuthInitialized && googleSignedIn && (
                <>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                        <ButtonGroup>
                            <Button
                                variant={currentView === 'dayGridMonth' ? 'contained' : 'outlined'}
                                onClick={() => setCurrentView('dayGridMonth')}
                            >
                                月檢視
                            </Button>
                            <Button
                                variant={currentView === 'timeGridWeek' ? 'contained' : 'outlined'}
                                onClick={() => setCurrentView('timeGridWeek')}
                            >
                                週檢視
                            </Button>
                            <Button
                                variant={currentView === 'listMonth' ? 'contained' : 'outlined'}
                                onClick={() => setCurrentView('listMonth')}
                            >
                                列表 (月)
                            </Button>
                        </ButtonGroup>
                    </Box>

                    <Box sx={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}>
                        <FullCalendar
                            ref={calendarRef} // Assign the ref
                            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                            initialView={'dayGridMonth'}
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: '',
                            }}
                            events={convertToFullCalendarEvents(calendarEvents)}
                            eventClick={handleEventClick}
                            datesSet={handleDatesSet}
                            showNonCurrentDates={false}
                            loading={(isLoading) => {
                                // 處理 FullCalendar 內部載入狀態變更的回呼
                            }}
                            locale="zh-tw"
                            firstDay={1} // 週一作為一週的第一天
                            // Google 日曆風格的事件顏色
                            eventColor="#039be5" // Google 日曆主要事件顏色 (藍色)
                            eventTextColor="#ffffff" // 事件文字顏色 (白色)
                            // 可以為不同類型的事件定義不同的顏色，如果您的事件有分類的話
                            // eventSources={[
                            //   {
                            //     events: convertToFullCalendarEvents(calendarEvents.filter(e => e.type === 'meeting')),
                            //     color: '#e67c73' // 例如：會議用紅色
                            //   },
                            //   {
                            //     events: convertToFullCalendarEvents(calendarEvents.filter(e => e.type === 'personal')),
                            //     color: '#7986cb' // 例如：個人事務用紫色
                            //   }
                            // ]}
                            // 月檢視下的樣式調整
                            dayHeaderFormat={{ weekday: 'short' }} // 星期幾顯示為簡寫
                            // 週檢視和日檢視下的樣式調整
                            slotMinTime="07:00:00" // 開始時間
                            slotMaxTime="22:00:00" // 結束時間
                            slotLabelFormat={{ hour: 'numeric', minute: '2-digit', meridiem: false, hour12: false }} // 時間標籤格式 (24小時制)
                            nowIndicator={true} // 顯示目前時間指示器
                            // 列表檢視下的樣式調整
                            listDayFormat={{ month: 'long', day: 'numeric', year: 'numeric' }} // 列表日期格式
                            listDaySideFormat={{ weekday: 'long' }} // 列表星期幾格式
                        // 統一的邊框和背景色，使其更接近 Google 日曆
                        // 這些樣式也可以透過 theme.ts 中的 MuiPaper 或直接在 FullCalendar 的 CSS 中調整
                        // sx={{
                        //   '& .fc-toolbar-title': { fontSize: '1.25rem' },
                        //   '& .fc-daygrid-day-number': { fontSize: '0.8rem' },
                        //   '& .fc-event': { borderRadius: '4px', borderWidth: '0px', padding: '2px 4px', fontSize: '0.8rem'},
                        //   '& .fc-daygrid-day.fc-day-today': { backgroundColor: 'rgba(25, 118, 210, 0.08)'}, // 今日背景色
                        // }}
                        />
                    </Box>
                </>
            )}
            {eventToEdit && (
                <EditReminderDialog
                    open={isEditReminderDialogOpen}
                    onClose={handleCloseEditDialog}
                    onUpdateReminder={handleUpdateReminder}
                    eventToEdit={eventToEdit}
                />
            )}
        </Container>
    );
};

export default CalendarPage;
