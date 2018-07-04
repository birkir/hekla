if [ ! -z "$GOOGLE_SERVICES_JSON" ]; then
  echo $GOOGLE_SERVICES_JSON | base64 --decode > "$APPCENTER_SOURCE_DIRECTORY/android/app/google-services.json"
fi

if [ ! -z "$GOOGLE_SERVICES_PLIST" ]; then
  echo $GOOGLE_SERVICES_PLIST | base64 --decode > "$APPCENTER_SOURCE_DIRECTORY/ios/Hekla/GoogleService-Info.plist"
fi

for KEY in $(cat .env_example | egrep "^[A-Za-z]+" | sed 's/\"/\\\"/g' | sed -n 's|\(.*\)=\(.*\)|\1|p'); do
  echo "$KEY=$(printf '%s\n' "${!KEY}")" >> "$APPCENTER_SOURCE_DIRECTORY/.env"
done

source "$APPCENTER_SOURCE_DIRECTORY/scripts/build-env.sh"

COMMIT_MESSAGE=$(git log -1 --pretty=%B)

if [[ $COMMIT_MESSAGE != *"[BUILD]"* ]]; then

  npm install -g code-push
  code-push login --accessKey $CODEPUSH_ACCESS_KEY

  if [ -z "$APPCENTER_XCODE_PROJECT"]; then
    code-push release-react $IOS_CODEPUSH_APPID ios --outputDir ./build --plistFile ./ios/Hekla/Info.plist --description "$COMMIT_MESSAGE"
    sentry-cli react-native codepush $IOS_CODEPUSH_APPID ios ./build --bundle-id $IOS_BUNDLE_ID
    APPCENTER_APPID="$IOS_CODEPUSH_APPID"
  fi
  if [ -z "$APPCENTER_ANDROID_VARIANT" ]; then
    code-push release-react $ANDROID_CODEPUSH_APPID android --outputDir build --description "$COMMIT_MESSAGE"
    sentry-cli react-native codepush $ANDROID_CODEPUSH_APPID android ./build --bundle-id $ANDROID_BUNDLE_ID
    APPCENTER_APPID="$ANDROID_CODEPUSH_APPID"
  fi

  curl -X PATCH "https://api.appcenter.ms/v0.1/apps/$APPCENTER_APPID/builds/$APPCENTER_BUILD_ID" -H "accept: application/json" -H "X-API-Token: $APPCENTER_API_KEY" -H "Content-Type: application/json" -d "{ \"status\": \"cancelling\" }"
fi
