import { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from "react-native";

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
    let mounted = true;
    let animation: Animated.CompositeAnimation | undefined;
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!mounted) return;
      if (reduceMotion) {
        opacity.setValue(1);
        translateY.setValue(0);
        scale.setValue(1);
        return;
      }
      animation = Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 360, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 360, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]);
      animation.start();
    });
    return () => { mounted = false; animation?.stop(); };
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
