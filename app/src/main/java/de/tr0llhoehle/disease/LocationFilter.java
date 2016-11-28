package de.tr0llhoehle.disease;

/**
 * Created by patrick on 11/28/16.
 *
 * Determines if a player is inside a playable area.
 * GameModel uses this class to determine if it should cache/send the state ot the server.
 */

public class LocationFilter {
    // bounding box of Karlsruhe
    private double min_lon = 8.297080993652344;
    private double max_lon = 8.546676635742188;
    private double min_lat = 48.961060302461995;
    private double max_lat = 49.081512108641434;

    public boolean useLocation(double lon, double lat) {
        return lat > min_lat && lat < max_lat && lon > min_lon && lon < max_lon;
    }
}
