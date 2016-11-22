package de.tr0llhoehle.disease;

import android.content.Intent;
import android.hardware.Camera;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.Window;
import android.view.WindowManager;
import android.view.Surface;
import android.content.SharedPreferences;

import android.app.Activity;
import android.os.Bundle;
import android.os.Build;
import android.provider.Settings.Secure;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;

public class MainActivity extends Activity implements SurfaceHolder.Callback {

    Camera camera;
    SurfaceView preview;

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

    private void tryInitializingCamera() {
        if (camera == null) {
            try {
                camera = Camera.open();
            } catch (Exception e) {
                e.printStackTrace();
            }

            setCameraDisplayOrientation();
        }
        camera.startPreview();
    }



    private void initializeSettings() {

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

        tryInitializingCamera();
        initializeSettings();

        startService(new Intent(this, LocationTracker.class));
    }

    @Override
    public void onResume() {
        super.onResume();
        tryInitializingCamera();
    }

    @Override
    public void onPause() {
        super.onPause();
        if (camera != null) {
            camera.stopPreview();
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (camera != null) {
            camera.release();
        }
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
            camera.setPreviewDisplay(preview.getHolder());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void surfaceDestroyed(SurfaceHolder holder) {
    }
}
