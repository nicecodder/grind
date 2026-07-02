import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import { useApp } from '../context/AppContext';
import { Theme } from '../components/Theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import Svg, { Circle, Path } from 'react-native-svg';

export const ScannerScreen: React.FC = () => {
  const { state, selectPreset, startScanSimulation, showToast } = useApp();
  
  // Local state for calculated ratings to persist them until next scan
  const [scanResult, setScanResult] = useState<{
    name: string;
    symmetry: string;
    rating: string;
    rank: string;
  } | null>(null);

  // Laser animation value
  const [laserVal] = useState(new Animated.Value(0));

  // Pulse animation for loading
  const [pulseVal] = useState(new Animated.Value(1));

  useEffect(() => {
    if (state.isScanning) {
      // Loop laser animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(laserVal, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(laserVal, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          })
        ])
      ).start();

      // Loop pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseVal, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseVal, {
            toValue: 0.8,
            duration: 500,
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      laserVal.setValue(0);
      pulseVal.setValue(1);
    }
  }, [state.isScanning]);

  // Generate results when scanning completes
  useEffect(() => {
    if (state.hasScanned && !state.isScanning) {
      const preset = state.selectedPreset;
      let name = '';
      let symmetry = '';
      let rating = '';
      let rank = '';
      
      switch(preset) {
        case 'shredded':
          name = 'Shredded Aesthetic';
          symmetry = (92.5 + Math.random() * 4).toFixed(1) + '%';
          rating = 'A+ Godlike';
          rank = 'Top ' + (0.5 + Math.random() * 1).toFixed(2) + '%';
          break;
        case 'bulk':
          name = 'Titan Bulk';
          symmetry = (85.2 + Math.random() * 5).toFixed(1) + '%';
          rating = 'A bulked';
          rank = 'Top ' + (3.0 + Math.random() * 2).toFixed(2) + '%';
          break;
        case 'lean':
          name = 'Lean Athletic';
          symmetry = (90.0 + Math.random() * 4).toFixed(1) + '%';
          rating = 'A- Lean';
          rank = 'Top ' + (2.0 + Math.random() * 1).toFixed(2) + '%';
          break;
        case 'beginner':
          name = 'Gym Beginner';
          symmetry = (74.0 + Math.random() * 8).toFixed(1) + '%';
          rating = 'B- Base level';
          rank = 'Top ' + (15 + Math.random() * 10).toFixed(1) + '%';
          break;
      }

      setScanResult({ name, symmetry, rating, rank });
    }
  }, [state.hasScanned, state.isScanning, state.selectedPreset]);

  const laserTranslateY = laserVal.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 210], // Slides between top and bottom padding of scanner box
  });

  const handleLiveCameraScan = () => {
    showToast('Camera Permission Required 📷', 'Live camera permissions are disabled in test mode. Please simulate instead.', 'error');
  };

  const presets = [
    { key: 'shredded', name: 'Shredded Aesthetic', desc: 'Extremely lean, ripped core' },
    { key: 'bulk', name: 'Titan Bulk', desc: 'Heavy muscle mass, size' },
    { key: 'lean', name: 'Lean Athletic', desc: 'Proportionate, low body fat' },
    { key: 'beginner', name: 'Gym Beginner', desc: 'Starting phase, base shape' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.tag}>PHYSIQUE ANALYSIS</Text>
      <Text style={styles.title}>AI Body Scanner</Text>
      <Text style={styles.description}>
        Get an instant AI-powered physique assessment, symmetry ratings, and community ranking.
      </Text>

      {/* Scanner Box */}
      <Card style={styles.scannerBox}>
        <View style={styles.gridBg}>
          {/* Custom brackets style overlays */}
          <View style={[styles.cornerBracket, styles.bracketTL]} />
          <View style={[styles.cornerBracket, styles.bracketTR]} />
          <View style={[styles.cornerBracket, styles.bracketBL]} />
          <View style={[styles.cornerBracket, styles.bracketBR]} />

          {/* Scanning animation laser line */}
          {state.isScanning && (
            <Animated.View style={[styles.laserLine, { transform: [{ translateY: laserTranslateY }] }]} />
          )}

          {/* Central content */}
          {!state.isScanning && !state.hasScanned && (
            <View style={styles.idleContainer}>
              <View style={styles.logoCircle}>
                <Svg viewBox="0 0 24 24" width="48" height="48" color="#ebd45b">
                  <Circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 3" />
                  <Path d="M13.5 5.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM11 9.5l-1.5 3.5H8v1h2l1-2.5 1.5 1v3.5h1v-4l-2-1.5 1-2z" fill="currentColor" />
                </Svg>
              </View>
              <Text style={styles.scannerText}>Ready to Scan</Text>
            </View>
          )}

          {state.isScanning && (
            <View style={styles.idleContainer}>
              <Animated.View style={{ transform: [{ scale: pulseVal }] }}>
                <View style={[styles.logoCircle, styles.logoCircleScanning]}>
                  <Svg viewBox="0 0 24 24" width="48" height="48" color="#00e676">
                    <Circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                    <Path d="M13.5 5.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM11 9.5l-1.5 3.5H8v1h2l1-2.5 1.5 1v3.5h1v-4l-2-1.5 1-2z" fill="currentColor" />
                  </Svg>
                </View>
              </Animated.View>
              <Text style={[styles.scannerText, { color: '#00e676' }]}>Analyzing physique...</Text>
            </View>
          )}

          {!state.isScanning && state.hasScanned && scanResult && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultPresetName}>{scanResult.name}</Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>SYMMETRY</Text>
                  <Text style={styles.statValue}>{scanResult.symmetry}</Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>PHYSIQUE</Text>
                  <Text style={styles.statValue}>{scanResult.rating}</Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>RANK</Text>
                  <Text style={styles.statValue}>{scanResult.rank}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </Card>

      {/* Buttons */}
      <View style={styles.btnRow}>
        <Button 
          title="📷 Live Camera Scan" 
          onPress={handleLiveCameraScan} 
          variant="outline" 
          style={styles.actionBtn}
        />
        <Button 
          title="⚡ Simulate Scan" 
          onPress={startScanSimulation} 
          variant="filled" 
          style={styles.actionBtn}
          disabled={state.isScanning}
        />
      </View>

      {/* Preset selection grid */}
      <Text style={styles.sectionTitle}>1. CHOOSE PHYSICAL PRESET (TEST AI)</Text>
      <View style={styles.presetGrid}>
        {presets.map((preset) => {
          const isActive = state.selectedPreset === preset.key;
          return (
            <TouchableOpacity
              key={preset.key}
              activeOpacity={0.8}
              onPress={() => selectPreset(preset.key as any)}
              style={[styles.presetCard, isActive && styles.presetCardActive]}
            >
              <Text style={[styles.presetName, isActive && styles.presetNameActive]}>
                {preset.name}
              </Text>
              <Text style={styles.presetDesc}>
                {preset.desc}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.bgApp,
  },
  content: {
    padding: 20,
    paddingBottom: 110,
  },
  tag: {
    fontSize: 11,
    fontWeight: '800',
    color: Theme.colors.accentYellow,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
    marginTop: 2,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 24,
  },
  scannerBox: {
    padding: 0,
    height: 240,
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    backgroundColor: '#0b0c0e',
    marginBottom: 24,
  },
  gridBg: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    // We simulate grid overlay inside CSS by creating custom border/line effects or simple styles
  },
  cornerBracket: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderColor: Theme.colors.accentYellow,
  },
  bracketTL: {
    top: 14,
    left: 14,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
  },
  bracketTR: {
    top: 14,
    right: 14,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
  },
  bracketBL: {
    bottom: 14,
    left: 14,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
  },
  bracketBR: {
    bottom: 14,
    right: 14,
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
  },
  laserLine: {
    position: 'absolute',
    left: 14,
    right: 14,
    height: 2.5,
    backgroundColor: '#00e676',
    zIndex: 10,
    shadowColor: '#00e676',
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  idleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(235, 212, 91, 0.05)',
    borderWidth: 2.5,
    borderColor: Theme.colors.accentYellowGlow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircleScanning: {
    backgroundColor: 'rgba(0, 230, 118, 0.05)',
    borderColor: 'rgba(0, 230, 118, 0.25)',
  },
  scannerText: {
    fontSize: 14,
    fontWeight: '800',
    color: Theme.colors.accentYellow,
    letterSpacing: 0.5,
  },
  resultContainer: {
    width: '100%',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultPresetName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingVertical: 14,
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 9,
    color: Theme.colors.textSecondary,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '900',
    color: Theme.colors.accentYellow,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  actionBtn: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: Theme.colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  presetGrid: {
    gap: 12,
  },
  presetCard: {
    backgroundColor: Theme.colors.bgCard,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    padding: 16,
  },
  presetCardActive: {
    borderColor: Theme.colors.accentYellow,
    backgroundColor: 'rgba(235, 212, 91, 0.02)',
  },
  presetName: {
    fontSize: 14,
    fontWeight: '800',
    color: Theme.colors.textSecondary,
    marginBottom: 2,
  },
  presetNameActive: {
    color: '#fff',
  },
  presetDesc: {
    fontSize: 11.5,
    color: Theme.colors.textSecondary,
  },
});

export default ScannerScreen;
