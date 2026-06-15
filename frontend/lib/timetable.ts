'use client';

export type TimetableDay = {
  id: string;
  label: string;
  periods: string[];
};

export type TimetableBreak = {
  id: 'interval1' | 'lunch' | 'interval2';
  label: string;
  afterPeriod: number;
  tone: 'interval' | 'lunch';
};

export type TimetableData = {
  className: string;
  section: string;
  breakAfterPeriod2: string;
  lunchAfterPeriod4: string;
  breakAfterPeriod6: string;
  breaks: TimetableBreak[];
  days: TimetableDay[];
};

export const TIMETABLE_STORAGE_KEY = 'safereach_class_4b_timetable';

export const defaultTimetable: TimetableData = {
  className: 'Class 4',
  section: 'B',
  breakAfterPeriod2: 'Interval-1',
  lunchAfterPeriod4: 'Lunch',
  breakAfterPeriod6: 'Interval-2',
  breaks: [
    { id: 'interval1', label: 'Interval-1', afterPeriod: 2, tone: 'interval' },
    { id: 'lunch', label: 'Lunch', afterPeriod: 4, tone: 'lunch' },
    { id: 'interval2', label: 'Interval-2', afterPeriod: 6, tone: 'interval' },
  ],
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((label, index) => ({
    id: label.toLowerCase(),
    label,
    periods: [
      ['English', 'Maths', 'Science', 'Social', 'Computer', 'Tamil', 'Activity', 'Library'],
      ['Maths', 'Science', 'English', 'Tamil', 'Social', 'Computer', 'Sports', 'Art'],
      ['Science', 'English', 'Maths', 'Computer', 'Tamil', 'Social', 'Library', 'Activity'],
      ['Tamil', 'Maths', 'Science', 'English', 'Computer', 'Social', 'Art', 'Sports'],
      ['Social', 'English', 'Computer', 'Maths', 'Science', 'Tamil', 'Activity', 'Library'],
      ['Revision', 'Maths Lab', 'Science Lab', 'English', 'Club', 'Sports', 'Art', 'Library'],
    ][index],
  })),
};

function normalizeTimetable(data: TimetableData): TimetableData {
  const periodCount = data.days?.[0]?.periods?.length || 8;
  const sourceBreaks = Array.isArray(data.breaks) && data.breaks.length
    ? data.breaks
    : [
        { id: 'interval1', label: data.breakAfterPeriod2 || 'Interval-1', afterPeriod: 2, tone: 'interval' },
        { id: 'lunch', label: data.lunchAfterPeriod4 || 'Lunch', afterPeriod: 4, tone: 'lunch' },
        { id: 'interval2', label: data.breakAfterPeriod6 || 'Interval-2', afterPeriod: 6, tone: 'interval' },
      ];
  const breaks = sourceBreaks.map(item => ({
    ...item,
    label: item.id === 'interval1' && (!item.label || item.label === 'Interval') ? 'Interval-1' : item.id === 'interval2' && (!item.label || item.label === 'Interval') ? 'Interval-2' : item.label || (item.id === 'lunch' ? 'Lunch' : 'Interval'),
    afterPeriod: Math.min(Math.max(Number(item.afterPeriod) || 1, 1), periodCount),
    tone: item.id === 'lunch' ? 'lunch' : 'interval',
  })) as TimetableBreak[];
  const interval1 = breaks.find(item => item.id === 'interval1')?.label || 'Interval-1';
  const lunch = breaks.find(item => item.id === 'lunch')?.label || 'Lunch';
  const interval2 = breaks.find(item => item.id === 'interval2')?.label || 'Interval-2';

  return {
    ...data,
    breaks,
    breakAfterPeriod2: interval1,
    lunchAfterPeriod4: lunch,
    breakAfterPeriod6: interval2,
  };
}

export function readTimetable() {
  if (typeof window === 'undefined') return defaultTimetable;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(TIMETABLE_STORAGE_KEY) ?? '') as TimetableData;
    return parsed?.days?.length ? normalizeTimetable(parsed) : defaultTimetable;
  } catch {
    return defaultTimetable;
  }
}

export function writeTimetable(data: TimetableData) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TIMETABLE_STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event('safereach-timetable-updated'));
}
