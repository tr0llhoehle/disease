package de.tr0llhoehle.disease;

import android.location.Location;
import android.os.Parcel;
import android.os.Parcelable;

/**
 * Implements the records that are send to the server.
 * Created by patrick on 11/29/16.
 */

class Record implements Parcelable {
    Record(Location location) {
        this.timestamp = location.getTime();
        this.lon = location.getLongitude();
        this.lat = location.getLatitude();
        this.speed = location.getSpeed();
        this.bearing = location.getBearing();
        this.accuracy = location.getAccuracy();
    }

    public int describeContents() {
        return 0;
    }

    public void writeToParcel(Parcel dest, int flags) {
        dest.writeLong(timestamp);
        dest.writeDouble(lon);
        dest.writeDouble(lat);
        dest.writeDouble(speed);
        dest.writeDouble(bearing);
        dest.writeDouble(accuracy);
    }

    private Record(Parcel in) {
        timestamp = in.readLong();
        lon = in.readDouble();
        lat = in.readDouble();
        speed = in.readDouble();
        bearing = in.readDouble();
        accuracy = in.readDouble();
    }

    public static final Parcelable.Creator<Record> CREATOR = new Parcelable.Creator<Record>() {
        public Record createFromParcel(Parcel in) {
            return new Record(in);
        }

        public Record[] newArray(int size) {
            return new Record[size];
        }
    };

    public long timestamp;
    public double lon;
    public double lat;
    public double speed;
    public double bearing;
    public double accuracy;
};