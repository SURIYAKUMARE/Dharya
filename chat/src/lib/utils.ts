import { format, isToday, isYesterday, differenceInMinutes, parseISO } from 'date-fns';

export function formatMessageTime(iso: string): string {
  return format(parseISO(iso), 'HH:mm');
}

export function formatDayHeader(iso: string): string {
  const d = parseISO(iso);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMMM d, yyyy');
}

export function formatLastSeen(iso: string | null): string {
  if (!iso) return 'last seen a while ago';
  const d = parseISO(iso);
  const mins = differenceInMinutes(new Date(), d);
  if (mins < 1) return 'just now';
  if (mins < 60) return `last seen ${mins}m ago`;
  if (isToday(d)) return `last seen today at ${format(d, 'HH:mm')}`;
  if (isYesterday(d)) return `last seen yesterday at ${format(d, 'HH:mm')}`;
  return `last seen ${format(d, 'MMM d')}`;
}

export function canEditMessage(createdAt: string): boolean {
  return differenceInMinutes(new Date(), parseISO(createdAt)) < 15;
}

export function groupMessagesByDay(messages: { created_at: string }[]) {
  const groups: { day: string; messages: typeof messages }[] = [];
  let current = '';
  for (const msg of messages) {
    const day = formatDayHeader(msg.created_at);
    if (day !== current) {
      groups.push({ day, messages: [] });
      current = day;
    }
    groups[groups.length - 1].messages.push(msg);
  }
  return groups;
}
