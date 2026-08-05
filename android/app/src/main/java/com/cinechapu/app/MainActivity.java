package com.cinechapu.app;

import android.app.AlertDialog;
import android.content.DialogInterface;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onBackPressed() {
        // Creamos un cartel de alerta nativo de Android
        new AlertDialog.Builder(this)
                .setTitle("CineChapu")
                .setMessage("¿Querés salir de la aplicación?")
                .setCancelable(false)
                .setPositiveButton("Sí", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        // Si acepta, cerramos la app por completo
                        MainActivity.super.onBackPressed();
                    }
                })
                .setNegativeButton("No", null) // Si cancela, no hace nada y se queda en la app
                .show();
    }
}