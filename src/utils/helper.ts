export const formatDate = (date: Date) => date.toISOString().split("T")[0];

export const buildWeekRanges = () => {
  const weeks: { weekStart: Date; weekEnd: Date; week: string }[] = [];

  const today = new Date();
  const latestCompletedDay = new Date(today);
  latestCompletedDay.setDate(today.getDate() - 1);

  for (let i = 12; i >= 0; i--) {
    const weekEnd = new Date(latestCompletedDay);
    weekEnd.setDate(latestCompletedDay.getDate() - i * 7);

    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);

    const start = new Date(weekStart);
    start.setHours(0, 0, 0, 0);

    const end = new Date(weekEnd);
    end.setHours(23, 59, 59, 999);

    weeks.push({
      weekStart: start,
      weekEnd: end,
      week: `${formatDate(start)} to ${formatDate(end)}`,
    });
  }

  return weeks;
};

export const getLastWorkingDay = () => {
  const today = new Date();
  const lastWorkingDate = new Date(today);

  if (today.getDay() === 1) {
    lastWorkingDate.setDate(today.getDate() - 3);
  } else if (today.getDay() === 0) {
    lastWorkingDate.setDate(today.getDate() - 2);
  } else {
    lastWorkingDate.setDate(today.getDate() - 1);
  }

  lastWorkingDate.setHours(0, 0, 0, 0);
  return lastWorkingDate;
};
