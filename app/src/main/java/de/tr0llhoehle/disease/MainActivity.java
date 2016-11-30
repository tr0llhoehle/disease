package de.tr0llhoehle.disease;

import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.Camera;
import android.os.Handler;
import android.support.v4.content.LocalBroadcastManager;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.Window;
import android.view.WindowManager;
import android.view.Surface;
import android.view.View;
import android.widget.TextView;

import android.app.Activity;
import android.os.Bundle;
import android.os.Build;
import android.util.Log;

import java.util.List;

public class MainActivity extends Activity implements SurfaceHolder.Callback {
    static final String TAG = "MainActivity";
    Camera camera;
    SurfaceView preview;
    GameModel model = new GameModel();
    Handler handler = new Handler();
    SettingsManager settings;

    private void setCameraDisplayOrientation() {
        android.hardware.Camera.CameraInfo info =
                new android.hardware.Camera.CameraInfo();
        android.hardware.Camera.getCameraInfo(0, info);
        int rotation = this.getWindowManager().getDefaultDisplay()
                .getRotation();
        int degrees = 0;
        switch (rotation) {
            case Surface.ROTATION_0: degrees = 0; break;
            case Surface.ROTATION_90: degrees = 90; break;
            case Surface.ROTATION_180: degrees = 180; break;
            case Surface.ROTATION_270: degrees = 270; break;
        }

        int result;
        if (info.facing == Camera.CameraInfo.CAMERA_FACING_FRONT) {
            result = (info.orientation + degrees) % 360;
            result = (360 - result) % 360;  // compensate the mirror
        } else {  // back-facing
            result = (info.orientation - degrees + 360) % 360;
        }
        camera.setDisplayOrientation(result);
    }

    private void tryInitializingCamera(boolean retry) {
        if (camera == null) {
            try {
                camera = Camera.open();
                setCameraDisplayOrientation();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        try {
            camera.startPreview();
        }catch (Exception e) {
            camera = null;
            if (retry)
                tryInitializingCamera(false);
        }
    }

    public void changeCameraEffect(View view) {
        Camera.Parameters params;
        params = camera.getParameters();

        if(params.getColorEffect().equals(Camera.Parameters.EFFECT_SEPIA)) {
            params.setColorEffect(Camera.Parameters.EFFECT_NONE);
        } else {
            params.setColorEffect(Camera.Parameters.EFFECT_SEPIA);
        }
        camera.setParameters(params);
    }

    Runnable refreshDebugDisplay = new Runnable() {
        @Override
        public void run() {
            try {
                TextView text = (TextView)findViewById(R.id.debug_display);
                Player player = model.getPlayer();
                Player[] other = model.getOther();

                long timeDiff = (System.currentTimeMillis() - player.last_timestamp) / 1000;
                text.setText("Server: " + settings.getServer() + "\n" +
                        "UserID: " + settings.getUserId() + "\n" +
                        "Other players: " + (other == null ? 0 : other.length) + "\n" +
                        "Lat: " + player.lat + "\n" +
                        "Lon: " + player.lon + "\n" +
                        "Updated : " + timeDiff + "s ago\n");
            } finally {
                handler.postDelayed(refreshDebugDisplay, 1000);
            }
        }
    };

    public void toggleDebugDisplay(View view) {
        TextView text = (TextView)findViewById(R.id.debug_display);

        if(text.getVisibility() == View.GONE) {
            refreshDebugDisplay.run();
            text.setVisibility(View.VISIBLE);
        } else {
            handler.removeCallbacks(refreshDebugDisplay);
            text.setVisibility(View.GONE);
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN);
        setContentView(R.layout.activity_main);

        preview = (SurfaceView) findViewById(R.id.preview);
        preview.getHolder().addCallback(this);

        if(Build.VERSION.SDK_INT < Build.VERSION_CODES.HONEYCOMB) {
            preview.getHolder().setType(SurfaceHolder.SURFACE_TYPE_PUSH_BUFFERS);
        }

        tryInitializingCamera(true);
        startService(new Intent(this, LocationTracker.class));
        LocalBroadcastManager manager = LocalBroadcastManager.getInstance(getApplicationContext());
        manager.registerReceiver(model, new IntentFilter(LocationTracker.UPDATE_RECORD));
        manager.registerReceiver(model, new IntentFilter(SyncService.NEW_REMOTE_STATE));
        settings = new SettingsManager(getApplicationContext());
    }

    @Override
    public void onResume() {
        super.onResume();
        tryInitializingCamera(true);
        preview.setVisibility(View.VISIBLE);
    }

    @Override
    public void onPause() {
        super.onPause();
        preview.setVisibility(View.GONE);
        if (camera != null) {
            camera.stopPreview();
            camera.release();
            camera = null;
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (camera != null) {
            camera.release();
            camera = null;
        }
        handler.removeCallbacks(refreshDebugDisplay);
    }

    @Override
    public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
        if (camera != null) {
            Camera.Parameters params;
            params = camera.getParameters();

            List<Camera.Size> sizes;
            sizes = params.getSupportedPreviewSizes();
            Camera.Size selected = sizes.get(0);
            params.setPreviewSize(selected.width, selected.height);
            camera.setParameters(params);

            camera.startPreview();
        }
    }

    @Override
    public void surfaceCreated(SurfaceHolder holder) {
        try {
            if (camera != null) {
                camera.setPreviewDisplay(preview.getHolder());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void surfaceDestroyed(SurfaceHolder holder) {
    }
}
