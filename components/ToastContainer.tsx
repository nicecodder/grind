import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useApp, Toast } from '../context/AppContext';
import { Theme } from './Theme';

const { width } = Dimensions.get('window');

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'error':
        return Theme.colors.danger;
      case 'achievement':
        return Theme.colors.accentYellow;
      default:
        return Theme.colors.accentGreen;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'error':
        return '⚠️';
      case 'achievement':
        return '🏆';
      default:
        return '✅';
    }
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <TouchableOpacity
          key={toast.id}
          activeOpacity={0.9}
          style={[styles.toast, { borderColor: getBorderColor(toast.type) }]}
          onPress={() => dismissToast(toast.id)}
        >
          <View style={styles.iconBox}>
            <Text style={styles.icon}>{getIcon(toast.type)}</Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.header}>{toast.header}</Text>
            <Text style={styles.body}>{toast.body}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 99999,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  toast: {
    width: '100%',
    maxWidth: width - 40,
    backgroundColor: '#16181c',
    borderRadius: Theme.borderRadius.md,
    borderLeftWidth: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  iconBox: {
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  header: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    marginBottom: 2,
    letterSpacing: 0.1,
  },
  body: {
    color: Theme.colors.textSecondary,
    fontSize: 11.5,
    lineHeight: 15,
  },
});
export default ToastContainer;
