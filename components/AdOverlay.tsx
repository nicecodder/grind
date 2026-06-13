import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import { Theme } from './Theme';
import { Button } from './Button';

export const AdOverlay: React.FC = () => {
  const { adVisible, adRewarded, closeAd } = useApp();
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (adVisible) {
      setCountdown(5);
      setCanSkip(false);
      
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanSkip(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [adVisible]);

  if (!adVisible) return null;

  return (
    <Modal visible={adVisible} transparent animationType="slide">
      <View style={styles.container}>
        <View style={styles.adFrame}>
          {/* Ad Sponsor Indicator */}
          <Text style={styles.sponsorTag}>SPONSORED ADVERTISEMENT</Text>
          
          <View style={styles.adMediaBox}>
            <Text style={styles.playIcon}>🎬</Text>
            <Text style={styles.adBrand}>GYMSHARK APPAREL</Text>
            <Text style={styles.adSlogan}>"Be a Visionary. Don't Skip Today's Grind."</Text>
          </View>

          {/* Ad Reward Prompt */}
          {adRewarded && (
            <View style={styles.rewardNotice}>
              <Text style={styles.rewardNoticeText}>
                ⭐ Rewarded Ad: Complete to earn 1.5x EXP boost for today!
              </Text>
            </View>
          )}

          <View style={styles.footer}>
            {canSkip ? (
              <Button
                title={adRewarded ? "Claim Boost & Close" : "Skip Ad & Return"}
                onPress={closeAd}
                variant="filled"
                style={styles.actionBtn}
              />
            ) : (
              <View style={styles.countdownContainer}>
                <Text style={styles.countdownText}>
                  Skip available in <Text style={styles.countdownHighlight}>{countdown}s</Text>
                </Text>
              </View>
            )}
          </View>

          {/* Premium callout */}
          <TouchableOpacity 
            activeOpacity={0.8}
            style={styles.premiumLink}
            onPress={() => {
              // Close ad and let AppContext redirect to plans
              closeAd();
            }}
          >
            <Text style={styles.premiumLinkText}>
              Tired of ads? Upgrade to <Text style={styles.goldText}>Grind Pro</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050607',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  adFrame: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Theme.colors.bgCard,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    padding: 24,
    alignItems: 'center',
  },
  sponsorTag: {
    fontSize: 10,
    fontWeight: '800',
    color: Theme.colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 24,
  },
  adMediaBox: {
    width: '100%',
    height: 220,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginBottom: 24,
  },
  playIcon: {
    fontSize: 44,
    marginBottom: 16,
  },
  adBrand: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 4,
  },
  adSlogan: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  rewardNotice: {
    backgroundColor: 'rgba(235, 212, 91, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(235, 212, 91, 0.2)',
    borderRadius: Theme.borderRadius.sm,
    padding: 12,
    width: '100%',
    marginBottom: 24,
  },
  rewardNoticeText: {
    color: Theme.colors.accentYellow,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 16,
  },
  footer: {
    width: '100%',
    marginBottom: 20,
  },
  actionBtn: {
    width: '100%',
  },
  countdownContainer: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  countdownText: {
    color: Theme.colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  countdownHighlight: {
    color: '#fff',
    fontWeight: '800',
  },
  premiumLink: {
    marginTop: 8,
  },
  premiumLinkText: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  goldText: {
    color: Theme.colors.accentYellow,
    fontWeight: '800',
  },
});
export default AdOverlay;
