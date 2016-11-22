package de.tr0llhoehle.disease;

import android.location.Location;
import android.content.Context;

import com.google.gson.*;
import com.koushikdutta.async.future.FutureCallback;
import com.koushikdutta.ion.Ion;

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

    class State {
        State(long timestamp, double lon, double lat) {
            this.timestamp = timestamp;
            this.lon = lon;
            this.lat = lat;
        }

        public long timestamp;
        public double lon;
        public double lat;
    };

    GameModel(Context context, String server, String user_id) {
        this.server = server;
        this.context = context;
        this.user_id = user_id;
        this.states_to_sync = new ArrayList<>();
    }

    private void syncState() {
        if (states_to_sync.size() == 0) return;

        State last_state = states_to_sync.get(states_to_sync.size() - 1);
        if (System.currentTimeMillis() - last_state.timestamp < SYNC_INTERVAL)
            return;

        JsonObject json = new JsonObject();
        JsonObject update = new JsonObject();
        JsonArray records = new JsonArray();

        json.add("update", update);
        update.add("records", records);

        Gson gson = new GsonBuilder().create();

        for (State state : states_to_sync) {
            JsonArray record  = new JsonArray();
            gson.toJson(gson.toJsonTree(state.lon));
            gson.toJson(gson.toJsonTree(state.lat));
            gson.toJson(gson.toJsonTree(state.timestamp));
            records.add(record);
        }
        states_to_sync.clear();

        Ion.with(this.context)
                .load(this.server + "update/v1/" + user_id)
                .setJsonObjectBody(json)
                .asJsonObject()
                .setCallback(new FutureCallback<JsonObject>() {
                    @Override
                    public void onCompleted(Exception e, JsonObject result) {
                        // todo update internal state to server state
                    }
                });
    }

    public synchronized void setLocation(Location location) {
        this.current_state = new State(location.getTime(), location.getLongitude(), location.getLatitude());
        states_to_sync.add(this.current_state);
        syncState();
    }

    public synchronized State getState() {
        return current_state;
    }
}
