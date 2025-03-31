import { Redirect } from 'expo-router';

export default function ProfileTab() {
  // Redirect to the actual profile screen in the (profile) group
  return <Redirect href="/(profile)" />;
} 