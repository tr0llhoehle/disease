package de.tr0llhoehle.disease;

import android.hardware.Camera;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.Window;
import android.view.WindowManager;

import android.app.Activity;
import android.os.Bundle;
import android.os.Build;

import java.util.List;

public class MainActivity extends Activity implements SurfaceHolder.Callback{
    Camera camera;
    SurfaceView preview;

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

        try {
            camera = Camera.open();
        } catch (Exception e) {
            e.printStackTrace();
        }
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
