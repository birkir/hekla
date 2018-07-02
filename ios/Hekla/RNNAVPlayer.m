#import "RNNAVPlayer.h"

@interface RNNAVPlayer()
@end

@implementation RNNAVPlayer

-(BOOL)isCustomTransitioned {
  return NO;
}

- (void)viewDidLoad {
  [super viewDidLoad];
  [self.player play];
}

- (void)viewWillDisappear:(BOOL)animated {
  [super viewWillDisappear:animated];
  [self.player pause];
}

@end
