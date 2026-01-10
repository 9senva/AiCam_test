import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// 注意：这里的 appName 必须与 app.json 里的 "name" 字段一致
AppRegistry.registerComponent(appName, () => App);