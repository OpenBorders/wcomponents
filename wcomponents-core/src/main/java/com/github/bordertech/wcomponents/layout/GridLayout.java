package com.github.bordertech.wcomponents.layout;

import com.github.bordertech.wcomponents.util.GapSizeUtil;

/**
 * GridLayout is a {@link LayoutManager} that emulates {@link java.awt.GridLayout}.
 *
 * @author Yiannis Paschalidis
 * @author Mark Reeves
 * @since 1.0.0
 */
public class GridLayout implements LayoutManager {

	/**
	 * The number of rows, or 0 for a dynamic number of rows based on the number of components and columns.
	 */
	private final int rows;

	/**
	 * The number of columns, or 0 for a dynamic number of columns based on the number of components and columns.
	 */
	private final int cols;

	/**
	 * The horizontal gap between the columns, measured in pixels.
	 */
	private final GapSizeUtil.Size hgap;

	/**
	 * The vertical gap between the rows, measured in pixels.
	 */
	private final GapSizeUtil.Size vgap;

	/**
	 * Creates a grid layout with the specified number of rows and columns.
	 * <p>
	 * One, but not both, of <code>rows</code> and <code>cols</code> can be zero, which means that any number of objects
	 * can be placed in a row or in a column.
	 *
	 * @param rows the rows, with the value zero meaning any number of rows.
	 * @param cols the columns, with the value zero meaning any number of columns.
	 */
	public GridLayout(final int rows, final int cols) {
		this(rows, cols, null, null);
	}

	/**
	 * Creates a grid layout with the specified number of rows and columns and spacing.
	 *
	 * @param rows the rows, with the value zero meaning any number of rows
	 * @param cols the columns, with the value zero meaning any number of columns
	 * @param hgap the horizontal gap between the columns, measured in pixels
	 * @param vgap the vertical gap between the rows, measured in pixels
	 *
	 * @deprecated use {@link #GridLayout(int, int, GapSizeUtil.Size, GapSizeUtil.Size)}
	 */
	@Deprecated
	public GridLayout(final int rows, final int cols, final int hgap, final int vgap) {
		this(rows, cols, GapSizeUtil.intToSize(hgap), GapSizeUtil.intToSize(vgap));
	}
	/**
	 * Creates a grid layout with the specified number of rows and columns.
	 * <p>
	 * In addition, the horizontal and vertical gaps are set to the specified values. Horizontal gaps are placed between each of the columns. Vertical
	 * gaps are placed  between each of the rows.
	 * <p>
	 * One, but not both, of <code>rows</code> and <code>cols</code> can be zero, which means that any number of objects can be placed in a row or in
	 * a column.
	 * <p>
	 * All <code>GridLayout</code> constructors defer to this one.
	 *
	 * @param rows the rows, with the value zero meaning any number of rows
	 * @param cols the columns, with the value zero meaning any number of columns
	 * @param hgap the horizontal gap between the columns, measured in pixels.
	 * @param vgap the vertical gap between the rows, measured in pixels.
	 */
	public GridLayout(final int rows, final int cols, final GapSizeUtil.Size hgap, final GapSizeUtil.Size vgap) {
		if (rows < 0) {
			throw new IllegalArgumentException("Rows must be greater than or equal to zero");
		}

		if (cols < 0) {
			throw new IllegalArgumentException("Cols must be greater than or equal to zero");
		}

		if (rows == 0 && cols == 0) {
			throw new IllegalArgumentException("One of rows or cols must be greater than zero");
		}

		this.rows = rows;
		this.cols = cols;
		this.hgap = hgap;
		this.vgap = vgap;
	}

	/**
	 * @return the horizontal gap between the cells
	 */
	public GapSizeUtil.Size getHorizontalGap() {
		return hgap;
	}

	/**
	 * @return the vertical gap between the cells
	 */
	public GapSizeUtil.Size getVerticalGap() {
		return vgap;
	}

	/**
	 * @return the horizontal gap between the cells measured in pixels
	 */
	@Deprecated
	public int getHgap() {
		return GapSizeUtil.sizeToInt(hgap);
	}

	/**
	 * @return the vertical gap between the cells measured in pixels
	 */
	@Deprecated
	public int getVgap() {
		return GapSizeUtil.sizeToInt(vgap);
	}

	/**
	 * @return the number of rows, or 0 for a dynamic number of rows based on the number of components and columns.
	 */
	public int getRows() {
		return rows;
	}

	/**
	 * @return the number of columns, or 0 for a dynamic number of column based on the number of components and rows.
	 */
	public int getCols() {
		return cols;
	}
}
