package de.tr0llhoehle.disease;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.LocationListener;

import android.util.Log;
import android.app.Service;
import android.content.Intent;
import android.location.Location;
import android.os.HandlerThread;
import android.os.IBinder;
import android.os.Bundle;

public class LocationTracker extends Service implements GoogleApiClient.ConnectionCallbacks, GoogleApiClient.OnConnectionFailedListener, LocationListener {
    // all values in milliseconds
    private static final int UPDATE_INTERVAL = 1000;
    private static final int FASTEST_UPDATE_INTERVAL = 100;
    private static final String TAG = "LocationTracker";

    private GoogleApiClient googleClient;
    private HandlerThread locationHandlerThread;
    private SettingsManager settings;
    private GameModel model;

    public LocationTracker() {
    }

    private void initializeGoogle() {
        this.googleClient = new GoogleApiClient.Builder(this)
                .addApi(LocationServices.API)
                .addConnectionCallbacks(this)
                .addOnConnectionFailedListener(this)
                .build();

        this.googleClient.connect();
    }

    @Override
    public void onCreate() {
        settings = new SettingsManager(getApplicationContext());
        model = new GameModel(getApplicationContext(), "http://tr0llhoehle.de:5000", settings.getUserId());
    }

    @Override
    public synchronized void onLocationChanged(Location location) {
        this.model.setLocation(location);
    }

    @Override
    public synchronized void onConnectionFailed(ConnectionResult result) {
        Log.w(TAG, "Connection to google client failed");
    }

    @Override
    public synchronized void onConnected(Bundle bundle) {
        locationHandlerThread = new HandlerThread("LocationTrackerHandler", android.os.Process.THREAD_PRIORITY_BACKGROUND);
        locationHandlerThread.start();

        LocationRequest req;
        req = new LocationRequest();
        req.setInterval(UPDATE_INTERVAL);
        req.setFastestInterval(FASTEST_UPDATE_INTERVAL);

        LocationServices.FusedLocationApi.requestLocationUpdates(googleClient, req, this, locationHandlerThread.getLooper());
    }

    @Override
    public synchronized void onConnectionSuspended(int value) {
        if (googleClient != null) {
            googleClient.connect();
        }
    }

    @Override
    public synchronized IBinder onBind(Intent intent) {
        if (googleClient == null) initializeGoogle();
        return null;
    }

    @Override
    public synchronized int onStartCommand(Intent intent, int flags, int startId) {
        if (googleClient == null) initializeGoogle();
        return START_STICKY;
    }

}
