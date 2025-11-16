import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home } from '@tamagui/lucide-icons';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const homeIndex = state.routes.findIndex(route => route.name === 'index');

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          // Skip the home tab in regular rendering (will be center button)
          if (route.name === 'index') {
            return <View key={route.key} style={styles.centerSpacer} />;
          }

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tab}
            >
              {options.tabBarIcon &&
                options.tabBarIcon({
                  focused: isFocused,
                  color: isFocused ? '#4D7EA8' : '#828489',
                  size: 24,
                })}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Floating Center Button */}
      <TouchableOpacity
        style={styles.centerButton}
        onPress={() => {
          const homeRoute = state.routes[homeIndex];
          const event = navigation.emit({
            type: 'tabPress',
            target: homeRoute.key,
            canPreventDefault: true,
          });

          if (state.index !== homeIndex && !event.defaultPrevented) {
            navigation.navigate('index');
          }
        }}
      >
        <View
          style={[
            styles.centerButtonInner,
            state.index === homeIndex && styles.centerButtonActive,
          ]}
        >
          <Home size={28} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E0E0E0',
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10,
    height: Platform.OS === 'ios' ? 80 : 70,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerSpacer: {
    flex: 1,
  },
  centerButton: {
    position: 'absolute',
    top: -30,
    left: '50%',
    marginLeft: -35,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  centerButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4D7EA8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButtonActive: {
    backgroundColor: '#3D6888',
    transform: [{ scale: 1.05 }],
  },
});
