package com.github.bordertech.wcomponents.render.webxml;

import com.github.bordertech.wcomponents.Renderer;
import com.github.bordertech.wcomponents.WComponent;
import com.github.bordertech.wcomponents.WPopup;
import com.github.bordertech.wcomponents.XmlStringBuilder;
import com.github.bordertech.wcomponents.servlet.WebXmlRenderContext;
import com.github.bordertech.wcomponents.util.Util;

/**
 * The {@link Renderer} for {@link WPopup}.
 *
 * @author Jonathan Austin
 * @since 1.0.0
 */
final class WPopupRenderer extends AbstractWebXmlRenderer {

	public static final String TAG_NAME = "wc-popup";

	/**
	 * Paints the given WPopup.
	 *
	 * @param component the WPopup to paint.
	 * @param renderContext the RenderContext to paint to.
	 */
	@Override
	public void doRender(final WComponent component, final WebXmlRenderContext renderContext) {
		WPopup popup = (WPopup) component;
		XmlStringBuilder xml = renderContext.getWriter();
		int width = popup.getWidth();
		int height = popup.getHeight();
		String targetWindow = popup.getTargetWindow();

		xml.appendTagOpen(TAG_NAME);
		xml.appendUrlAttribute("url", popup.getUrl());
		xml.appendOptionalAttribute("width", width > 0, width);
		xml.appendOptionalAttribute("height", height > 0, height);
		xml.appendOptionalAttribute("resizable", popup.isResizable(), "true");
		xml.appendOptionalAttribute("scrollbars", popup.isScrollable(), "true");
		xml.appendOptionalAttribute("target", !Util.empty(targetWindow), targetWindow);
		xml.appendClose();
		xml.appendEndTag(TAG_NAME);
	}
}
