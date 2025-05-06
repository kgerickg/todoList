import React, { useState } from 'react';
import { TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle, Box } from '@mui/material';

interface AddReminderDialogProps {
    open: boolean;
    onClose: () => void;
    onAddReminder: (details: { summary: string; dateTime: string; location?: string }) => void;
}

const AddReminderDialog: React.FC<AddReminderDialogProps> = ({ open, onClose, onAddReminder }) => {
    const [summary, setSummary] = useState('');
    const [dateTime, setDateTime] = useState(''); // 預設為 ISO 格式 YYYY-MM-DDTHH:mm
    const [location, setLocation] = useState('');

    const handleSubmit = () => {
        if (!summary || !dateTime) {
            // 可以加入一些基本的驗證提示
            alert('請填寫提醒內容和時間！');
            return;
        }
        onAddReminder({ summary, dateTime, location });
        onClose(); // 提交後關閉對話框
        // 清空表單
        setSummary('');
        setDateTime('');
        setLocation('');
    };

    // 取得當前時間並格式化為 YYYY-MM-DDTHH:MM
    const getCurrentDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // 校正時區
        return now.toISOString().slice(0, 16);
    };

    // 初始化 dateTime 狀態
    useState(() => {
        setDateTime(getCurrentDateTime());
    });


    return (
        <Dialog open={open} onClose={onClose} PaperProps={{ component: 'form', onSubmit: (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); handleSubmit(); } }}>
            <DialogTitle>新增提醒到 Google 日曆</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="summary"
                    label="提醒內容"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    required
                    margin="dense"
                    id="dateTime"
                    label="日期與時間"
                    type="datetime-local"
                    fullWidth
                    variant="outlined"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    sx={{ mb: 2 }}
                />
                <TextField
                    margin="dense"
                    id="location"
                    label="地點 (選填)"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>取消</Button>
                <Button type="submit">新增</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddReminderDialog;
