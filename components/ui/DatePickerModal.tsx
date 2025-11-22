import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Calendar, X, ChevronLeft, ChevronRight } from '@tamagui/lucide-icons';

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
  initialDate?: string;
  minimumDate?: string;
  title?: string;
}

export default function DatePickerModal({
  visible,
  onClose,
  onSelect,
  initialDate,
  minimumDate,
  title = 'Select Date',
}: DatePickerModalProps) {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());

  useEffect(() => {
    if (initialDate) {
      const date = new Date(initialDate);
      setSelectedYear(date.getFullYear());
      setSelectedMonth(date.getMonth());
      setSelectedDay(date.getDate());
    } else {
      const today = new Date();
      setSelectedYear(today.getFullYear());
      setSelectedMonth(today.getMonth());
      setSelectedDay(today.getDate());
    }
  }, [initialDate, visible]);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleDaySelect = (day: number) => {
    const dateString = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Check if date is before minimum date
    if (minimumDate) {
      const minDate = new Date(minimumDate);
      const selectedDate = new Date(dateString);
      if (selectedDate < minDate) {
        return; // Don't allow selection
      }
    }
    
    setSelectedDay(day);
    onSelect(dateString);
    onClose();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
    const days: (number | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    const weeks: (number | null)[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks;
  };

  const isDateDisabled = (day: number | null) => {
    if (!day || !minimumDate) return false;
    
    const dateString = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const minDate = new Date(minimumDate);
    const checkDate = new Date(dateString);
    
    return checkDate < minDate;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Calendar size={24} color="#4D7EA8" />
              <Text style={styles.modalTitle}>{title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Month/Year Navigation */}
          <View style={styles.monthNavigation}>
            <TouchableOpacity onPress={handlePreviousMonth} style={styles.navButton}>
              <ChevronLeft size={24} color="#4D7EA8" />
            </TouchableOpacity>
            <Text style={styles.monthYearText}>
              {monthNames[selectedMonth]} {selectedYear}
            </Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
              <ChevronRight size={24} color="#4D7EA8" />
            </TouchableOpacity>
          </View>

          {/* Day Names */}
          <View style={styles.dayNamesContainer}>
            {dayNames.map((day) => (
              <Text key={day} style={styles.dayName}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <ScrollView style={styles.calendarScroll} showsVerticalScrollIndicator={false}>
            {renderCalendar().map((week, weekIndex) => (
              <View key={weekIndex} style={styles.weekRow}>
                {week.map((day, dayIndex) => {
                  const disabled = isDateDisabled(day);
                  const isSelected = day === selectedDay;
                  
                  return (
                    <TouchableOpacity
                      key={dayIndex}
                      style={[
                        styles.dayCell,
                        !day && styles.emptyCell,
                        isSelected && styles.selectedDay,
                        disabled && styles.disabledDay,
                      ]}
                      onPress={() => day && !disabled && handleDaySelect(day)}
                      disabled={!day || disabled}
                    >
                      {day && (
                        <Text
                          style={[
                            styles.dayText,
                            isSelected && styles.selectedDayText,
                            disabled && styles.disabledDayText,
                          ]}
                        >
                          {day}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#272932',
  },
  closeButton: {
    padding: 4,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#272932',
  },
  dayNamesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  calendarScroll: {
    maxHeight: 300,
  },
  weekRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 8,
  },
  emptyCell: {
    backgroundColor: 'transparent',
  },
  selectedDay: {
    backgroundColor: '#4D7EA8',
  },
  disabledDay: {
    backgroundColor: '#F1F5F9',
  },
  dayText: {
    fontSize: 16,
    color: '#272932',
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#FFF',
    fontWeight: '700',
  },
  disabledDayText: {
    color: '#CBD5E1',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
});
