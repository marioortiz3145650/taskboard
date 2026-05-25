package com.anonymous.Mobil.camera

import android.app.Activity
import android.content.Intent
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Environment
import android.provider.MediaStore
import androidx.core.content.FileProvider
import com.facebook.react.bridge.*
import java.io.File
import java.text.SimpleDateFormat
import java.util.*
import java.util.Locale

class CameraModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), ActivityEventListener {
    init { reactContext.addActivityEventListener(this) }
    override fun getName() = "CameraModule"
    private var promise: Promise? = null
    private var currentPhotoPath: String? = null
    private val REQUEST_IMAGE_CAPTURE = 2

    @ReactMethod
    fun takePicture(promise: Promise) {
        this.promise = promise
        val activity = reactApplicationContext.currentActivity ?: run { promise.reject("NO_ACTIVITY", "No hay actividad"); return }
        val takePictureIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
        val photoFile: File? = try { createImageFile() } catch (ex: Exception) { promise.reject("FILE_ERROR", ex.message); null }
        if (photoFile != null) {
            val photoURI: Uri = FileProvider.getUriForFile(reactApplicationContext, "${reactApplicationContext.packageName}.fileprovider", photoFile)
            takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, photoURI)
            try { activity.startActivityForResult(takePictureIntent, REQUEST_IMAGE_CAPTURE) } catch (e: Exception) { promise.reject("CAMERA_ERROR", e.message); this.promise = null }
        } else { promise.reject("FILE_NULL", "No se pudo crear el archivo") }
    }

    private fun createImageFile(): File {
        val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
        val storageDir = reactApplicationContext.getExternalFilesDir(Environment.DIRECTORY_PICTURES)
        return File.createTempFile("JPEG_${timeStamp}_", ".jpg", storageDir).apply { currentPhotoPath = absolutePath }
    }

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == REQUEST_IMAGE_CAPTURE && resultCode == Activity.RESULT_OK) {
            val photoPath = currentPhotoPath
            if (photoPath != null) {
                try {
                    val file = File(photoPath)
                    val uri = Uri.fromFile(file)
                    val options = BitmapFactory.Options().apply { inJustDecodeBounds = true }
                    BitmapFactory.decodeFile(photoPath, options)
                    val result = Arguments.createMap()
                    result.putString("uri", uri.toString())
                    result.putString("fileName", file.name)
                    result.putInt("width", options.outWidth)
                    result.putInt("height", options.outHeight)
                    promise?.resolve(result)
                } catch (e: Exception) { promise?.reject("SAVE_ERROR", e.message) }
            } else { promise?.reject("NO_PATH", "Ruta no encontrada") }
        } else if (resultCode == Activity.RESULT_CANCELED) {
            currentPhotoPath?.let { File(it).delete() }
            promise?.reject("CANCELLED", "Cancelado")
        }
        promise = null
        currentPhotoPath = null
    }
    override fun onNewIntent(intent: Intent) {}
}
