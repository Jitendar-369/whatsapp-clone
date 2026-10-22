// Spring sends LocalDateTime without a zone ("2026-10-22T15:20:11.12"),
// which the browser reads as local time - the same clock the server uses locally.
export const toDate = (timestamp) => (timestamp ? new Date(timestamp) : null);

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const formatTime = (timestamp) => {
  const d = toDate(timestamp);
  return d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
};

// Chat list: time for today, "Yesterday", otherwise the date
export const formatListTime = (timestamp) => {
  const d = toDate(timestamp);
  if (!d) return '';
  const now = new Date();
  if (sameDay(d, now)) return formatTime(timestamp);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString();
};

// Separator label between days inside a conversation
export const formatDayLabel = (timestamp) => {
  const d = toDate(timestamp);
  if (!d) return '';
  const now = new Date();
  if (sameDay(d, now)) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });
};

export const dayKey = (timestamp) => {
  const d = toDate(timestamp);
  return d ? d.toDateString() : '';
};

// Direct chats are named after the other person; groups use their own name
export const roomTitle = (room, me) => {
  if (!room) return '';
  if (room.direct) {
    const other = room.members?.find((m) => m.id !== me?.id);
    return other?.username ?? 'Unknown';
  }
  return room.name;
};

export const otherMember = (room, me) => room?.members?.find((m) => m.id !== me?.id);
