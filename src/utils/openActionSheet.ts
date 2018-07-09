import { ActionSheetIOS } from 'react-native';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';

export default ({ options, title = undefined, message = undefined, cancel = null }, callback) => {
  ActionSheetIOS.showActionSheetWithOptions(
    {
      title,
      message,
      cancelButtonIndex: options.length,
      options: [
        ...options.map((item) => {
          const icon = typeof item.icon === 'number' ? resolveAssetSource(item.icon) : item.icon;
          const title = item.title;
          const titleTextAlignment = item.titleTextAlignment || undefined;
          return { title, titleTextAlignment, icon };
        }),
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
