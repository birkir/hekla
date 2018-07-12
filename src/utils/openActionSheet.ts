import { ActionSheetIOS, Platform } from 'react-native';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';
import RNBottomActionSheet from 'react-native-bottom-action-sheet';
import DialogAndroid from 'react-native-dialogs';

export default ({ options, title = undefined, message = undefined, selectedId = undefined, sheet = false, cancel = null }, callback) => {

  if (Platform.OS === 'android') {
    if (sheet) {
      return RNBottomActionSheet.SheetView.Show({
        title,
        items: options.map((item: any) => {
          return {
            value: item.id,
            title: item.title,
            subTitle: item.subtitle,
            icon: item.materialIcon ? { props: { family: 'MaterialCommunityIcons', name: item.materialIcon, color: '#000000', size: 24 } } : undefined,
          };
        }),
        theme: 'light',
        selection: options.findIndex(item => item.id === selectedId),
        onSelection: (index, value) => callback({ id: value }),
      });
    }

    return DialogAndroid.showPicker(title, null, {
      selectedId,
      // positiveText: null,
      negativeText: 'Cancel',
      type: DialogAndroid.listRadio,
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
