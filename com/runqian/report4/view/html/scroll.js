function _reportScroll( name ) {
	var contentDiv = document.getElementById( name + "_contentdiv" );
	var topDiv = document.getElementById( name + "_topdiv" );
	if( topDiv != null ) topDiv.scrollLeft = contentDiv.scrollLeft;
	var leftDiv = document.getElementById( name + "_leftdiv" );
	if( leftDiv != null ) leftDiv.scrollTop = contentDiv.scrollTop;
	try { _initInput.toString(); }catch( e ) { return; }
	
	var otherTable = document.getElementById( name + "_$_top" );
	if( otherTable != null ) _tableScrolling( otherTable );
	otherTable = document.getElementById( name + "_$_left" );
	if( otherTable != null ) _tableScrolling( otherTable );
	otherTable = document.getElementById( name );
	if( otherTable != null ) _tableScrolling( otherTable );
}

function _tableScrolling( table ) {
	var editor = table.currEditor;
	if( editor == null ) return;
	var cell = editor.editingCell;
	var x = cell.offsetLeft, y = cell.offsetTop;
	var obj = cell.offsetParent;
	var offsetP;
	if( editor.style ) offsetP = editor.offsetParent;
	else offsetP = editor.Table.offsetParent;
	while( obj != null && obj != offsetP ) {
		x += obj.offsetLeft + obj.clientLeft;
		y += obj.offsetTop + obj.clientTop;
		obj = obj.offsetParent;
	}
	var div = cell.parentElement;
	while( div.tagName != "DIV" || div.id == "div_" + cell.id.substring( 0, cell.id.lastIndexOf( "_" ) ) ) div = div.parentElement;
	x = x - div.scrollLeft;
	y = y - div.scrollTop;
	
	var dx = div.offsetLeft, dy = div.offsetTop;
	obj = div.offsetParent;
	while( obj != null && obj != offsetP ) {
		dx += obj.offsetLeft + obj.clientLeft;
		dy += obj.offsetTop + obj.clientTop;
		obj = obj.offsetParent;
	}
	switch( cell.editStyle ) {
		case "2":
		case "3":
			if( x < dx || y < dy || x + cell.offsetWidth > dx + div.offsetWidth || y + cell.offsetHeight > dy + div.offsetHeight ) {
				if( cell.offsetWidth < div.offsetWidth && cell.offsetHeight < div.offsetHeight ) {
					_submitEditor( table );
					return;
				}
			}
			editor.setLeft( x );
			editor.setTop( y );
			break;
		default:
			if( x < dx || y < dy || x + cell.offsetWidth > dx + div.offsetWidth || y + cell.offsetHeight > dy + div.offsetHeight ) {
				if( cell.offsetWidth < div.offsetWidth && cell.offsetHeight < div.offsetHeight ) {
					_submitEditor( table );
					return;
				}
			}
			editor.style.left = x;
			editor.style.top = y;
	}	
}

function _resizeScroll() {
	var name, div;
	var divs = _lookupDiv( document.body );
	for( var i = 0; i < divs.length; i++ ) {
		div = divs[i];
		var pos = div.id.indexOf( "_scrollArea" );
		name = div.id.substring( 0, pos );
		var W = div.clientWidth;
		var H = div.clientHeight;
		var leftW = 0, topH = 0;
		var contentDiv = document.getElementById( name + "_contentdiv" );
		var contentTable = document.getElementById( name );
		var contentW = contentTable.offsetWidth;
		var contentH = contentTable.offsetHeight;
		var topDiv = document.getElementById( name + "_topdiv" );
		if( topDiv != null ) {
			var topH = document.getElementById( name + "_$_top" ).offsetHeight;
		}
		var leftDiv = document.getElementById( name + "_leftdiv" );
		if( leftDiv != null ) {
			var leftW = document.getElementById( name + "_$_left" ).offsetWidth;
		}
		var cw = W - leftW < 0 ? 0 : W - leftW;
		contentDiv.style.width = cw;
		contentDiv.style.height = H - topH < 0 ? 0 : H - topH;
		
		if( topDiv != null ) {
			var topW = W - leftW;
			if( H - topH < contentH ) topW -= contentDiv.offsetWidth - contentDiv.style.borderLeftWidth - contentDiv.style.borderRightWidth - contentDiv.clientWidth;
			if( topW < 0 ) topW = 0;
			//if( topW > contentW ) topW = contentW;
			topDiv.style.width = topW;
		}
		if( leftDiv != null ) {
			var leftH = H - topH;
			if( W - leftW < contentW ) leftH -= contentDiv.offsetHeight - contentDiv.style.borderTopWidth - contentDiv.style.borderBottomWidth - contentDiv.clientHeight;
			if( leftH < 0 ) leftH = 0;
			leftDiv.style.height = leftH;
		}
	}
}

function _lookupDiv( obj ) {
	var child;
	var divs = new Array();
	for( var i = 0; i < obj.childNodes.length; i++ ) {
		child = obj.childNodes[i];
		if( child.tagName == "DIV" ) {
			if( child.id != null && child.id.indexOf( "_scrollArea" ) > 0 ) divs[ divs.length ] = child;
		}
		var subdivs = _lookupDiv( child );
		for( var k = 0; k < subdivs.length; k++ ) {
			divs[ divs.length ] = subdivs[k];
		}
	}
	return divs;
}

function getHeightX( obj ) {
	var child, h = 0;
	for( var i = 0; i < obj.childNodes.length; i++ ) {
		child = obj.childNodes[i];
		if( child.tagName == "DIV" ) {
			if( child.className ==  "report1" ) return child.offsetHeight;
		}
		h = getHeightX( child );
		if( h > 0 ) return h;
	}
	return h;
}
