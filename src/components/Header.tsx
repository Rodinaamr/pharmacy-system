import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../utils/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showSearch?: boolean;
  onSearch?: () => void;
  showMenu?: boolean;
  onMenu?: () => void;
  showNotification?: boolean;
  onNotification?: () => void;
  notificationCount?: number;
  showHome?: boolean;
  onHome?: () => void;
  rightComponent?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack,
  onBack,
  showSearch,
  onSearch,
  showMenu,
  onMenu,
  showNotification,
  onNotification,
  notificationCount,
  showHome,
  onHome,
  rightComponent,
}) => {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <View style={styles.row}>
        {/* Left */}
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
          ) : showMenu ? (
            <TouchableOpacity onPress={onMenu} style={styles.iconBtn}>
              <Ionicons name="menu" size={24} color={COLORS.white} />
            </TouchableOpacity>
          ) : (
            <View style={styles.logoContainer}>
              <Ionicons name="leaf" size={22} color={COLORS.white} />
            </View>
          )}
        </View>

        {/* Center / Title */}
        <View style={styles.centerSection}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right */}
        <View style={styles.rightSection}>
          {rightComponent}
          {showSearch && (
            <TouchableOpacity onPress={onSearch} style={styles.iconBtn}>
              <Ionicons name="search" size={22} color={COLORS.white} />
            </TouchableOpacity>
          )}
          {showNotification && (
            <TouchableOpacity onPress={onNotification} style={styles.iconBtn}>
              <View>
                <Ionicons name="notifications-outline" size={22} color={COLORS.white} />
                {notificationCount && notificationCount > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          )}
          {showHome && (
            <TouchableOpacity onPress={onHome} style={styles.iconBtn}>
              <Ionicons name="home-outline" size={22} color={COLORS.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 44,
  },
  centerSection: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 44,
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  title: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONTS.sizes.sm,
    marginTop: 2,
  },
  iconBtn: {
    padding: SPACING.xs,
    borderRadius: 20,
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '700',
  },
});

export default Header;
