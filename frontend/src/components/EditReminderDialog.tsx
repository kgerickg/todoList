import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Button,
    CircularProgress,
} from '@mui/material';

interface CalendarEvent {
    id: string;
    summary: string;
    start?: { dateTime?: string; date?: string };
    location?: string;
    // Add other fields if necessary, e.g., description
}

interface EditReminderDialogProps {
    open: boolean;
    onClose: () => void;
    onUpdateReminder: (eventId: string, details: { summary: string; dateTime: string; location?: string }) => Promise<void>;
    eventToEdit: CalendarEvent | null;
}

// Helper to format date for TextField type="datetime-local"
// Google Calendar API returns dateTime in ISO format (e.g., "2024-05-07T10:00:00+08:00")
// datetime-local input needs "YYYY-MM-DDTHH:mm"
const formatDateTimeForInput = (isoDateTime?: string): string => {
    if (!isoDateTime) return '';
    try {
        const date = new Date(isoDateTime);
        // Adjust for timezone offset to display local time correctly in the input
        const timezoneOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
        const localDate = new Date(date.getTime() - timezoneOffset);
        return localDate.toISOString().slice(0, 16);
    } catch (e) {
        console.error("Error formatting date:", e);
        // Fallback if parsing fails, though ideally isoDateTime should be valid
        const now = new Date();
        const timezoneOffset = now.getTimezoneOffset() * 60000;
        const localNow = new Date(now.getTime() - timezoneOffset);
        return localNow.toISOString().slice(0, 16);
    }
};


const EditReminderDialog: React.FC<EditReminderDialogProps> = ({ open, onClose, onUpdateReminder, eventToEdit }) => {
    const [summary, setSummary] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [location, setLocation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (eventToEdit) {
            setSummary(eventToEdit.summary || '');
            // Assuming eventToEdit.start.dateTime is what we need. Handle all-day events (eventToEdit.start.date) if necessary.
            setDateTime(formatDateTimeForInput(eventToEdit.start?.dateTime));
            setLocation(eventToEdit.location || '');
        } else {
            // Reset form if eventToEdit is null (e.g., dialog closed and reopened without an event)
            setSummary('');
            setDateTime('');
            setLocation('');
        }
    }, [eventToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventToEdit) return;
        setIsSubmitting(true);
        try {
            await onUpdateReminder(eventToEdit.id, { summary, dateTime, location });
            onClose(); // Close dialog on successful update
        } catch (error) {
            console.error("Failed to update reminder:", error);
            // Optionally, display an error message to the user within the dialog
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!eventToEdit) { // Don't render if no event is provided, or handle as loading/error
        return null;
    }

    return (
        <Dialog open={open} onClose={onClose} PaperProps={{ component: 'form', onSubmit: handleSubmit }}>
            <DialogTitle>編輯日曆提醒</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                    請修改以下提醒的詳細資訊。
                </DialogContentText>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="summary"
                    label="提醒摘要"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                />
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}>
                <Button onClick={onClose} disabled={isSubmitting}>取消</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? <CircularProgress size={24} /> : '儲存變更'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditReminderDialog;
