package de.tr0llhoehle.disease;

import android.content.SharedPreferences;
import android.provider.Settings;
import android.content.Context;
import android.util.Log;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Handles the app settings.
 * Created by patrick on 11/21/16.
 */

final class SettingsManager {
    private static final boolean STAGYPROD = false;
    private static final String TAG = "SettingsManager";
    public static final String APP_PREFS = "DiseasePrefs";
    private static final String SERVER_STAGING = "http://192.168.178.189:5000";
    private static final String SERVER_PRODUCTION = "https://disease.tr0llhoehle.de:5001";
    SharedPreferences settings;


    SettingsManager(Context context) {
        this.settings = context.getSharedPreferences(APP_PREFS, 0);

        String uid = "0";
        try {
            String android_id = Settings.Secure.getString(context.getContentResolver(), Settings.Secure.ANDROID_ID);
            String shorted_hash = getHash(android_id).substring(0, 8);

            // we save this as string because that is what we will need for queries
            uid = Long.toString(Long.parseLong(shorted_hash, 16));
        } catch (Exception e) {
            e.printStackTrace();
        }


        this.settings.edit()
                     .putString("uid", uid)
                     .putString("server", (BuildConfig.DEBUG && !STAGYPROD)? SERVER_STAGING : SERVER_PRODUCTION)
                     .apply();
    }

    public String getUserId() {
        return this.settings.getString("uid", "0");
    }
    public String getServer() {
        return this.settings.getString("server", "0");
    }

    private String getHash(String input)
            throws NoSuchAlgorithmException, java.io.UnsupportedEncodingException
    {
        MessageDigest md = MessageDigest.getInstance("SHA1");
        md.reset();
        byte[] buffer = input.getBytes("UTF-8");
        md.update(buffer);
        byte[] digest = md.digest();

        String hexStr = "";
        for (int i = 0; i < digest.length; i++) {
            hexStr +=  Integer.toString( ( digest[i] & 0xff ) + 0x100, 16).substring( 1 );
        }
        return hexStr;
    }
}
