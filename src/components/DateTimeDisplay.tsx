// Real-time date and time display

import { formatDate, formatTime } from "../lib/date-utils";

interface DateTimeDisplayProps {
  currentTime: Date;
}

export function DateTimeDisplay({ currentTime }: DateTimeDisplayProps) {
  return (
    <div className="mb-8">
      {/* Date and Time */}
      <div 
        style={{
          color: '#181717',
          fontFamily: 'Lexend Deca, sans-serif',
          fontSize: '36px',
          fontWeight: 800,
          lineHeight: '125.094%',
          letterSpacing: '0.28px',
          textAlign: 'center'
        }}
      >
        {formatDate(currentTime)}
      </div>
      <div 
        style={{
          color: '#181717',
          fontFamily: 'Lexend Deca, sans-serif',
          fontSize: '32px',
          fontWeight: 800,
          lineHeight: '125.094%',
          letterSpacing: '0.28px',
          textAlign: 'center'
        }}
      >
        {formatTime(currentTime)}
      </div>
    </div>
  );
}
