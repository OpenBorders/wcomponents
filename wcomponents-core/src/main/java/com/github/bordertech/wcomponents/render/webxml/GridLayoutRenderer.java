package com.github.bordertech.wcomponents.render.webxml;

import com.github.bordertech.wcomponents.Renderer;
import com.github.bordertech.wcomponents.WComponent;
import com.github.bordertech.wcomponents.WPanel;
import com.github.bordertech.wcomponents.XmlStringBuilder;
import com.github.bordertech.wcomponents.layout.GridLayout;
import com.github.bordertech.wcomponents.servlet.WebXmlRenderContext;
import com.github.bordertech.wcomponents.util.GapSizeUtil;

/**
 * This {@link Renderer} renders the children of a {@link WPanel} which have been arranged using a {@link GridLayout}.
 *
 * @author Yiannis Paschalidis
 * @author Mark Reeves
 * @since 1.0.0
 */
final class GridLayoutRenderer extends AbstractWebXmlRenderer {

	/**
	 * Paints the given WPanel's children.
	 *
	 * @param component the container to paint.
	 * @param renderContext the RenderContext to paint to.
	 */
	@Override
	public void doRender(final WComponent component, final WebXmlRenderContext renderContext) {
		WPanel panel = (WPanel) component;
		XmlStringBuilder xml = renderContext.getWriter();
		GridLayout layout = (GridLayout) panel.getLayout();
		GapSizeUtil.Size hgap = layout.getHorizontalGap();
		String hgapString = hgap == null ? null : hgap.toString();
		GapSizeUtil.Size vgap = layout.getVerticalGap();
		String vgapString = vgap == null ? null : vgap.toString();
		int rows = layout.getRows();
		int cols = layout.getCols();

		xml.appendTagOpen("ui:gridlayout");

		xml.appendAttribute("rows", rows > 0 ? String.valueOf(rows) : "0");
		xml.appendAttribute("cols", cols > 0 ? String.valueOf(cols) : "0");
		xml.appendOptionalAttribute("hgap", hgapString);
		xml.appendOptionalAttribute("vgap", vgapString);

		xml.appendClose();

		int size = panel.getChildCount();

		for (int i = 0; i < size; i++) {
			xml.appendTag("ui:cell");
			WComponent child = panel.getChildAt(i);
			child.paint(renderContext);
			xml.appendEndTag("ui:cell");
		}

		xml.appendEndTag("ui:gridlayout");
	}
}
