package com.github.bordertech.wcomponents.render.webxml;

import com.github.bordertech.wcomponents.Input;
import com.github.bordertech.wcomponents.Labelable;
import com.github.bordertech.wcomponents.WComponent;
import com.github.bordertech.wcomponents.WLabel;
import com.github.bordertech.wcomponents.XmlStringBuilder;
import com.github.bordertech.wcomponents.servlet.WebXmlRenderContext;
import com.github.bordertech.wcomponents.util.Util;
import com.github.bordertech.wcomponents.MultiInputComponent;

/**
 * The Renderer for {@link WLabel}.
 *
 * @author Jonathan Austin
 * @since 1.0.0
 */
final class WLabelRenderer extends AbstractWebXmlRenderer {

	/**
	 * Paints the given {@link WLabel}.
	 *
	 * @param component the WLabel to paint.
	 * @param renderContext the RenderContext to paint to.
	 */
	@Override
	public void doRender(final WComponent component, final WebXmlRenderContext renderContext) {
		WLabel label = (WLabel) component;
		XmlStringBuilder xml = renderContext.getWriter();

		xml.appendTagOpen("ui:label");
		xml.appendAttribute("id", component.getId());
		xml.appendOptionalAttribute("class", component.getHtmlClass());
		xml.appendOptionalAttribute("track", component.isTracking(), "true");
		xml.appendOptionalAttribute("for", label.getLabelFor());

		WComponent what = label.getForComponent();
		String whatFor = null;
		if (what instanceof MultiInputComponent) {
			whatFor = "group";
		} else if (what instanceof Labelable) {
			whatFor = "input";
		}

		xml.appendOptionalAttribute("what", whatFor);
		xml.appendOptionalAttribute("readonly", ((what instanceof Input) && ((Input) what).isReadOnly()), "true");
		xml.appendOptionalAttribute("required", ((what instanceof Input) && ((Input) what).isMandatory()), "true");
		xml.appendOptionalAttribute("hiddencomponent", (what != null && what.isHidden()), "true");
		xml.appendOptionalAttribute("hint", label.getHint());
		xml.appendOptionalAttribute("accessKey", Util.upperCase(label.getAccessKeyAsString()));
		xml.appendOptionalAttribute("hidden", label.isHidden(), "true");
		xml.appendOptionalAttribute("toolTip", label.getToolTip());
		xml.appendOptionalAttribute("accessibleText", label.getAccessibleText());
		xml.appendClose();

		xml.append(label.getText(), label.isEncodeText());

		paintChildren(label, renderContext);

		xml.appendEndTag("ui:label");
	}

}
