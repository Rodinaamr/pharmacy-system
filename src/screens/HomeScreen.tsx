import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, G } from 'react-native-svg';
import { Animated, Easing } from 'react-native';
import { RootStackParamList } from '../types';
import { usePharmacy } from '../context/PharmacyContext';
import Header from '../components/Header';
import { StatCard, SectionHeader, DashboardBanner } from '../components/SharedComponents';
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from '../utils/theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// --- Animated Circular Growth Score Gauge ---
const GrowthScoreGauge = () => {
  const { prescriptions, medications, stats } = usePharmacy();

  // Compute a real, dynamic score from live system data
  const score = React.useMemo(() => {
    const total = prescriptions.length;
    const approved = prescriptions.filter(p => p.status === 'approved' || p.status === 'dispensed').length;
    const approvalRate = total > 0 ? (approved / total) : 0;   // 0-1

    const totalMeds = medications.length;
    const healthyMeds = medications.filter(m => m.status === 'available').length;
    const stockHealth = totalMeds > 0 ? (healthyMeds / totalMeds) : 1; // 0-1

    const pending = stats.pendingApprovals ?? 0;
    const queueEfficiency = total > 0 ? Math.max(0, 1 - pending / Math.max(total, 1)) : 1; // 0-1

    const raw = (approvalRate * 40) + (stockHealth * 30) + (queueEfficiency * 20) + 10;
    return Math.min(100, Math.round(raw * 10) / 10);
  }, [prescriptions, medications, stats]);

  // Calculate % change vs a baseline of 70
  const trendPct = ((score - 70) / 70 * 100).toFixed(1);
  const trendPositive = score >= 70;

  const percentage = score / 100;
  const arcAnim = React.useRef(new Animated.Value(0)).current;
  const countAnim = React.useRef(new Animated.Value(0)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const [displayScore, setDisplayScore] = React.useState(0);

  const SIZE = 200;
  const STROKE = 14;
  const R = (SIZE - STROKE * 2) / 2;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  // Arc spans 270 degrees (from 135° to 45°)
  const ARC_ANGLE = 270;
  const circumference = 2 * Math.PI * R;
  const arcLength = (ARC_ANGLE / 360) * circumference;
  const gapLength = circumference - arcLength;

  // Convert polar coords
  const polarToCartesian = (angle: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: CX + R * Math.cos(rad),
      y: CY + R * Math.sin(rad),
    };
  };

  // Build arc path from 135deg to 405deg (135+270)
  const startAngle = 135;
  const endAngle = startAngle + ARC_ANGLE;
  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(endAngle);
  const bgPath = `M ${start.x} ${start.y} A ${R} ${R} 0 1 1 ${end.x} ${end.y}`;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(arcAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(countAnim, {
        toValue: score,
        duration: 1800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    // Pulse the dot endlessly
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.5, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();

    // Listen for count changes to update display
    const id = countAnim.addListener(({ value }) => setDisplayScore(Math.round(value * 10) / 10));
    return () => countAnim.removeListener(id);
  }, []);

  // Dot position at tip of arc
  const tipAngle = startAngle + ARC_ANGLE * percentage;
  const tipPos = polarToCartesian(tipAngle);

  // strokeDashoffset controls how much of the arc is "filled"
  const dashOffset = arcAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [arcLength, arcLength * (1 - percentage)],
  });

  const AnimatedPath = Animated.createAnimatedComponent(Path);

  return (
    <View style={gaugeStyles.wrapper}>
      <Svg width={SIZE} height={SIZE}>
        <Defs>
          <LinearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#00CC44" />
            <Stop offset="100%" stopColor="#00FF88" />
          </LinearGradient>
        </Defs>

        {/* Background track */}
        <Path
          d={bgPath}
          fill="none"
          stroke="#E8F5E9"
          strokeWidth={STROKE}
          strokeLinecap="round"
        />

        {/* Animated filled arc */}
        <AnimatedPath
          d={bgPath}
          fill="none"
          stroke="url(#arcGrad)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${gapLength}`}
          strokeDashoffset={dashOffset}
        />

        {/* Glowing tip dot */}
        <Circle cx={tipPos.x} cy={tipPos.y} r={8} fill="#00CC44" />
        <Circle cx={tipPos.x} cy={tipPos.y} r={4} fill="#eaffef" />
      </Svg>

      {/* Center labels */}
      <View style={gaugeStyles.centerLabel}>
        <Text style={gaugeStyles.labelTop}>GROWTH SCORE</Text>
        <Text style={gaugeStyles.score}>{displayScore.toFixed(1)}</Text>
        <View style={gaugeStyles.trendRow}>
          <Ionicons name={trendPositive ? 'trending-up' : 'trending-down'} size={14} color={trendPositive ? '#00aa44' : '#cc2200'} />
          <Text style={[gaugeStyles.trendText, { color: trendPositive ? '#00aa44' : '#cc2200' }]}>
            {trendPositive ? '+' : ''}{trendPct}%
          </Text>
        </View>
      </View>
    </View>
  );
};

