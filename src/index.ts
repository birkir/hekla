import './utils/sentry';
import { YellowBox, NetInfo, AsyncStorage, UIManager, Platform } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { Screens, startApp } from 'screens';
import UI from 'stores/UI';
import { db } from 'utils/firebase';
import { onSnapshot } from 'mobx-state-tree';
import Account from 'stores/Account';

// Ignore yellow box
YellowBox.ignoreWarnings([
  'Warning: isMounted(...) is deprecated',
  'Module RCTImageLoader requires main queue setup since it overrides `init` but doesn\'t implement `requiresMainQueueSetup`. In a future release React Native will default to initializing all native modules on a background thread unless explicitly opted-out of.',
  'Could not find image',
  'RCTBridge required dispatch_sync',
  'Required dispatch_sync to load constants',
]);

// Devtool network request support
if (__DEV__) {
  // const { originalFormData, originalXMLHttpRequest, XMLHttpRequest, FormData } = (global as any);
  // (global as any).XMLHttpRequest = originalXMLHttpRequest ? originalXMLHttpRequest : XMLHttpRequest;
  // (global as any).FormData = originalFormData ? originalFormData : FormData;
}

// Enable LayoutAnimation on android
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

// Listen for Navigation events
Navigation.events().registerNativeEventListener((name, params) => {
  if (name === 'previewContext') {
    UI.setPreview({
      srcComponentId: params.componentId,
      dstComponentId: params.previewComponentId,
      active: true,
    });
  }

  if (name === 'previewCommit') {
    UI.setPreview({
      active: false,
    });
  }
});

// Listen for componentDidAppear screen events
Navigation.events().registerComponentDidAppearListener((componentId, componentName) => {
  UI.setComponentId(componentId);
});

// Listen for componentDidDisappear screen events
Navigation.events().registerComponentDidDisappearListener((componentId, componentName) => {
  if (UI.preview.dstComponentId === componentId) {
    UI.setComponentId(UI.preview.srcComponentId);
    UI.setPreview({
      active: false,
    });
  }
});

// Firebase connection state
db.ref('.info').on('value', (s: any) => {
  UI.setIsConnected(s.val().connected);
});

// Listen to device connection state
NetInfo.addEventListener('connectionChange', ({ type }: any) => {
  UI.setIsConnected(type !== 'none');
});

// Initial device connection state
NetInfo.getConnectionInfo().then(({ type }) => {
  UI.setIsConnected(type !== 'none');
});

// Persist Settings!
onSnapshot(UI.settings, (snapshot) => {
  AsyncStorage.setItem('UI.settings', JSON.stringify(snapshot));
});

onSnapshot(Account.read, (snapshot) => {
  AsyncStorage.setItem('Account.read', JSON.stringify(snapshot));
});
