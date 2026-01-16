export function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

export function generateCalendarGrid(year: number, month: number) {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];

    // Padding for previous month
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    return days;
}

export const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
