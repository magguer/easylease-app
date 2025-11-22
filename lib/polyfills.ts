import { Platform } from 'react-native';

if (Platform.OS !== 'web') {
    // Polyfill for matchMedia to suppress warnings
    // @ts-ignore
    global.matchMedia = global.matchMedia || function (media) {
        return {
            matches: false,
            addListener: function () { },
            removeListener: function () { },
        };
    };
}
