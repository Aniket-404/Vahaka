import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ViewStyle,
} from 'react-native';
import { COLORS, SPACING, FONTS, FONT_SIZES, LAYOUT } from '../constants/theme';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  style?: ViewStyle;
  transparent?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  rightComponent,
  style,
  transparent = false,
}) => {
  return (
    <View
      style={[
        styles.container,
        transparent ? styles.transparentContainer : null,
        style,
      ]}
    >
      <StatusBar
        barStyle={transparent ? 'light-content' : 'dark-content'}
        backgroundColor={transparent ? 'transparent' : COLORS.surface}
        translucent={transparent}
      />
      
      <View style={styles.content}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
          >
            <Text style={transparent ? styles.transparentBackIcon : styles.backIcon}>
              ←
            </Text>
          </TouchableOpacity>
        )}
        
        <Text
          style={[
            styles.title,
            transparent ? styles.transparentTitle : null,
            showBackButton ? styles.titleWithBack : null,
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        
        <View style={styles.rightContainer}>
          {rightComponent || <View style={styles.placeholder} />}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: LAYOUT.headerHeight + StatusBar.currentHeight,
    paddingTop: StatusBar.currentHeight,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  transparentContainer: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: FONT_SIZES.xxl,
    color: COLORS.text,
  },
  transparentBackIcon: {
    fontSize: FONT_SIZES.xxl,
    color: COLORS.surface,
  },
  title: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    textAlign: 'center',
  },
  transparentTitle: {
    color: COLORS.surface,
  },
  titleWithBack: {
    textAlign: 'center',
    marginLeft: -40, // Adjust for back button width
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 40,
  },
}); 