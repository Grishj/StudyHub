// GroupChatScreen.tsx - Fully Fixed Version
import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Modal,
  Keyboard,
  Alert,
  TouchableWithoutFeedback,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import { GroupsStackScreenProps } from "../../types/navigation.types";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface Message {
  id: string;
  text?: string;
  sender: string;
  senderAvatar: string;
  timestamp: Date;
  isOwn: boolean;
  type: "text" | "image" | "file" | "voice";
  status: "sending" | "sent" | "delivered" | "read";
  replyTo?: Message;
}

const GroupChatScreen = ({
  navigation,
  route,
}: GroupsStackScreenProps<"GroupChat">) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { groupId, groupName } = route.params;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showGroupOptions, setShowGroupOptions] = useState(false); // ✅ New state

  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  // Sample messages
  useEffect(() => {
    const sampleMessages: Message[] = [
      {
        id: "1",
        text: "Hey everyone! Ready for today's study session?",
        sender: "John Doe",
        senderAvatar: "👤",
        timestamp: new Date(Date.now() - 3600000),
        isOwn: false,
        type: "text",
        status: "read",
      },
      {
        id: "2",
        text: "Yes! I've prepared notes on Database Management",
        sender: "You",
        senderAvatar: "👤",
        timestamp: new Date(Date.now() - 3000000),
        isOwn: true,
        type: "text",
        status: "read",
      },
    ];
    setMessages(sampleMessages);
  }, []);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      sender: "You",
      senderAvatar: "👤",
      timestamp: new Date(),
      isOwn: true,
      type: "text",
      status: "sending",
      replyTo: replyingTo || undefined,
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
    setReplyingTo(null);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "sent" } : msg
        )
      );
    }, 500);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isFirstInGroup =
      index === 0 || messages[index - 1]?.sender !== item.sender;

    return (
      <Animated.View
        style={[
          styles.messageWrapper,
          item.isOwn ? styles.ownMessageWrapper : styles.otherMessageWrapper,
        ]}
      >
        {!item.isOwn && isFirstInGroup && (
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>{item.senderAvatar}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.messageBubble,
            item.isOwn ? styles.ownBubble : styles.otherBubble,
            { backgroundColor: item.isOwn ? colors.primary : colors.surface },
          ]}
          onLongPress={() => handleMessageLongPress(item)}
          activeOpacity={0.7}
        >
          {!item.isOwn && isFirstInGroup && (
            <Text style={[styles.senderName, { color: colors.primary }]}>
              {item.sender}
            </Text>
          )}

          {item.replyTo && (
            <View
              style={[
                styles.replyContainer,
                { backgroundColor: colors.background + "40" },
              ]}
            >
              <View
                style={[
                  styles.replyBorder,
                  { backgroundColor: colors.primary },
                ]}
              />
              <View style={styles.replyContent}>
                <Text style={[styles.replyName, { color: colors.primary }]}>
                  {item.replyTo.sender}
                </Text>
                <Text
                  style={[styles.replyText, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {item.replyTo.text}
                </Text>
              </View>
            </View>
          )}

          <Text
            style={[
              styles.messageText,
              { color: item.isOwn ? "#FFFFFF" : colors.text },
            ]}
          >
            {item.text}
          </Text>

          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.timestamp,
                { color: item.isOwn ? "#FFFFFF80" : colors.textTertiary },
              ]}
            >
              {item.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            {item.isOwn && (
              <Ionicons
                name={
                  item.status === "read"
                    ? "checkmark-done"
                    : item.status === "delivered"
                    ? "checkmark-done"
                    : item.status === "sent"
                    ? "checkmark"
                    : "time-outline"
                }
                size={16}
                color={item.status === "read" ? "#4FC3F7" : "#FFFFFF80"}
              />
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const handleMessageLongPress = (message: Message) => {
    setReplyingTo(message);
    inputRef.current?.focus();
  };

  // ✅ Handle group options (mute, leave, etc.)
  const handleGroupOptionPress = (option: string) => {
    setShowGroupOptions(false);
    switch (option) {
      case "mute":
        Alert.alert("Muted", `You've muted ${groupName}`);
        break;
      case "leave":
        Alert.alert(
          "Leave Group",
          `Are you sure you want to leave ${groupName}?`,
          [
            { text: "Cancel", style: "cancel" },
            { text: "Leave", style: "destructive", onPress: () => navigation.goBack() },
          ]
        );
        break;
      case "info":
        navigation.navigate("GroupDetail", { groupId, groupData: null });
        break;
    }
  };

  // ✅ Compute correct keyboardVerticalOffset
  const getKeyboardVerticalOffset = () => {
    return Platform.OS === "ios"
      ? 64 + insets.top // header height + safe area
      : 0; // Android usually doesn't need offset with behavior="height"
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={["top"]} style={{ backgroundColor: colors.surface }}>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {groupName}
            </Text>
            <Text
              style={[styles.headerSubtitle, { color: colors.textSecondary }]}
            >
              {isTyping ? "Someone is typing..." : "12 members online"}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="videocam" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="call" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowGroupOptions(true)} // ✅ Open menu
            >
              <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* ✅ Wrap FlatList + Input in KeyboardAvoidingView */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={getKeyboardVerticalOffset()}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.messagesList,
            { paddingBottom: 20 },
          ]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
        />

        {replyingTo && (
          <View
            style={[styles.replyPreview, { backgroundColor: colors.surface }]}
          >
            <View style={styles.replyPreviewContent}>
              <View
                style={[styles.replyBorder, { backgroundColor: colors.primary }]}
              />
              <View style={styles.replyInfo}>
                <Text style={[styles.replyToName, { color: colors.primary }]}>
                  Replying to {replyingTo.sender}
                </Text>
                <Text
                  style={[styles.replyToText, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {replyingTo.text}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setReplyingTo(null)}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.surface,
              paddingBottom: Platform.OS === "ios"
                ? Math.max(insets.bottom, spacing.sm)
                : spacing.sm,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => setShowActions(true)}
          >
            <Ionicons name="attach" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <TextInput
              ref={inputRef}
              style={[styles.input, { color: colors.text }]}
              placeholder="Type a message..."
              placeholderTextColor={colors.textTertiary}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={1000}
              textAlignVertical="center"
            />
            <TouchableOpacity style={styles.emojiButton}>
              <Text style={styles.emojiIcon}>😊</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: message.trim()
                  ? colors.primary
                  : colors.border,
              },
            ]}
            onPress={handleSend}
            disabled={!message.trim()}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Attachment Modal */}
      <Modal
        visible={showActions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActions(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowActions(false)}>
          <View style={styles.modalOverlay}>
            <View
              style={[styles.actionsContainer, { backgroundColor: colors.surface }]}
            >
              <View style={styles.actionsGrid}>
                {[
                  { icon: "camera", label: "Camera", color: "#4CAF50" },
                  { icon: "images", label: "Gallery", color: "#2196F3" },
                  { icon: "document", label: "Document", color: "#FF9800" },
                  { icon: "mic", label: "Voice", color: "#9C27B0" },
                ].map((action) => (
                  <TouchableOpacity
                    key={action.label}
                    style={styles.actionButton}
                    onPress={() => {
                      setShowActions(false);
                      // TODO: Implement attachment logic
                    }}
                  >
                    <View
                      style={[styles.actionIcon, { backgroundColor: action.color + "20" }]}
                    >
                      <Ionicons name={action.icon as any} size={24} color={action.color} />
                    </View>
                    <Text style={[styles.actionLabel, { color: colors.text }]}>
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ✅ Group Options Modal */}
      <Modal
        visible={showGroupOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGroupOptions(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowGroupOptions(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.optionsMenu, { backgroundColor: colors.surface }]}>
              {[
                { key: "info", label: "Group Info", icon: "information-circle" },
                { key: "mute", label: "Mute Notifications", icon: "notifications-off" },
                { key: "leave", label: "Leave Group", icon: "log-out", destructive: true },
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={styles.optionItem}
                  onPress={() => handleGroupOptionPress(item.key)}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={item.destructive ? colors.error : colors.text}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      { color: item.destructive ? colors.error : colors.text },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  headerButton: {
    padding: spacing.xs,
  },
  messagesList: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  messageWrapper: {
    marginBottom: spacing.xs,
  },
  ownMessageWrapper: {
    alignItems: "flex-end",
  },
  otherMessageWrapper: {
    alignItems: "flex-start",
    flexDirection: "row",
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: spacing.xs,
    marginTop: spacing.xs,
  },
  avatar: {
    fontSize: typography.fontSize.lg,
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  ownBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs / 2,
  },
  messageText: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.fontSize.base * 1.4,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs / 2,
  },
  timestamp: {
    fontSize: typography.fontSize.xs - 1,
  },
  replyContainer: {
    borderRadius: 8,
    padding: spacing.xs,
    marginBottom: spacing.xs,
    flexDirection: "row",
  },
  replyBorder: {
    width: 3,
    borderRadius: 2,
    marginRight: spacing.xs,
  },
  replyContent: {
    flex: 1,
  },
  replyName: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  replyText: {
    fontSize: typography.fontSize.xs,
  },
  replyPreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  replyPreviewContent: {
    flex: 1,
    flexDirection: "row",
  },
  replyInfo: {
    flex: 1,
  },
  replyToName: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  replyToText: {
    fontSize: typography.fontSize.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  attachButton: {
    padding: spacing.xs,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === "ios" ? spacing.xs : 0,
    minHeight: 40,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    paddingVertical: Platform.OS === "ios" ? spacing.xs : spacing.sm,
    minHeight: Platform.OS === "ios" ? 24 : 40,
    maxHeight: 120,
  },
  emojiButton: {
    padding: spacing.xs,
    justifyContent: "center",
  },
  emojiIcon: {
    fontSize: typography.fontSize.xl,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  actionsContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: spacing.lg,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.lg,
  },
  actionButton: {
    width: "25%",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  actionLabel: {
    fontSize: typography.fontSize.xs,
  },
  // ✅ New styles for options menu
  optionsMenu: {
    marginHorizontal: spacing.lg,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 40,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.sm,
  },
  optionText: {
    fontSize: typography.fontSize.base,
    flex: 1,
  },
});

export default GroupChatScreen;