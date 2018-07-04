if [ ! -z "$IOS_CODEPUSH_APPID" ]; then
  echo "Post build ios"
  cd ios
  fastlane tag_version
  cd -
fi

if [ ! -z "$ANDROID_CODEPUSH_APPID" ]; then
  echo "Post build android"
  cd android
  fastlane tag_version
  cd -
fi
