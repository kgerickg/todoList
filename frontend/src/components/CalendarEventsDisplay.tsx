import React from 'react';
import { List, ListItem, ListItemText, Typography, Paper, CircularProgress, Box, Divider, Button, IconButton } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete'; // Added DeleteIcon

interface CalendarEvent {
    id: string;
    summary: string;
    start?: { dateTime?: string; date?: string };
    end?: { dateTime?: string; date?: string };
    location?: string;
}

interface CalendarEventsDisplayProps {
    events: CalendarEvent[];
    isLoading: boolean;
    error?: string | null;
    onRefresh?: () => void;
    onEditEvent?: (event: CalendarEvent) => void;
    onDeleteEvent?: (eventId: string) => void; // Callback for deleting an event
}

const formatDate = (dateTime?: string, date?: string): string => {
    if (dateTime) {
        return new Date(dateTime).toLocaleString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }
    if (date) {
        // For all-day events, the date is YYYY-MM-DD.
        // Adjust to local timezone to avoid off-by-one day issues.
        const d = new Date(date + 'T00:00:00'); // Assume midnight in local timezone
        return d.toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' // Specify UTC to interpret date as given
        });
    }
    return '時間未定';
};

const CalendarEventsDisplay: React.FC<CalendarEventsDisplayProps> = ({ events, isLoading, error, onRefresh, onEditEvent, onDeleteEvent }) => { // Added onDeleteEvent to destructuring
    if (isLoading) {
        return (
            <Paper sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <CircularProgress />
            </Paper>
        );
    }

    if (error) {
        return (
            <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="error">讀取日曆事件失敗: {error}</Typography>
                {onRefresh && <Button onClick={onRefresh} sx={{ mt: 1 }}>重試</Button>}
            </Paper>
        );
    }

    if (!events || events.length === 0) {
        return (
            <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography>目前沒有日曆事件。</Typography>
                {onRefresh && <Button onClick={onRefresh} sx={{ mt: 1 }}>重新整理</Button>}
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6">日曆提醒</Typography>
                {onRefresh && <Button onClick={onRefresh} size="small">重新整理</Button>}
            </Box>
            <List dense>
                {events.map((event) => (
                    <React.Fragment key={event.id}>
                        <ListItem
                            alignItems="flex-start"
                            secondaryAction={
                                <Box>
                                    {onEditEvent && (
                                        <IconButton edge="end" aria-label="edit" onClick={() => onEditEvent(event)} size="small" sx={{ mr: 0.5 }}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                    {onDeleteEvent && (
                                        <IconButton edge="end" aria-label="delete" onClick={() => onDeleteEvent(event.id)} size="small">
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </Box>
                            }
                        >
                            <EventIcon sx={{ mr: 1.5, mt: 0.5, color: 'primary.main' }} />
                            <ListItemText
                                primary={event.summary || '無標題'}
                                secondary={
                                    <>
                                        <Typography component="span" variant="body2" color="text.primary">
                                            {formatDate(event.start?.dateTime, event.start?.date)}
                                        </Typography>
                                        {event.location && (
                                            <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                <LocationOnIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                                                {event.location}
                                            </Typography>
                                        )}
                                    </>
                                }
                            />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                    </React.Fragment>
                ))}
            </List>
        </Paper>
    );
};

export default CalendarEventsDisplay;
