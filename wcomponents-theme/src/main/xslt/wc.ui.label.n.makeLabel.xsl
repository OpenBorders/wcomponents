<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:ui="https://github.com/bordertech/wcomponents/namespace/ui/v1.0" 
	xmlns:html="http://www.w3.org/1999/xhtml" version="2.0">
	<xsl:import href="wc.common.accessKey.xsl"/>
	<xsl:import href="wc.ui.label.n.labelClassHelper.xsl"/>
	<xsl:import href="wc.ui.label.n.labelCommonAttributes.xsl"/>
	<xsl:import href="wc.ui.label.n.labelHintHelper.xsl"/>
	<xsl:import href="wc.common.offscreenSpan.xsl"/>

	<!--
		Basic helper template to make a label for a labelable element.

		In the past this template and the template now called makeFauxLabel
		were part of the transfrom of ui:label. This lead to a lot of complex
		template switching and retesting.

		By splitting the templates out and setting up a few common helpers we
		have a little bit of XSLT redundancy but the number of computations
		of labelled element and element types is significantly reduced.

		This has lead to a bit of a performance gain in the XLST Processor phase
		but more importantly has made the label transform much easier to maintain
		by making it almost intelligible.

		param labelableElement: the element the label is 'for' this is
		pre-calculated before calling this template so can never be null and is
		always a component which transforms to a labellable element.

		param style: passed in ultimately from the transform for ui:field. See
		wc.ui.field.xsl.
	-->
	<xsl:template name="makeLabel">
		<xsl:param name="labelableElement"/>

		<xsl:variable name="readOnly">
			<xsl:choose>
				<xsl:when test="$labelableElement/@readOnly">
					<xsl:number value="1"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:number value="0"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

		<xsl:variable name="elementType">
			<xsl:choose>
				<xsl:when test="number($readOnly) eq 1">
					<xsl:text>span</xsl:text>
				</xsl:when>
				<xsl:otherwise>
					<xsl:text>label</xsl:text>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

		<xsl:element name="{$elementType}">
			<xsl:call-template name="labelCommonAttributes">
				<xsl:with-param name="element" select="$labelableElement"/>
			</xsl:call-template>

			<xsl:choose>
				<xsl:when test="$elementType eq 'label'">
					<xsl:if test="@for and @for ne ''"><!-- this is an explicit 'for' and not for implied by nesting -->
						<xsl:attribute name="for">
							<xsl:value-of select="@for"/>
							<xsl:if test="local-name($labelableElement) eq 'datefield' or 
								local-name($labelableElement) eq 'textfield' or 
								local-name($labelableElement) eq 'emailfield' or 
								local-name($labelableElement) eq 'phonenumberfield'">
								<xsl:text>_input</xsl:text>
							</xsl:if>
						</xsl:attribute>
					</xsl:if>
				</xsl:when>
				<xsl:otherwise>
					<xsl:attribute name="data-wc-rofor">
						<xsl:value-of select="@for"/>
					</xsl:attribute>
				</xsl:otherwise>
			</xsl:choose>

			<xsl:call-template name="labelClassHelper">
				<xsl:with-param name="element" select="$labelableElement"/>
				<xsl:with-param name="readOnly" select="$readOnly"/>
			</xsl:call-template>

			<xsl:if test="$elementType eq 'label'">
				<xsl:call-template name="accessKey"/>
			</xsl:if>

			<xsl:apply-templates/>

			<xsl:if test="$elementType eq 'label' and $labelableElement/@required">
				<xsl:call-template name="offscreenSpan">
					<xsl:with-param name="text">
						<xsl:text>{{t 'requiredPlaceholder'}}</xsl:text>
					</xsl:with-param>
				</xsl:call-template>
			</xsl:if>

			<xsl:call-template name="labelHintHelper">
				<xsl:with-param name="element" select="$labelableElement"/>
				<xsl:with-param name="readOnly" select="$readOnly"/>
			</xsl:call-template>
		</xsl:element>
	</xsl:template>
</xsl:stylesheet>
