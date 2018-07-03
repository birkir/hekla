printenv

brew cask install fastlane

if [ ! -z "$APPCENTER_XCODE_PROJECT"]; then
  cd ios; fastlane appcenter_release; cd -
fi

if [ ! -z "$APPCENTER_ANDROID_VARIANT" ]; then
  cd android; fastlane appcenter_release; cd -
fi


echo "[Environment] Initializing..."

if [ ! -z "$GOOGLE_SERVICES_JSON" ]; then
  echo "[Environment] Creating google-services.json"
  echo $GOOGLE_SERVICES_JSON | base64 --decode > "$APPCENTER_SOURCE_DIRECTORY/android/app/google-services.json"
else
  echo "[Environment] No GOOGLE_SERVICES_JSON in environment variables"
fi

if [ ! -z "$GOOGLE_SERVICES_PLIST" ]; then
  echo "[Environment] Creating GoogleService-Info.plist"
  echo $GOOGLE_SERVICES_PLIST | base64 --decode > "$APPCENTER_SOURCE_DIRECTORY/ios/Hekla/GoogleService-Info.plist"
else
  echo "[Environment] No GOOGLE_SERVICES_PLIST in environment variables"
fi

echo "[Environment] Creating .env file"
for KEY in $(cat .env_example | egrep "^[A-Za-z]+" | sed 's/\"/\\\"/g' | sed -n 's|\(.*\)=\(.*\)|\1|p'); do
  echo "$KEY=$(printf '%s\n' "${!KEY}")" >> "$APPCENTER_SOURCE_DIRECTORY/.env"
done

echo "[Environment] Done"

source "$APPCENTER_SOURCE_DIRECTORY/scripts/build-env.sh"

brew cask install fastlane

if [ ! -z "$APPCENTER_XCODE_PROJECT"]; then
  cd ios; fastlane appcenter_release; cd -
fi

if [ ! -z "$APPCENTER_ANDROID_VARIANT" ]; then
  cd android; fastlane appcenter_release; cd -
fi
