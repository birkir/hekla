import { Platform } from 'react-native';
import CodePush from 'react-native-code-push';
import config from 'config';
import UI from 'stores/UI';

export default () => {
  const codePushConfig = {
    checkFrequency: CodePush.CheckFrequency.ON_APP_START,
    installMode: CodePush.InstallMode.ON_NEXT_RESTART,
    deploymentKey: undefined,
    updateDialog: undefined,
  };

  if (Platform.OS === 'ios' && UI.settings.isBeta) {
    codePushConfig.deploymentKey = config.IOS_CODEPUSH_DEPLOYMENT_KEY_STAGING;
    codePushConfig.installMode = CodePush.InstallMode.IMMEDIATE;
    codePushConfig.updateDialog = true;
  }

  if (Platform.OS === 'android' && UI.settings.isBeta) {
    codePushConfig.deploymentKey = config.ANDROID_CODEPUSH_DEPLOYMENT_KEY_STAGING;
    codePushConfig.installMode = CodePush.InstallMode.IMMEDIATE;
    codePushConfig.updateDialog = true;
  }

  return codePushConfig;
};
