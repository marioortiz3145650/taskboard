package com.anonymous.Mobil.avatar
import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.view.View

class AvatarView(context: Context) : View(context) {
    private var name: String = ""
    private val bgPaint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.WHITE
        textAlign = Paint.Align.CENTER
    }

    fun setName(newName: String) { name = newName; invalidate() }

    private fun getInitials(fullName: String): String {
        val parts = fullName.trim().split(" ").filter { it.isNotEmpty() }
        return when {
            parts.isEmpty() -> ""
            parts.size == 1 -> parts[0].take(2).uppercase()
            else -> "${parts[0].first()}${parts.last().first()}".uppercase()
        }
    }

    private fun getColor(fullName: String): Int {
        var hash = 0
        for (c in fullName) hash = fullName.indexOf(c) + ((hash shl 5) - hash)
        val hue = Math.abs(hash % 360).toFloat()
        return Color.HSVToColor(floatArrayOf(hue, 0.65f, 0.45f))
    }

    override fun onDraw(canvas: Canvas) {
        val cx = width / 2f
        val cy = height / 2f
        val radius = minOf(cx, cy)
        bgPaint.color = getColor(name)
        canvas.drawCircle(cx, cy, radius, bgPaint)
        textPaint.textSize = radius * 0.7f
        canvas.drawText(getInitials(name), cx, cy - (textPaint.descent() + textPaint.ascent()) / 2, textPaint)
    }
}
