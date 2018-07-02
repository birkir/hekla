#import <AVKit/AVKit.h>
#import "RNNRootViewProtocol.h"

@interface RNNAVPlayer : AVPlayerViewController <RNNRootViewProtocol>
  @property (nonatomic, strong) RNNNavigationOptions* options;
  @property (nonatomic, strong) NSString* componentId;

- (BOOL)isCustomTransitioned;
@end
