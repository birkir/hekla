#import "ReactNativeNavigation.h"
#import "RNNRootViewController.h"
#import "RNNElementFinder.h"
#import "RNNElementView.h"
#import "RNNAVPlayer.h"
#import "RNUeno.h"

@import SafariServices;

#ifndef TARGET_OS_SIMULATOR
  #ifdef TARGET_IPHONE_SIMULATOR
    #define TARGET_OS_SIMULATOR TARGET_IPHONE_SIMULATOR
  #else
    #define TARGET_OS_SIMULATOR 0
  #endif
#endif

@implementation RNUeno

- (dispatch_queue_t) methodQueue
{
  return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

RCT_EXPORT_MODULE()

- (BOOL) isSimulator {
  #if TARGET_OS_SIMULATOR
    return YES;
  #else
    return NO;
  #endif
}

RCT_EXPORT_METHOD(getHeights:(NSString *)componentId resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
  UIViewController *vc = [ReactNativeNavigation findViewController:componentId];
  NSObject *constants = @{
                          @"topBarHeight": @(vc.navigationController.navigationBar.frame.size.height),
                          @"statusBarHeight": @([UIApplication sharedApplication].statusBarFrame.size.height),
                          @"bottomTabsHeight": @(vc.tabBarController.tabBar.frame.size.height)
                          };
  resolve(constants);
}

RCT_EXPORT_METHOD(openVideoPlayer:(NSString *)componentId url:(NSString *)url elementId:(NSString *)elementId) {
 UIViewController *vc = [ReactNativeNavigation findViewController:componentId];
 NSURL *videoURL = [NSURL URLWithString:url];
 AVPlayer *player = [AVPlayer playerWithURL:videoURL];
 RNNAVPlayer *playerViewController = [RNNAVPlayer new];
 playerViewController.player = player;
 playerViewController.componentId = @"RNNAVPlayer";

 if (elementId != nil) {
   RNNElementFinder* elementFinder = [[RNNElementFinder alloc] initWithFromVC:vc];
   RNNElementView* elementView = [elementFinder findElementForId:elementId];
   if ([vc isKindOfClass:[RNNRootViewController class]]) {
     RNNRootViewController* rootVc = (RNNRootViewController*)vc;
     rootVc.previewController = playerViewController;
     rootVc.previewCallback = ^(UIViewController *vc) {
       [player play];
       [vc.navigationController presentViewController:playerViewController animated:YES completion:nil];
     };
     [rootVc registerForPreviewingWithDelegate:(id)rootVc sourceView:elementView];
   }
 } else {
   [vc.navigationController presentViewController:playerViewController animated:YES completion:nil];
 }
}

RCT_EXPORT_METHOD(openSafari:(NSString *)componentId url:(NSString *)url reactTag:(nonnull NSNumber *)reactTag) {
 UIViewController *vc = [ReactNativeNavigation findViewController:componentId];
 SFSafariViewController *safariViewController = [[SFSafariViewController alloc] initWithURL:[[NSURL alloc] initWithString:url]];
 (void)safariViewController.view;
 if ([reactTag intValue] >= 0) {
   if ([vc isKindOfClass:[RNNRootViewController class]]) {
     RNNRootViewController* rootVc = (RNNRootViewController*)vc;
     rootVc.previewController = safariViewController;
     rootVc.previewCallback = ^(UIViewController *vc) {
       RNNRootViewController* theVc = (RNNRootViewController*)vc;
       [vc.navigationController presentViewController:safariViewController animated:NO completion:nil];
       [theVc.eventEmitter sendComponentDidDisappear:theVc.componentId componentName:theVc.componentId];
     };
     RCTExecuteOnMainQueue(^{
       UIView *view = [[ReactNativeNavigation getBridge].uiManager viewForReactTag:reactTag];
       [rootVc registerForPreviewingWithDelegate:(id)rootVc sourceView:view];
     });
   }
 } else {
   [vc.navigationController presentViewController:safariViewController animated:YES completion:nil];
   if ([vc isKindOfClass:[RNNRootViewController class]]) {
     RNNRootViewController* rootVc = (RNNRootViewController*)vc;
     [rootVc.eventEmitter sendComponentDidDisappear:rootVc.componentId componentName:rootVc.componentId];
   }
 }
}

- (BOOL) isAppStoreReceiptSandbox {
  if (![NSBundle.mainBundle respondsToSelector:@selector(appStoreReceiptURL)]) {
    return NO;

  }

  NSURL *appStoreReceiptURL = NSBundle.mainBundle.appStoreReceiptURL;
  NSString *appStoreReceiptLastComponent = appStoreReceiptURL.lastPathComponent;
  BOOL isSandboxReceipt = [appStoreReceiptLastComponent isEqualToString:@"sandboxReceipt"];

  return isSandboxReceipt;
}

- (BOOL) hasEmbeddedMobileProvision {
  BOOL hasEmbeddedMobileProvision = !![[NSBundle mainBundle] pathForResource:@"embedded" ofType:@"mobileprovision"];
  return hasEmbeddedMobileProvision;
}

- (NSDictionary *)constantsToExport
{
  BOOL isSimulator = [self isSimulator];
  BOOL isTestFlight = [self isAppStoreReceiptSandbox];
  BOOL hasMobileProvision = [self hasEmbeddedMobileProvision];
  return @{
           @"isSimulator": @(isSimulator),
           @"isTestFlight": @(isTestFlight),
           @"hasMobileProvision": @(hasMobileProvision)
           };
}

@end
