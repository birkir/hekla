import { ActionSheetIOS, Platform } from 'react-native';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';
import DialogAndroid from 'react-native-dialogs';

export default (
  {
    options,
    type = 'radio',
    title = undefined,
    message = undefined,
    selectedId = undefined,
    cancel = null,
  },
  callback,
) => {

  if (Platform.OS === 'android') {
    return DialogAndroid.showPicker(title, null, {
      selectedId,
      // positiveText: null,
      negativeText: cancel,
      type: type === 'radio' ? DialogAndroid.listRadio : DialogAndroid.listPlain,
      items: options.map((item: any) => ({
        id: item.id,
        label: item.title,
      })),
    })
    .then(({ selectedItem, ...rest }) => {
      if (selectedItem) {
        callback(selectedItem);
      }
    });
  }

  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title,
        message,
        cancelButtonIndex: options.length,
        options: [
          ...options.map((item) => {
            const icon = typeof item.icon === 'number' ? resolveAssetSource(item.icon) : item.icon;
            const title = item.title;
            const titleTextAlignment = item.titleTextAlignment;
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
  }
};
