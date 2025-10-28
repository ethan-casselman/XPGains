import { Drawer } from 'expo-router/drawer';
import { PaperProvider } from 'react-native-paper';

export default function Layout() {
  return (
    <PaperProvider>
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerActiveTintColor: '#15ff00ff',
          drawerInactiveTintColor: '#000',
        }}
      />
    </PaperProvider>
  );
}