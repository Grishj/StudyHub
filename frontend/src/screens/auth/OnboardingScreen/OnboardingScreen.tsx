import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../../types/navigation.types";
import { SafeAreaWrapper } from "@components/layout/SafeArea/SafeAreaWrapper";
import { PrimaryButton } from "@components/common/Button/PrimaryButton";
import { useTheme } from "@hooks/useTheme";

const { width } = Dimensions.get("window");

type Props = NativeStackScreenProps<AuthStackParamList, "Onboarding">;

interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  image: any;
}

const onboardingData: OnboardingItem[] = [
  {
    id: "1",
    title: "Welcome to PSC Study",
    description:
      "Your complete guide to PSC exam preparation with quality resources",
    image: require("../../../../assets/images/onboarding1.png"), // Add your images
  },
  {
    id: "2",
    title: "Learn Together",
    description:
      "Join study groups, collaborate with peers, and share knowledge",
    image: require("../../../../assets/images/onboarding1.png"),
  },
  {
    id: "3",
    title: "AI-Powered Learning",
    description: "Get personalized study recommendations and AI assistance",
    image: require("../../../../assets/images/onboarding1.png"),
  },
];

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      navigation.navigate("Login");
    }
  };

  const handleSkip = () => {
    navigation.navigate("Login");
  };

  const renderItem = ({ item }: { item: OnboardingItem }) => (
    <View style={[styles.slide, { width }]}>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} resizeMode="contain" />
      </View>
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.text,
              fontSize: theme.typography.fontSize["3xl"],
              fontWeight: theme.typography.fontWeight.bold,
            },
          ]}
        >
          {item.title}
        </Text>
        <Text
          style={[
            styles.description,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.typography.fontSize.base,
              lineHeight: theme.typography.fontSize.base * 1.5,
            },
          ]}
        >
          {item.description}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={onboardingData}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentIndex(index);
          }}
        />

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === currentIndex
                      ? theme.colors.primary
                      : theme.colors.border,
                  width: index === currentIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={[styles.buttonContainer, { padding: theme.spacing.md }]}>
          <PrimaryButton
            title={
              currentIndex === onboardingData.length - 1
                ? "Get Started"
                : "Next"
            }
            onPress={handleNext}
            fullWidth
          />
          <PrimaryButton
            title="Skip"
            onPress={handleSkip}
            variant="secondary"
            fullWidth
            style={{ marginTop: theme.spacing.sm }}
          />
        </View>
      </View>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    flex: 0.6,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
  },
  textContainer: {
    flex: 0.4,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    textAlign: "center",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
