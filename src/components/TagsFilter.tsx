import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { formatDuration } from '../utils/utils';
import { Task } from '../types';

interface TagFilterProps {
  allTags: string[];
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
  tasks: Task[];
  now: number;
  getTotalTimeForTag: (tasks: Task[], tag: string, now: number) => number;
}

const TagFilter: React.FC<TagFilterProps> = ({
  allTags,
  selectedTag,
  onTagSelect,
  tasks,
  now,
  getTotalTimeForTag
}) => {
  if (allTags.length === 0) {
    return null;
  }

  return (
    <View style={{ marginVertical: 10 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Filter by Tag:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => onTagSelect(null)}
            style={{
              backgroundColor: selectedTag === null ? '#007bff' : '#e0e0e0',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 15,
              marginRight: 8,
            }}
          >
            <Text style={{
              color: selectedTag === null ? 'white' : '#333',
              fontSize: 12,
              fontWeight: 'bold'
            }}>
              All
            </Text>
          </TouchableOpacity>
          {allTags.map((tag, index) => {
            const tagTime = getTotalTimeForTag(tasks, tag, now);
            return (
              <TouchableOpacity
                key={index}
                onPress={() => onTagSelect(selectedTag === tag ? null : tag)}
                style={{
                  backgroundColor: selectedTag === tag ? '#007bff' : '#e0e0e0',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 15,
                  marginRight: 8,
                }}
              >
                <Text style={{
                  color: selectedTag === tag ? 'white' : '#333',
                  fontSize: 12,
                  fontWeight: 'bold'
                }}>
                  {tag} • {formatDuration(tagTime)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default TagFilter;
