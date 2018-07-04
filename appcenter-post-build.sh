if [ ! -z "$IOS_CODEPUSH_APPID" ]; then
  cd ios
  fastlane tag_version
  cd -
fi

if [ ! -z "$ANDROID_CODEPUSH_APPID" ]; then
  cd android
  fastlane tag_version
  cd -
fi
