# Cancel builds with [skip ci] as AppCenter's Build Machines don't currently do this.
COMMIT_MESSAGE=$(git log -1 --pretty=%B)

if [[ $COMMIT_MESSAGE = *"[skip ci]"* ]]; then

  if [ -z "$APPCENTER_XCODE_PROJECT"]; then
    APPCENTER_APPID="$IOS_CODEPUSH_APPID"
  fi

  if [ -z "$APPCENTER_ANDROID_VARIANT" ]; then
    APPCENTER_APPID="$ANDROID_CODEPUSH_APPID"
  fi

  curl -X PATCH "https://api.appcenter.ms/v0.1/apps/$APPCENTER_APPID/builds/$APPCENTER_BUILD_ID" -H "accept: application/json" -H "X-API-Token: $APPCENTER_API_KEY" -H "Content-Type: application/json" -d "{ \"status\": \"cancelling\" }"
fi
