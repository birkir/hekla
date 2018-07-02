import { ActionSheetIOS } from 'react-native';

export default ({ options, cancel = null }, callback) => {
  ActionSheetIOS.showActionSheetWithOptions(
    {
      cancelButtonIndex: options.length,
      options: [
        ...options,
        ...(cancel ? [{ title: cancel }] : []),
      ] as any,
    },
    (index: number) => {
      if (index < options.length) {
        return callback(options[index]);
      }
    },
  );
};
