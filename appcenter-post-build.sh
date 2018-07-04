if [ -z "$APPCENTER_XCODE_PROJECT"]; then
  cd ios
  fastlane tag_version
  cd -
fi

if [ -z "$APPCENTER_ANDROID_VARIANT" ]; then
  cd android
  fastlane tag_version
  cd -
fi
