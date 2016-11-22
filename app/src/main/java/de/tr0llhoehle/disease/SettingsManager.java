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
    private static final String TAG = "SettingsManager";
    public static final String APP_PREFS = "DiseasePrefs";
    SharedPreferences settings;


    SettingsManager(Context context) {
        this.settings = context.getSharedPreferences(APP_PREFS, 0);

        String uid = this.settings.getString("uid", "");
        if (uid.equals("")) {
            try {
                String shorted_hash = getHash(Settings.Secure.ANDROID_ID).substring(0, 8);

                // we save this as string because that is what we will need for queries
                uid = Long.toString(Long.parseLong(shorted_hash, 16));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        this.settings.edit()
                     .putString("uid", uid)
                     .apply();
    }

    public String getUserId() {
        return this.settings.getString("uid", "");
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
