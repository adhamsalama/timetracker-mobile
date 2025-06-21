import React from 'react';
import { View, Text } from 'react-native';
import { TimelineEntry } from '../types';
import { formatDuration } from '../utils/utils';
import { styles } from '../styles';

interface TimelineProps {
  entries: TimelineEntry[];
}

const Timeline: React.FC<TimelineProps> = ({ entries }) => {
  return (
    <>
      <Text style={{ fontSize: 18, marginVertical: 16, textAlign: "center" }}>📊 Timeline</Text>
      {entries.map((item, i) => (
        <View
          key={i}
          style={[
            styles.timelineItem,
            item.isIdle ? styles.timelineIdle : styles.timelineActive
          ]}
        >
          <View>
            <Text style={{ fontWeight: 'bold' }}>{item.taskName}</Text>
            <Text style={{ fontSize: 12 }}>
              {new Date(item.start).toLocaleTimeString()} – {new Date(item.end).toLocaleTimeString()}
            </Text>
          </View>
          <Text
            style={[
              styles.timelineBadge,
              item.isIdle
                ? styles.badgeIdle
                : item.exceeded
                  ? styles.badgeExceeded
                  : styles.badgeNormal
            ]}
          >
            {formatDuration(item.end - item.start)}
          </Text>
        </View>
      ))}
    </>
  );
};

export default Timeline;
