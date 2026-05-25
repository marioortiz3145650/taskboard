package com.anonymous.Mobil.avatar
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
class AvatarViewManager : SimpleViewManager<AvatarView>() {
    override fun getName() = "AvatarView"
    override fun createViewInstance(context: ThemedReactContext) = AvatarView(context)
    @ReactProp(name = "name")
    fun setName(view: AvatarView, name: String) { view.setName(name) }
}
