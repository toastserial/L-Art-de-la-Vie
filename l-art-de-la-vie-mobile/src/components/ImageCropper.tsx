import { MaterialCommunityIcons } from "@expo/vector-icons";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, PanResponder, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme";

export interface CropSource {
  uri: string;
  width: number;
  height: number;
}

export interface CroppedImage {
  uri: string;
  width: number;
  height: number;
  mimeType: "image/jpeg";
  fileName: string;
}

interface Props {
  source: CropSource | null;
  onCancel(): void;
  onConfirm(image: CroppedImage): void;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function ImageCropper({ source, onCancel, onConfirm }: Props) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const viewport = Math.floor(Math.min(screenWidth - 32, screenHeight * 0.48, 420));
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const offsetRef = useRef(offset);
  const dragStart = useRef(offset);

  const baseScale = source ? Math.max(viewport / source.width, viewport / source.height) : 1;
  const imageWidth = source ? source.width * baseScale * zoom : viewport;
  const imageHeight = source ? source.height * baseScale * zoom : viewport;
  const limitX = Math.max(0, (imageWidth - viewport) / 2);
  const limitY = Math.max(0, (imageHeight - viewport) / 2);

  const updateOffset = (next: { x: number; y: number }) => {
    const safe = { x: clamp(next.x, -limitX, limitX), y: clamp(next.y, -limitY, limitY) };
    offsetRef.current = safe;
    setOffset(safe);
  };

  useEffect(() => {
    setZoom(1);
    offsetRef.current = { x: 0, y: 0 };
    setOffset({ x: 0, y: 0 });
    setBusy(false);
  }, [source?.uri]);

