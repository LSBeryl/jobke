export default function makeCalendar(month) {
  const date = new Date();
  const temp = [[], [], [], [], [], []];
  for (let i = 0; i < 6; i++) for (let j = 0; j < 7; j++) temp[i][j] = null;
  let tempDay = 1;
  let tempWeek = 0;
  const firstDay = new Date(date.getFullYear(), month - 1, 1).getDay();
  const lastDay = new Date(date.getFullYear(), month, 0).getDate();
  for (let i = 0; i < firstDay; i++) temp[tempWeek][i] = null;
  for (let i = firstDay; i < 7; i++) temp[tempWeek][i] = tempDay++;
  tempWeek++;
  for (let i = 1; i <= 5; i++) {
    for (let j = 0; j < 7; j++) {
      temp[tempWeek][j] = tempDay++;
      if (tempDay > lastDay) break;
    }
    tempWeek++;
    if (tempDay > lastDay) break;
  }
  return temp;
}
