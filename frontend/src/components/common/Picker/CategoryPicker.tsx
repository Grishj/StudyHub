// src/components/common/Picker/CategoryPicker.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { spacing} from '../../../styles/spacing'
import { typography } from '../../../styles/typography';
interface CategoryPickerProps {
  visible: boolean;
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
  onClose: () => void;
  title?: string;
  placeholder?: string;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  visible,
  categories,
  selectedCategory,
  onSelect,
  onClose,
  title = 'Category',
  placeholder = 'Select a category...',
}) => {
  const { colors } = useTheme();

  const handleSelect = (category: string) => {
    onSelect(category);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[styles.modalContent, { backgroundColor: colors.surface }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: colors.border },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Text
                style={[styles.modalCloseText, { color: colors.textSecondary }]}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.categoryList}>
            <Text
              style={[styles.categoryListTitle, { color: colors.textSecondary }]}
            >
              {placeholder}
            </Text>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryItem,
                  {
                    backgroundColor:
                      selectedCategory === category
                        ? colors.primaryLight + '20'
                        : 'transparent',
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => handleSelect(category)}
              >
                <Text
                  style={[
                    styles.categoryItemText,
                    {
                      color:
                        selectedCategory === category
                          ? colors.primary
                          : colors.text,
                      fontWeight:
                        selectedCategory === category
                          ? typography.fontWeight.semibold
                          : typography.fontWeight.regular,
                    },
                  ]}
                >
                  {category}
                </Text>
                {selectedCategory === category && (
                  <Text style={[styles.checkMark, { color: colors.primary }]}>
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
  modalCloseText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
  },
  categoryList: {
    maxHeight: 400,
  },
  categoryListTitle: {
    fontSize: typography.fontSize.sm,
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md + spacing.xs,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  categoryItemText: {
    fontSize: typography.fontSize.base,
    flex: 1,
  },
  checkMark: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginLeft: spacing.sm,
  },
});