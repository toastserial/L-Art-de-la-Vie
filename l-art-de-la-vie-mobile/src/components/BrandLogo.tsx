import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

interface BrandLogoProps {
  size?: number;
  animated?: boolean;
}

export function BrandLogo({ size = 140, animated = true }: BrandLogoProps) {
  const opacity = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const translateY = useRef(new Animated.Value(animated ? 22 : 0)).current;
  const scale = useRef(new Animated.Value(animated ? 0.78 : 1)).current;

  useEffect(() => {
    if (!animated) return;
    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 650, easing: Easing.out(Easing.back(1.15)), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 650, easing: Easing.out(Easing.back(1.15)), useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.045, duration: 240, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ]);
    animation.start();
    return () => animation.stop();
  }, [animated, opacity, scale, translateY]);

  return <View style={[styles.shadow, { width: size, height: size, borderRadius: size / 2 }]}>
    <Animated.Image
      source={require("../../assets/lartdela.png")}
      resizeMode="contain"
      style={{ width: size, height: size, opacity, transform: [{ translateY }, { scale }] }}
      accessibilityLabel="Logo de L'Art de la Vie"
    />
  </View>;
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#021B0D",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
});
