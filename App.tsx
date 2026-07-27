import { initDatabase } from './src/db/setup';
import RootNavigator from './src/navigation/RootNavigator';

initDatabase();

export default function App() {
  return <RootNavigator />;
}
