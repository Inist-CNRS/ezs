<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:param name="prefix" select="string('~')" />
    <xsl:template match="@*|node()">
        <xsl:copy>
            <xsl:value-of select="$prefix" />
            <xsl:apply-templates select="@*|node()"/>
        </xsl:copy>
    </xsl:template>
</xsl:stylesheet>
