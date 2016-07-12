package com.github.bordertech.wcomponents.test.selenium;

import com.github.bordertech.wcomponents.ComponentWithContext;
import com.github.bordertech.wcomponents.UIContext;
import com.github.bordertech.wcomponents.UIContextHolder;
import com.github.bordertech.wcomponents.WComponent;
import com.github.bordertech.wcomponents.util.TreeUtil;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebElement;

/**
 * <p>
 * An implementation of By which can find HTML elements which correspond to
 * (most) WComponents. Only WComponents which emit elements with ids can be
 * searched on. This means that components such as WText and "WComponent" itself
 * can not be used in a search path.</p>
 *
 * <p>
 * <b>Note:</b> Since there's no mapping from XHTML to the WComponent XML
 * schema, this {@link By} implementation will always search from the root
 * component, no matter what the search context is.</p>
 *
 * <p>
 * See {@link TreeUtil#findWComponents(WComponent, String[])} for details on the
 * path syntax.</p>
 *
 * @author Yiannis Paschalidis
 * @since 1.0.0
 */
public class ByWComponentPath extends ByWComponent {

	/**
	 * The component to search for.
	 */
	private final String[] path;

	/**
	 * The class of the WComponent which was found (if any).
	 */
	private Class<? extends WComponent> componentClass;

	/**
	 * Creates a ByWComponentPath which searches for a path to a component.
	 *
	 * @param componentWithContext the component to search for.
	 * @param path the path to traverse.
	 */
	public ByWComponentPath(final ComponentWithContext componentWithContext, final String path) {
		this(componentWithContext.getComponent(), componentWithContext.getContext(), path);
	}

	/**
	 * Creates a ByWComponentPath which searches for a path to a component.
	 *
	 * @param component the component instance to search for.
	 * @param path the path to traverse.
	 */
	public ByWComponentPath(final WComponent component, final String path) {
		this(component, null, path);
	}

	/**
	 * Creates a ByWComponentPath which searches for a path to a component.
	 *
	 * @param component the component instance to search for.
	 * @param context the context to search in, use null for the default
	 * context.
	 * @param path the path to traverse.
	 */
	public ByWComponentPath(final WComponent component, final UIContext context, final String path) {
		this(component, context, path, null);
	}

	/**
	 * Creates a ByWComponentPath which searches for a path to a component.
	 *
	 * @param component the component instance to search for.
	 * @param context the context to search in, use null for the default
	 * context.
	 * @param path the path to traverse.
	 * @param value If not null, narrow the search by value for e.g. list or
	 * drop-down entries.
	 */
	public ByWComponentPath(final WComponent component, final UIContext context, final String path,
			final Object value) {
		super(component, context, value);
		this.path = path.split("/");
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public List<WebElement> findElements(final SearchContext searchContext) {
		List<WebElement> result = new ArrayList<>();
		ComponentWithContext[] components = null;

		UIContextHolder.pushContext(getContext());

		try {
			components = TreeUtil.findWComponents(getComponent(), path);
		} finally {
			UIContextHolder.popContext();
		}

		if (components.length != 0) {
			componentClass = components[0].getComponent().getClass();
		}

		for (ComponentWithContext comp : components) {
			WComponent cmp = comp.getComponent();
			UIContext cmpUic = comp.getContext();
			UIContextHolder.pushContext(cmpUic);

			List<WebElement> resultForComp = findElement(searchContext, cmpUic, cmp, getValue());

			result.addAll(resultForComp);
		}

		return result;
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public String toString() {
		return "ByWComponentPath:" + Arrays.asList(path)
				+ (getValue() == null ? "" : (" with value \"" + getValue() + '"'));
	}

	/**
	 * @return the class of the target WComponent
	 */
	@Override
	public Class<? extends WComponent> getTargetWComponentClass() {
		return componentClass;
	}
}
