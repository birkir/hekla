import * as React from 'react';
import { Navigation } from 'react-native-navigation';
import { Platform } from 'react-native';

interface Props {
  elementId?: string;
  children?: React.ReactNode;
}

export default class Element extends React.PureComponent<Props> {
  render() {
    const { children, elementId } = this.props;

    if (Platform.OS === 'ios') {
      const Element = Navigation.Element as any;
      return (
        <Element elementId={elementId}>
          {children}
        </Element>
      );
    }

    return (
      <React.Fragment key={elementId}>
        {children}
      </React.Fragment>
    );
  }
}
