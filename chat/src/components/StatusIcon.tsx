import { View } from 'react-native';
import { Check, CheckCheck, Clock } from 'lucide-react-native';
import { MessageStatus } from '../types';
import { Colors } from '../lib/colors';

interface Props {
  status: MessageStatus;
  theme?: 'dark' | 'light';
  size?: number;
}

export function StatusIcon({ status, theme = 'dark', size = 14 }: Props) {
  const C = Colors[theme];

  switch (status) {
    case 'sending':   return <Clock       size={size} color={C.statusSent}      strokeWidth={2} />;
    case 'sent':      return <Check       size={size} color={C.statusSent}      strokeWidth={2.5} />;
    case 'delivered': return <CheckCheck  size={size} color={C.statusDelivered} strokeWidth={2.5} />;
    case 'read':
    default:
      return (
        <View>
          <CheckCheck size={size} color={C.statusRead} strokeWidth={2.5} />
        </View>
      );
  }
}
