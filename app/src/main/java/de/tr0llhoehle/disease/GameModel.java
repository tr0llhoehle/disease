package de.tr0llhoehle.disease;

import android.location.Location;
import android.content.Context;
import android.util.Log;

import com.google.gson.*;
import com.koushikdutta.async.future.FutureCallback;
import com.koushikdutta.ion.Ion;

import org.json.JSONObject;

import java.util.ArrayList;

/**
 * Captures the complete state of the game;
 * Created by patrick on 11/21/16.
 */

class GameModel {
    private static final int SYNC_INTERVAL = 0;
    private Context context;
    private String server;
    private String user_id;
    private ArrayList<State> states_to_sync;
    private State current_state;
    private static final String TAG = "GameModel";
    private LocationFilter filter;

    class State {
        State(long timestamp, double lon, double lat, double speed, double bearing, double accuracy, boolean valid) {
            this.timestamp = timestamp;
            this.lon = lon;
            this.lat = lat;
            this.speed = speed;
            this.bearing = bearing;
            this.accuracy = accuracy;
            this.valid = valid;
        }

        public long timestamp;
        public double lon;
        public double lat;
        public double speed;
        public double bearing;
        public double accuracy;
        public boolean valid;
    };

    GameModel(Context context, String server, String user_id) {
        this.server = server;
        this.context = context;
        this.user_id = user_id;
        this.filter = new LocationFilter();
        this.states_to_sync = new ArrayList<>();
    }

    private void syncState() {
        if (states_to_sync.size() == 0) return;

        State last_state = states_to_sync.get(states_to_sync.size() - 1);
        if (System.currentTimeMillis() - last_state.timestamp < SYNC_INTERVAL)
            return;

        JsonObject json = new JsonObject();
        JsonArray records = new JsonArray();
        json.add("records", records);

        Gson gson = new GsonBuilder().create();

        for (State state : states_to_sync) {
            JsonObject record  = new JsonObject();
            record.add("lon", gson.toJsonTree(state.lon));
            record.add("lat", gson.toJsonTree(state.lat));
            record.add("timestamp", gson.toJsonTree(state.timestamp));
            record.add("speed", gson.toJsonTree(state.speed));
            record.add("bearing", gson.toJsonTree(state.bearing));
            record.add("accuracy", gson.toJsonTree(state.accuracy));
            records.add(record);
        }
        states_to_sync.clear();

        String query = this.server + "/update/v2/" + user_id;

        Log.d(TAG, query);

        Ion.with(this.context)
                .load(query)
                .setJsonObjectBody(json)
                .asJsonObject()
                .setCallback(new FutureCallback<JsonObject>() {
                    @Override
                    public void onCompleted(Exception e, JsonObject result) {
                        if (e != null) {
                            e.printStackTrace();
                            return;
                        }
                        // todo update internal state to server state
                    }
                });
    }

    public synchronized void setLocation(Location location) {
        boolean valid = filter.useLocation(location.getLongitude(), location.getLatitude());

        this.current_state = new State(location.getTime(), location.getLongitude(),
                    location.getLatitude(), location.getSpeed(), location.getBearing(),
                    location.getAccuracy(), valid);
        if (valid) {
            states_to_sync.add(this.current_state);
        } else {
            Log.d(TAG, "Filtering location");
        }
        syncState();
    }

    public synchronized State getState() {
        return current_state;
    }

    public String getServer() {
        return server;
    }

    public String getUser_id() {
        return user_id;
    }
}