  useEffect(() => {
    updateOffset(offsetRef.current);
  // Los límites cambian al ajustar el zoom y deben volver a limitar el desplazamiento.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, viewport]);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => { dragStart.current = offsetRef.current; },
    onPanResponderMove: (_event, gesture) => updateOffset({ x: dragStart.current.x + gesture.dx, y: dragStart.current.y + gesture.dy }),
  // PanResponder se recrea cuando cambian los límites del encuadre.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [limitX, limitY]);

  const changeZoom = (amount: number) => setZoom(current => Math.round(clamp(current + amount, 1, 3) * 10) / 10);

  const crop = async () => {
    if (!source || busy) return;
    setBusy(true);
    try {
      const scale = baseScale * zoom;
      const left = (viewport - source.width * scale) / 2 + offset.x;
      const top = (viewport - source.height * scale) / 2 + offset.y;
      const cropSize = Math.min(viewport / scale, source.width, source.height);
      const originX = clamp(-left / scale, 0, source.width - cropSize);
      const originY = clamp(-top / scale, 0, source.height - cropSize);
      const cropPixels = Math.max(1, Math.min(Math.round(cropSize), source.width, source.height));
      const cropX = Math.max(0, Math.min(Math.round(originX), source.width - cropPixels));
      const cropY = Math.max(0, Math.min(Math.round(originY), source.height - cropPixels));
      const outputSize = Math.min(1200, cropPixels);
      const result = await manipulateAsync(source.uri, [
        { crop: { originX: cropX, originY: cropY, width: cropPixels, height: cropPixels } },
        { resize: { width: outputSize, height: outputSize } },
      ], { compress: 0.78, format: SaveFormat.JPEG });
      onConfirm({ uri: result.uri, width: result.width, height: result.height, mimeType: "image/jpeg", fileName: `producto-${Date.now()}.jpg` });
    } catch {
      Alert.alert("No se pudo recortar", "Prueba seleccionando otra fotografía.");
    } finally {
      setBusy(false);
    }
  };

  return <Modal visible={!!source} animationType="fade" presentationStyle="fullScreen" onRequestClose={busy ? undefined : onCancel}>
    <SafeAreaView style={styles.safe} edges={["top", "bottom", "left", "right"]}>
      <StatusBar style="light" backgroundColor={styles.safe.backgroundColor} />
      <View style={styles.header}>
        <Pressable onPress={onCancel} disabled={busy} style={styles.headerButton} hitSlop={8}><MaterialCommunityIcons name="close" size={25} color="#FFFFFF" /></Pressable>
        <View style={styles.headerText}><Text style={styles.title}>Encuadrar producto</Text><Text style={styles.subtitle}>Arrastra la foto dentro del cuadro</Text></View>
        <Pressable onPress={crop} disabled={busy} style={[styles.confirm, busy && styles.disabled]}>
          {busy ? <ActivityIndicator size="small" color={colors.forest} /> : <Text style={styles.confirmText}>Listo</Text>}
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={[styles.viewport, { width: viewport, height: viewport }]} {...panResponder.panHandlers}>
          {source && <Image source={{ uri: source.uri }} resizeMode="stretch" style={{ position: "absolute", width: imageWidth, height: imageHeight, left: (viewport - imageWidth) / 2 + offset.x, top: (viewport - imageHeight) / 2 + offset.y }} />}
          <View pointerEvents="none" style={styles.cropOverlay}>
            <View style={[styles.gridVertical, { left: "33.333%" }]} /><View style={[styles.gridVertical, { left: "66.666%" }]} />
            <View style={[styles.gridHorizontal, { top: "33.333%" }]} /><View style={[styles.gridHorizontal, { top: "66.666%" }]} />
            <View style={[styles.corner, styles.topLeft]} /><View style={[styles.corner, styles.topRight]} /><View style={[styles.corner, styles.bottomLeft]} /><View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        <View style={styles.controls}>
          <Pressable onPress={() => changeZoom(-0.2)} disabled={zoom <= 1 || busy} style={[styles.zoomButton, zoom <= 1 && styles.disabled]}><MaterialCommunityIcons name="minus" size={22} color="#FFFFFF" /></Pressable>
          <View style={styles.zoomInfo}><MaterialCommunityIcons name="magnify" size={19} color="#C8D0CB" /><Text style={styles.zoomText}>{Math.round(zoom * 100)}%</Text></View>
          <Pressable onPress={() => changeZoom(0.2)} disabled={zoom >= 3 || busy} style={[styles.zoomButton, zoom >= 3 && styles.disabled]}><MaterialCommunityIcons name="plus" size={22} color="#FFFFFF" /></Pressable>
        </View>
        <Pressable onPress={() => { setZoom(1); updateOffset({ x: 0, y: 0 }); }} disabled={busy} style={styles.reset}><MaterialCommunityIcons name="restore" size={18} color="#DDE4DF" /><Text style={styles.resetText}>Restablecer encuadre</Text></Pressable>
      </View>
    </SafeAreaView>
  </Modal>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#101512" },
  header: { minHeight: 70, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: "#27312B" },
  headerButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#242C27", alignItems: "center", justifyContent: "center" },
  headerText: { flex: 1 }, title: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" }, subtitle: { color: "#AEB8B1", fontSize: 10, marginTop: 3 },
  confirm: { minWidth: 62, height: 40, borderRadius: 13, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", paddingHorizontal: 14 }, confirmText: { color: colors.forest, fontWeight: "900", fontSize: 13 }, disabled: { opacity: 0.35 },
  content: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16, paddingBottom: 18 },
  viewport: { overflow: "hidden", backgroundColor: "#050706", borderRadius: 3, borderWidth: 2, borderColor: "#FFFFFF" },
  cropOverlay: { ...StyleSheet.absoluteFillObject },
  gridVertical: { position: "absolute", top: 0, bottom: 0, width: StyleSheet.hairlineWidth, backgroundColor: "rgba(255,255,255,0.48)" },
  gridHorizontal: { position: "absolute", left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: "rgba(255,255,255,0.48)" },
  corner: { position: "absolute", width: 24, height: 24, borderColor: "#FFFFFF" }, topLeft: { left: 7, top: 7, borderLeftWidth: 3, borderTopWidth: 3 }, topRight: { right: 7, top: 7, borderRightWidth: 3, borderTopWidth: 3 }, bottomLeft: { left: 7, bottom: 7, borderLeftWidth: 3, borderBottomWidth: 3 }, bottomRight: { right: 7, bottom: 7, borderRightWidth: 3, borderBottomWidth: 3 },
  controls: { marginTop: 26, flexDirection: "row", alignItems: "center", gap: 18 },
  zoomButton: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#29332D", alignItems: "center", justifyContent: "center" },
  zoomInfo: { minWidth: 94, height: 46, borderRadius: 15, backgroundColor: "#1B221E", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 }, zoomText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  reset: { marginTop: 18, flexDirection: "row", alignItems: "center", gap: 7, padding: 10 }, resetText: { color: "#DDE4DF", fontSize: 12, fontWeight: "700" },
});
