package de.tr0llhoehle.disease;

import com.google.android.gms.common.api.GoogleApiClient;

import android.app.Service;
import android.content.Intent;
import android.os.IBinder;

public class LocationTracker extends Service {
    private GoogleApiClient googleClient;

    public LocationTracker() {
        this.googleClient = new GoogleApiClient.Builder(this).addApi()
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

}
