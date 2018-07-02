import './utils/sentry';
import { YellowBox } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { Screens, startApp } from 'screens';
import UI from 'stores/UI';

// Ignore yellow box
YellowBox.ignoreWarnings([
  'Warning: isMounted(...) is deprecated',
  'Module RCTImageLoader requires main queue setup since it overrides `init` but doesn\'t implement `requiresMainQueueSetup`. In a future release React Native will default to initializing all native modules on a background thread unless explicitly opted-out of.',
  'Could not find image',
  'RCTBridge required dispatch_sync',
  'Required dispatch_sync to load constants',
]);

// Devtool network request support
// (global as any).sourceXMLHttpRequest = XMLHttpRequest;
// XMLHttpRequest = (global as any).originalXMLHttpRequest || (global as any).XMLHttpRequest;

// Register screens
Screens.forEach((ScreenComponent, key) =>
  Navigation.registerComponent(key, () => ScreenComponent));

// Set current componentId
Navigation.events().registerComponentDidAppearListener((componentId, componentName) => {
  UI.setComponentId(componentId);
});

// Start application
Navigation.events().registerAppLaunchedListener(() => {
  UI.hydrate().then(startApp);
});