const gaugeStyles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelTop: {
    fontSize: 9,
    fontWeight: '900',
    color: '#888',
    letterSpacing: 1,
    marginBottom: 4,
  },
  score: {
    fontSize: 42,
    fontWeight: '800',
    color: '#1a1a1a',
    lineHeight: 46,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  trendText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00aa44',
  },
});

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { stats, activities, refreshData, loading } = usePharmacy();

  const onRefresh = useCallback(async () => {
    await refreshData();
  }, [refreshData]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={styles.container}>
      <Header
        title="Green Pharmacy"
        subtitle="Operations Dashboard"
        showBack
        onBack={() => navigation.goBack()}
        showHome
        onHome={() => navigation.navigate('RoleSelector' as any)}
        showNotification
        notificationCount={stats.pendingApprovals}
        onNotification={() => navigation.navigate('Notifications' as any)}
      />
      <DashboardBanner screenName="Operations Dashboard" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        <View style={[styles.greetingCard, SHADOWS.md]}>
          <View>
            <Text style={styles.greetingText}>{greeting()},</Text>
            <Text style={styles.greetingName}>Pharmacist 👋</Text>
          </View>
          <View style={styles.pharmacyBadge}>
            <Ionicons name="leaf" size={28} color={COLORS.primary} />
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statsColumn}>
            <StatCard
              icon={<Ionicons name="document-text" size={24} color={COLORS.primary} />}
              label="Prescriptions"
              value={stats.newPrescriptions}
              iconBg={COLORS.primaryUltraLight}
            />
          </View>
          <View style={styles.statsColumn}>
            <StatCard
              icon={<Ionicons name="warning" size={24} color={COLORS.danger} />}
              label="Low Stock"
              value={stats.lowStockMedications}
              iconBg={COLORS.dangerLight}
            />
          </View>
        </View>

        <TouchableOpacity style={[styles.revenueBanner, SHADOWS.sm]} activeOpacity={0.9}>
          <View style={styles.revenueInfo}>
            <Text style={styles.revenueLabel}>Today's Total Revenue</Text>
            <Text style={styles.revenueValue}>EGP {stats.totalRevenue.toLocaleString()}</Text>
          </View>
          <View style={styles.revenueTrend}>
            <Ionicons name="trending-up" size={18} color={COLORS.success} />
            <Text style={styles.revenueTrendText}>+12.5%</Text>
          </View>
        </TouchableOpacity>

        {/* Growth Score Gauge */}
        <View style={[styles.trendsCard, SHADOWS.sm]}>
          <Text style={styles.trendsTitle}>SYSTEM GROWTH SCORE</Text>
          <View style={{ alignItems: 'center', paddingVertical: SPACING.md }}>
            <GrowthScoreGauge />
          </View>
        </View>


        <SectionHeader title="Shift Handover & Notes" actionLabel="Post Note" onAction={() => {}} />
        <View style={styles.handoverContainer}>
          {[
            { user: 'Dr. Sarah', time: '2 hrs ago', note: "Ahmed Ali's insulin is in the fridge, he's coming at 8 PM.", type: 'instruction' },
            { user: 'Admin', time: '5 hrs ago', note: "MedSupply delivery delayed to tomorrow morning.", type: 'alert' }
          ].map((item, idx) => (
            <View key={idx} style={[styles.handoverCard, SHADOWS.sm, item.type === 'alert' && { borderLeftColor: COLORS.danger }]}>
              <View style={styles.handoverHeader}>
                <Text style={styles.handoverUser}>{item.user}</Text>
                <Text style={styles.handoverTime}>{item.time}</Text>
              </View>
              <Text style={styles.handoverNote}>{item.note}</Text>
            </View>
          ))}
        </View>

        <SectionHeader title="Recent Activity Timeline" actionLabel="Full History" onAction={() => {}} />
        <View style={styles.timelineContainer}>
          {activities.slice(0, 5).map((activity, idx) => (
            <View key={activity.id} style={styles.timelineItem}>
              {/* Timeline graphic */}
              <View style={styles.timelineLineContainer}>
                <View style={[styles.timelineDot, { backgroundColor: activity.color || COLORS.primary }]} />
                {idx !== Math.min(activities.length, 5) - 1 && <View style={styles.timelineLine} />}
              </View>

              {/* Activity Card */}
              <TouchableOpacity activeOpacity={0.7} style={[styles.timelineCard, SHADOWS.sm]}>
                <View style={styles.timelineHeader}>
                  <Text style={styles.timelineTitle}>{activity.title}</Text>
                  <Text style={styles.timelineTime}>
                    {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text style={styles.timelineDesc}>{activity.description}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  subtitleBanner: {
    backgroundColor: COLORS.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 8,
  },
  subtitleText: { color: COLORS.white, fontSize: FONTS.sizes.sm, fontWeight: '700', marginLeft: SPACING.xs },
  subtitleSub: { color: 'rgba(255,255,255,0.75)', fontSize: FONTS.sizes.xs },
  scroll: { flex: 1 },
  content: { padding: SPACING.lg },
  greetingCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: { fontSize: FONTS.sizes.base, color: COLORS.textSecondary, fontWeight: '500' },
  greetingName: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text, marginVertical: 4 },
  pharmacyBadge: { width: 56, height: 56, borderRadius: RADIUS.md, backgroundColor: COLORS.primaryUltraLight, justifyContent: 'center', alignItems: 'center' },
  statsGrid: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  statsColumn: { flex: 1, gap: SPACING.md },
  revenueBanner: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  revenueInfo: { gap: 4 },
  revenueLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, fontWeight: '600', textTransform: 'uppercase' },
  revenueValue: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.text },
  revenueTrend: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.successLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.sm, gap: 4 },
  revenueTrendText: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.success },
  trendsCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.lg, marginBottom: SPACING.lg },
  trendsTitle: { fontSize: 10, fontWeight: '900', color: COLORS.textLight, letterSpacing: 1, marginBottom: SPACING.md },
  refillContainer: { gap: SPACING.sm, marginBottom: SPACING.lg },
  refillCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.md, gap: SPACING.md },
  refillIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primaryUltraLight, justifyContent: 'center', alignItems: 'center' },
  refillName: { fontSize: FONTS.sizes.base, fontWeight: '700', color: COLORS.text },
  refillDrug: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  refillBadge: { backgroundColor: COLORS.warningLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.sm },
  refillBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.warning },
  // Timeline
  timelineContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineLineContainer: {
    width: 30,
    alignItems: 'center',
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 24,
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.sm,
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginTop: -4,
    marginBottom: -24,
    zIndex: 1,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineTitle: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.text },
  timelineTime: { fontSize: 10, fontWeight: '600', color: COLORS.textLight },
  timelineDesc: { fontSize: 11, color: COLORS.textSecondary, lineHeight: 16 },
  handoverContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  handoverCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  handoverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  handoverUser: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  handoverTime: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  handoverNote: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  bottomPad: { height: 80 },
});

export default HomeScreen;
